# unzip-stream

Streaming cross-platform unzip tool written in node.js.

This package is based on [unzip](https://github.com/EvanOxfeld/node-unzip) (and its fork [unzipper](https://github.com/ZJONSSON/node-unzipper)) and provides simple APIs for parsing and extracting zip files. It uses new streaming engine which allows it to process also files which would fail with unzip.
There are no added compiled dependencies - inflation is handled by node.js's built in zlib support.

Please note that the zip file format isn't really meant to be processed by streaming, though this library should succeed in most cases, if you do have complete zip file available, you should consider using other libraries which read zip files from the end - as originally intended (for example [yauzl](https://github.com/thejoshwolfe/yauzl) or [decompress-zip](https://github.com/bower/decompress-zip)).

## Installation

```bash
$ npm install unzip-stream
```

## Quick Examples

### Parse zip file contents

Process each zip file entry or pipe entries to another stream.

__Important__: If you do not intend to consume an entry stream's raw data, call autodrain() to dispose of the entry's
contents. Otherwise the stream will get stuck.

```javascript
fs.createReadStream('path/to/archive.zip')
  .pipe(unzip.Parse())
  .on('entry', function (entry) {
    var filePath = entry.path;
    var type = entry.type; // 'Directory' or 'File'
    var size = entry.size; // might be undefined in some archives
    if (filePath === "this IS the file I'm looking for") {
      entry.pipe(fs.createWriteStream('output/path'));
    } else {
      entry.autodrain();
    }
  });
```

### Parse zip by piping entries downstream

If you `pipe` from unzip-stream the downstream components will receive each `entry` for further processing.   This allows for clean pipelines transforming zipfiles into unzipped data.

Example using `stream.Transform`:

```js
fs.createReadStream('path/to/archive.zip')
  .pipe(unzipper.Parse())
  .pipe(stream.Transform({
    objectMode: true,
    transform: function(entry,e,cb) {
      var filePath = entry.path;
      var type = entry.type; // 'Directory' or 'File'
      var size = entry.size;
      if (filePath === "this IS the file I'm looking for") {
        entry.pipe(fs.createWriteStream('output/path'))
          .on('finish',cb);
      } else {
        entry.autodrain();
        cb();
      }
    }
  }
  }));
```

### Extract to a directory
```javascript
fs.createReadStream('path/to/archive.zip').pipe(unzip.Extract({ path: 'output/path' }));
```

Extract emits the 'finish' (also 'close' for compatibility with unzip) event once the zip's contents have been fully extracted to disk.

### What's missing?

Currently only ZIP files up to version 2.1 are supported - which means no Zip64 support. There's also no support for encrypted (password protected) zips, or symlinks.
