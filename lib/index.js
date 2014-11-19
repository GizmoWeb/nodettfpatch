#!/usr/bin/env node

/*
 * nodeTTFPatch
 * https://github.com/GizmoWeb/nodeTTFPatch
 *
 * Copyright (c) 2014 GizmoWeb
 * Licensed under the LICENSE.md license.
 */

'use strict';

var woktools = require('./woktools.js');
var fs = require('fs');
//var Buffer = require('buffer').Buffer;
var filename,
	fontfile,
	filePosition,
	tab_fsType_pos,	// offset of fsType in TTF file
	tab_fsType,	// <<<--- We will change THIS !!!
	ttf_filesize,
	ttf_allbytes;

function ttfpatch(fPath , wType) {
	
	filename = fPath;

	console.log("\n\nTTFPATCH - node.js porting v1.0 - (C) by Wolfram Esser [wok@derwok.de] 2001-02-23");

	if (fPath == null && wType == null)	// usage
	{
		console.log ("Provides an easy way for font designers to set the 'embeddable' flags");
		console.log ("of their own true type fonts. If you want to prohibit embedding of your");
		console.log ("font e.g. in Acrobat PDF files, simply run: 'ttfpatch myfont.ttf 2'\n");
		console.log ("Usage: ttfpatch TrueTypeFontFile [NewFsTypeValue]");
		console.log ("\n");
		console.log ("fsType values:");
		console.log ("       0: embedding for permanent installation");
		console.log ("       1: reserved - do not use!");
		console.log ("       2: embedding restricted (not allowed!)");
		console.log ("       4: embedding for preview & printing allowed");
		console.log ("       8: embedding for editing allowed");
		return;
	}
	//
	try{
		var wanted_fsType;
		
		fontfile = fs.openSync(filename,'r');
		filePosition = 0;
		
		console.log ("\n");
		console.log ("- Opened: %s", filename);
			
		if(readheader()){
			fs.closeSync(fontfile);
			return;
		}
		if(wType != null)	//  user wants to change fsType
		{
			wanted_fsType = decToHexStr(parseInt(wType,10),2);
			console.log("- Wanted fsType: hex:'%s'", wanted_fsType);
			printlicencebits(wanted_fsType);

			if("0x" + wanted_fsType & 0x0001)	// allowed bit combination?
			{
				console.log ("\nError: fsType & 0x0001 bit is reserved. must be zero!");
				fs.closeSync(fontfile);
				return;
			}

			// allowed bit combination?
			if(("0x" + wanted_fsType & 0x0002) && (("0x" + wanted_fsType & 0x0004) || ("0x" + wanted_fsType & 0x0008)))
			{
				console.log ("\nError: fsType & 0x0002 bit set, and (embedding allowed 0x0004 or 0x0008)");
				fs.closeSync(fontfile);
				return;
			}

			// anything to change???
			if(wanted_fsType == tab_fsType)
			{
				console.log ("\nNothing to do... wanted fsType %d already stored in TTF file!", wType);
				fs.closeSync(fontfile);
				return;
			}


			// OK - now read the WHOLE TTF file into memory
			console.log ("- TTF filesize: '%d' bytes", ttf_filesize);

			//fseek(fontfile, 0, SEEK_SET);				// rewind
			try{
				ttf_allbytes = new Buffer(ttf_filesize);	// get memory to hold the fonts bytes
			}catch(e){
				console.log ("\nError: Internal error: could not get enough memory for file");
				fs.closeSync(fontfile);
				return;
			}

			// now read all the bytes
			var bytesread = fs.readSync(fontfile, ttf_allbytes, 0, ttf_filesize,0);//fread(ttf_allbytes, 1, ttf_filesize, fontfile);

			if(bytesread != ttf_filesize)
			{
				console.log ("\nError: Could not read %d bytes from fontfile (read: %d)", ttf_filesize, bytesread);
				fs.closeSync(fontfile);
				return;
			}
			console.log("- OK: read: '%d' bytes from file\n", bytesread);

			// now store the new value
			var Pwanted_fsType = parseInt(wType,10);
			ttf_allbytes[tab_fsType_pos+1] = Pwanted_fsType;	// swap bytes for big-endian!
			ttf_allbytes[tab_fsType_pos] = 0;
			

			// reopen file - now for writing!!!
			fs.closeSync(fontfile);
			try{
				fontfile = fs.openSync(filename,'w');//fopen(filename, "wb");
			}catch(err){
				console.log ("\nError: Could not open fontfile '%s' for writing", filename);
				return;
			}
			var byteswritten = fs.writeSync(fontfile, ttf_allbytes, 0, ttf_filesize, 0);//fwrite(ttf_allbytes, 1, ttf_filesize, fontfile);
			
			if(byteswritten != ttf_filesize)
			{
				console.log ("\nError: Could not write %d bytes to fontfile (written: %d)", ttf_filesize, byteswritten);
				fs.closeSync(fontfile);
				return;
			}
			console.log("- OK: written: '%d' bytes to file\n", byteswritten);

		}
		else
		{
			console.log("\nNothing changed! - No new fsType value specified");
			console.log("Run program without any arguments to get usage hints");
		}
		return;
	}catch(err){
		console.log ("\nError: Could not open fontfile '%s' for reading", filename);
		return;
	}
	/**
	 *
	 */
	function readheader(){
		var version,numtables,dummy,taboffset,tabversion;
		
		version = readFile("BE",4,null,'hexStr');
		
		console.log ("- Fileformat version: hex: '%s'", version);
		if ("0x" + version != 0x00010000)
		{
			console.log ("\nError: Fileformat version must be '0x00010000'");
			return true;
		}
		numtables = readFile("BE",2);
		console.log ("- Number of Infotables: %d" , numtables);
		if (numtables <= 9)
		{
			console.log ("\nError: numtables must be greater than '9'");
			return true;
		}
		
		dummy = readFile("BE",2);	// search range - not needed
		dummy = readFile("BE",2);	// entry selector - not needed
		dummy = readFile("BE",2);	// range shift - not needed
		
		var found_os2_table = 0;
		var tables_checked = 0;
		var tabtag =  new Buffer(5);
		while (tables_checked < numtables && !found_os2_table)
		{
			var bytesRead = fs.readSync(fontfile, tabtag, 0, 4); // read the table-name (we look for 'OS/2')
			filePosition+=bytesRead;
			tabtag[4] = "\0";
			dummy = readFile("BE",4);	// checksum - not needed
			taboffset = readFile("BE",4);	// we need THIS!
			dummy = readFile("BE",4);	// length - not needed
			if ( tabtag.toString().replace(/\0/g,"") == "OS/2")
			{
				console.log ("- Found 'OS/2' table");
				found_os2_table = 1;
			}
			tables_checked ++;
		}
		
		console.log("- Tableoffset: hex:'%s'",decToHexStr(taboffset,4));
		
		tabversion =  readFile("BE",2,taboffset,'hexStr');
		
		if( "0x" + tabversion != 0x0001)
		{
			// OS/2 table versions: 0 - TrueType rev 1.5; 1 - TrueType rev 1.66; 2 - OpenType rev 1.2;
			//                      3 - OpenType rev 1.4; 4 - OpenType rev 1.6
			if(("0x" + tabversion == 0x0000) || ("0x" + tabversion == 0x0002) || ("0x" + tabversion == 0x0003) || ("0x" + tabversion == 0x0004))
			{
				console.log ("\nWarning: OS/2 tableversion is not '0x0001' but hex:%s", tabversion);
			}
			else
			{
				console.log ("\nError: OS/2 tableversion must be between 0 and 4 and is hex:%s", tabversion);
				return 1;
			}
		}

		dummy = readFile("BE",2);// average char width - not needed
		dummy = readFile("BE",2);	// weight class - not needed
		dummy = readFile("BE",2);	// widht class - not needed
		
		tab_fsType_pos = filePosition;	// remember 0-based position of fsType (16 bit)
		
		/////////////////////////////
		tab_fsType = readFile("BE",2,null,'hexStr');	// <<<--- We will change THIS !!!
		/////////////////////////////

		console.log ("- Curret fsType: hex:'%s'", tab_fsType);
		
		printlicencebits(tab_fsType);

		var fstats = fs.statSync(fPath);
		
		ttf_filesize = fstats["size"];
		
		return false;
	}
	/**
	 *
	 */
	function readFile(type,bSize,position,format){
		var retval = woktools["read"+type+bSize](fontfile,position);
		if(format == "hexStr"){
			retval = decToHexStr(retval,bSize);
		}
		if(position!=null){
			filePosition = position;
		}
		filePosition+=bSize;
		
		return retval;
	}
	/**
	 *
	 */
	function printlicencebits(fstype)
	{
		if ("0x"+fstype == 0x0000){
			console.log ("       0: embedding for permanent installation allowed");
		}
		if ("0x"+fstype & 0x0001 == 0x0001){
			console.log ("       1: reserved - not to be used, must be zero!");
		}
		if ("0x"+fstype & 0x0002){
			console.log ("       2: embedding restricted (not allowed, at all!)");
		}
		if ("0x"+fstype & 0x0004){
			console.log ("       4: embedding for preview & printing allowed");
		}
		if ("0x"+fstype & 0x0008){
			console.log ("       8: embedding for editing allowed");
		}
	}
	/**
	 *
	 */
	function decToHexStr(d, b) {
	  for (var a = "", c = 0;c < b;c++) {
		a += "00";
	  }
	  return(a + d.toString(16)).substr(-(2 * b));
	}
}

module.exports = ttfpatch;