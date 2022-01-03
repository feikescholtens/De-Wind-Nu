var hdf5 = require('hdf5').hdf5;

var Access = require('hdf5/lib/globals').Access;
var file = new hdf5.File('CDF.h5', Access.ACC_RDONLY);
var group = file.openGroup('ff');

console.log(group)