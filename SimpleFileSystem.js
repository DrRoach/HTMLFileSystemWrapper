var SimpleFileSystem = function(size, type) {
    //Make sure we're using the correct request call
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

    //Store this in self so we can store data in object
    var self = this;
    //Request that the filesystem is created
    window.requestFileSystem(type, size, function(fileSystem) {
        self.fileSystem = fileSystem;

        //Create and dispatch custom event so we know the file system is ready
        var event = new CustomEvent('FileSystemReady', {
            detail: {
                files: {
                    create: self.files.create,
                    write: self.files.write,
                    remove: self.files.remove,
                    read: self.files.read
                },
                self: self
            }
        });
        document.dispatchEvent(event);
    });

    //Add event listener to document so we know when file system is ready
    document.addEventListener('FileSystemReady', SimpleFileSystem.runStacks, false);

    //Array to store list of files to be created after file system is ready
    this.files = {
        create: [],
        write: [],
        remove: [],
        read: []
    };
};

SimpleFileSystem.prototype.create = function(file) {
    //Check to see if the file system has been created yet
    if (typeof this.fileSystem == "undefined") {
        //File system hasn't been created, store the file to be created later
        SimpleFileSystem.push(this, "create", {
            name: file,
            cb: create
        });
    } else {
        //Create file using String
        create(this, {
            data: {
                name: file
            }
        });
    }

    function create(self, ret) {
        //Create the file
        self.fileSystem.root.getFile(ret.data.name, {create: true}, function(fileEntry) {});
    }
};

SimpleFileSystem.prototype.write = function(fileName, data, position, create, callback) {
    //Set default action of position to append
    //Can't use shorthand for this due to FileSystem.OVERWRITE being 0
    if (typeof position == "undefined") {
        position = position || SimpleFileSystem.APPEND;
    }
    //Set default action of create to true
    create = create || true;

    if (typeof this.fileSystem == "undefined") {
        //File system hasn't been created yet. Store the data to be saved later
        SimpleFileSystem.push(this, "write", {
            name: fileName,
            data: data,
            position: position,
            create: create,
            cb: write
        });
    } else {
        //File system is ready. Write to the file
        write(this, {
            data: {
                create: create,
                data: data,
                name: fileName,
                position: position
            }
        });
    }

    function write(self, ret) {
        //Get the file that we're about to write to
        self.fileSystem.root.getFile(ret.data.name, {create: ret.data.create}, function(fileEntry) {
            //Create the file writer
            fileEntry.createWriter(function(writer) {
                //Make sure the file writer is in the right position
                if (ret.data.position == SimpleFileSystem.END) {
                    //Move the writer to the EOF
                    writer.seek(writer.length);
                } else {
                    //Put the writer at the start of the file
                    writer.seek(0);
                }

                //Write the required data into the file
                writer.write(new Blob([ret.data.data]));
                //When the writer is done, destroy it
                writer.onwriteend = function() {
                    writer.abort();
                    if (typeof callback != "undefined") {
                        callback();
                    }
                }
            });
        });
    }
};

SimpleFileSystem.prototype.remove = function(file) {
    //Check to see if the file system has been created yet
    if (typeof this.fileSystem == "undefined") {
        //File system hasn't been created, store the file to be created later
        SimpleFileSystem.push(this, "remove", {
            file: file,
            cb: remove
        })
    } else {
        //Create file using String
        remove(this, {
            data: {
                file: file
            }
        });
    }

    function remove(self, ret) {
        //Remove the file
        self.fileSystem.root.getFile(ret.data.file, {create: true}, function(fileEntry) {
            fileEntry.remove(function(e){});
        });
    }
};

SimpleFileSystem.prototype.read = function(file, callback) {
    //Check to see if the file system has been created
    if (typeof this.fileSystem == "undefined") {
        //File system hasn't been created, store the file to be created later
        SimpleFileSystem.push(this, "read", {
            file: file,
            callback: callback,
            cb: read
        });
    } else {
        read(this, {
            data: {
                file: file
            }
        });
    }

    function read(self, ret) {
        //Get the file to read
        self.fileSystem.root.getFile(ret.data.file, {}, function(fileEntry) {
            fileEntry.file(function(file) {
                //Create reader to read file
                var reader = new FileReader();

                //When done reading, call the callback, passing the text
                reader.onloadend = function() {
                    ret.data.callback(this.result);
                };

                //Read the file
                reader.readAsText(file);
            });
        });
    }
};

SimpleFileSystem.PERSISTENT = window.PERSISTENT;
SimpleFileSystem.TEMPORARY = window.TEMPORARY;

SimpleFileSystem.BEGINNING = 0;
SimpleFileSystem.END = 1;

SimpleFileSystem.runStacks = function(data) {
    var methods = [
        "create",
        "write",
        "remove",
        "read"
    ];

    for (var i = 0; i < methods.length; i++) {
        SimpleFileSystem.stack(data.detail.self, methods[i], data.detail.files[methods[i]]);
    }
};

SimpleFileSystem.push = function(self, func, data) {
    var store = {
        data: data
    };
    self.files[func].push(store)
};

SimpleFileSystem.stack = function(self, func, data, cb) {
    for (var i = 0; i < data.length; i++) {
        data[i].data.cb(self, data[i]);
    }
};