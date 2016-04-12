var FileSystem = function(size, type) {
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
                    remove: self.files.remove
                },
                self: self
            }
        });
        document.dispatchEvent(event);
    });

    //Add event listener to document so we know when file system is ready
    document.addEventListener('FileSystemReady', FileSystem.runStacks, false);

    //Array to store list of files to be created after file system is ready
    this.files = {
        create: [],
        write: [],
        remove: []
    };
};

FileSystem.prototype.create = function(file) {
    //Check to see if the file system has been created yet
    if (typeof this.fileSystem == "undefined") {
        //File system hasn't been created, store the file to be created later
        FileSystem.push(this, "create", {
            name: file,
            cb: create
        });
    } else {
        //Create file using String
        create(this, {data: {name: file }});
    }

    function create(self, ret) {
        //Create the file
        self.fileSystem.root.getFile(ret.data.name, {create: true}, function(fileEntry) {});
    }
};

FileSystem.prototype.write = function(fileName, data, position, create) {
    //Set default action of position to append
    //Can't use shorthand for this due to FileSystem.OVERWRITE being 0
    if (typeof position == "undefined") {
        position = position || FileSystem.APPEND;
    }
    //Set default action of create to true
    create = create || true;

    if (typeof this.fileSystem == "undefined") {
        //File system hasn't been created yet. Store the data to be saved later
        FileSystem.push(this, "write", {
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
                if (ret.data.position == FileSystem.END) {
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
                }
            });
        });
    }
};

FileSystem.prototype.remove = function(file) {
    //Check to see if the file system has been created yet
    if (typeof this.fileSystem == "undefined") {
        //File system hasn't been created, store the file to be created later
        FileSystem.push(this, "remove", {
            file: file,
            cb: remove
        })
    } else {
        //Create file using String
        remove(this, file);
    }

    function remove(self, ret) {
        //Remove the file
        self.fileSystem.root.getFile(ret.data.file, {create: true}, function(fileEntry) {
            fileEntry.remove(function(e){});
        });
    }
};

FileSystem.PERSISTENT = window.PERSISTENT;
FileSystem.TEMPORARY = window.TEMPORARY;

FileSystem.BEGINNING = 0;
FileSystem.END = 1;

FileSystem.runStacks = function(data) {
    var methods = [
        "create",
        "write",
        "remove"
    ];

    for (var i = 0; i < methods.length; i++) {
        FileSystem.stack(data.detail.self, methods[i], data.detail.files[methods[i]]);
    }
};

FileSystem.push = function(self, func, data) {
    var store = {
        data: data
    };
    self.files[func].push(store)
};

FileSystem.stack = function(self, func, data, cb) {
    for (var i = 0; i < data.length; i++) {
        data[i].data.cb(self, data[i]);
    }
};