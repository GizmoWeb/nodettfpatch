var fs = require('fs');

module.exports.readBE4 = function (inFile,position)				// big-Endian: RISC-style, 4 byte
{
	var buffer = new Buffer(4);
    var bytesRead = fs.readSync(inFile, buffer, 0, 4,position);
	var retval = (buffer[0]<<24) 
		| (buffer[1]<<16) 
		| (buffer[2]<<8) 
		| (buffer[3]);
	if(bytesRead != null){
		return retval;
	}else{
		return  null;
	}
};
module.exports.readBE2 = function (inFile,position)				// big-endian: RISC-style, 2 byte
{
	var buffer = new Buffer(2);
    var bytesRead = fs.readSync(inFile, buffer, 0, 2,position);
	var retval = (buffer[0]<<8) 
		| (buffer[1]);
	if(bytesRead != null){
		return retval;
	}else{
		return  0;
	}
};