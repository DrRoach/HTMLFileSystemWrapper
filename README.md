HTML 5 File System Wrapper
===

This wrapper is to make developers lives' easier.

[GitHub io page](http://drroach.github.io/HTMLFileSystemWrapper/)

A simple wrapper that I created so that it is easier to use the HTML file system. The HTML API for the file system 
is awkward, confusing and badly documented. This wrapper enables you to start writing to files on the clients machine 
in just two lines of code.

#Getting Started
Just include the `SimpleFileSystem.js` file in your project and have instant access to the `SimpleFileSystem` object.

Example:

```JS
<script src="SimpleFileSystem.js"></script>
...
<script>
var fs = new SimpleFileSystem(50*1024*1024 /*5MB*/, SimpleFileSystem.PERSISTENT);
</script>
```

##Basic Usage

Create a new file:

```JS
var fs = new SimpleFileSystem(500*1024*1024 /*50MB*/, SimpleFileSystem.TEMPORARY);
fs.create("newFile.json");
```

##"Advanced" Usage

Storing JSON in a file:

```JS
fs.write("data.json", JSON.stringify({
    name: "Ryan",
    age: 20,
    occupation: "Student"
}));
```

Reading from a file (using previous file example):

```JS
fs.read("data.json", function(r) {
    r = JSON.parse(r);
    console.log(r.name); //Ryan
    console.log(r.age); //20
    console.log(r.occupation); //Student
});
```

###Methods

####SimpleFileSystem

```JS
SimpleFileSystem(size, storageType)
```

The constructor that's called when requesting a file system. The size is the 
requested size of the virtual file system in bytes. The storage type can be one of two: `SimpleFileSystem.PERSISTENT` or 
`SimpleFileSystem.TEMPORARY`.

####create

```JS
create(filename)
```

Create a file. Pass a desired name as a string.

####write

```JS
write(filename, text, position, createFile, callback)
```

Write text to a file. The filename that you give is the file that will 
be written to. If it doesn't exist, and createFile is true (default), then the file will be created. The `text` variable 
is pretty self explanatory. The position is where in the file you want to start writing. Two possibilities are: 
`SimpleFileSystem.START` and `SimpleFileSystem.END`. The callback is an optional callback to be called when write has 
successfully finished.

####remove

```JS
remove(filename)
```

Delete a file. Pass the files' name as a string.

####read

```JS
read(filename, callback)
```

Read the text from a given file and then run the callback. The only parameter passed to the 
callback is the contents of the file.

##Notes
Because this project is in alpha, there is a very strong chance that backwards compatibility may not always be a forethought. 
I'm sorry about this, but as soon as a BETA tag is added, this problem will become obsolete.
