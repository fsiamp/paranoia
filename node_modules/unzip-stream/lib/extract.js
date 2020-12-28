var path = require('path');
var util = require('util');
var Writer = require('fstream').Writer;
var ParserStream = require('./parser-stream');

function Extract (opts) {
  if (!(this instanceof Extract))
    return new Extract(opts);

  var self = this;

  ParserStream.call(self,opts);

  self.on('data', function(entry) {
    if (entry.isDirectory) return;
    entry.pipe(Writer({
      path: path.join(opts.path,entry.path)
    }))
    .on('error',function(e) {
      self.emit('error',e);
    });
  });
}

util.inherits(Extract, ParserStream);

module.exports = Extract;