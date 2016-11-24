#!/usr/bin/env node

/*
 * nodettfpatch
 * https://github.com/GizmoWeb/nodettfpatch
 *
 * Copyright (c) 2014 GizmoWeb
 * Licensed under the LICENSE.md license.
 */

'use strict';
var ttfpatch = require('./index.js');

var argOff = -1;
if(process.argv[0] === "node"){
	argOff = 0;
}

ttfpatch( process.argv[2-argOff] , process.argv[3-argOff]);