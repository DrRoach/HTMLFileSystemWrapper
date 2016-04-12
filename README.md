HTML 5 File System Wrapper
===

This wrapper is to make developers lives' easier.

A simple wrapper that I created so that it is easier to use the HTML file system. The HTML API for the file system 
is awkward, confusing and badly documented. This wrapper enables you to start writing to files on the clients machine 
in just two lines of code.

##Getting Started
Just include the `FileSystem.js` file in your project and have instant access to the `FileSystem` object.

Example:

```JS
<script src="FileSystem.js"></script>
...
<script>
var fs = new FileSystem(50*1024*1024 /*5MB*/, FileSystem.PERSISTENT);
</script>
```

###Basic Usage

Create a new file:

```JS
var fs = new FileSystem(500*1024*1024 /*50MB*/, FileSystem.TEMPORARY);
fs.create("newFile.json");
```

###"Advanced" Usage

Storing JSON in a file:

```JS
var fs = new FileSystem(500*1024*1024 /*50MB*/, FileSystem.PERSISTENT);
fs.write("data.json", JSON.stringify({
    name: "Ryan",
    age: 20,
    occupation: "Student"
}));
```

Reading from a file (using previous file example):

```JS
var fs = new FileSystem(500*1024*1024 /*50MB*/, FileSystem.PERSISTENT);
fs.read("data.json", function(r) {
    r = JSON.parse(r);
    console.log(r.name); //Ryan
    console.log(r.age); //20
    console.log(r.occupation); //Student
});
```

####Methods

`FileSystem(size, storageType)` - The constructor that's called when requesting a file system. The size is the 
requested size of the virtual file system in bytes. The storage type can be one of two: `FileSystem.PERSISTENT` or 
`FileSystem.TEMPORARY`.

`create(filename)` - Create a file. Pass a desired name as a string.

`write(filename, text, position, createFile)` - Write text to a file. The filename that you give is the file that will 
be written to. If it doesn't exist, and createFile is true (default), then the file will be created. The `text` variable 
is pretty self explanatory. The position is where in the file you want to start writing. Two possibilities are: 
`FileSystem.START` and `FileSystem.END`.

`remove(filename)` - Delete a file. Pass the files' name as a string.

`read(filename, callback)` - Read the text from a given file and then run the callback. The only parameter passed to the 
callback is the contents of the file.

###Notes
Because this project is in alpha, there is a very strong chance that backwards compatibility may not always be a forethought. 
I'm sorry about this, but as soon as a BETA tag is added, this problem will become obsolete.
