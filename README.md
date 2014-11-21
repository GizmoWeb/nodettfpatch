# nodeTTFPatch

"Brutal" TTFPATCH - node.js porting v1.0 - (C) by Wolfram Esser [wok@derwok.de] 2001-02-23. This is only a "translation" in node.js of this useful project http://www.derwok.de/downloads/ttfpatch/ and related fork https://github.com/rmuch/ttfpatch

## Getting Started
Install the module with:

``` bash
npm install -g nodeTTFPatch
```

## How to use

- `filePath` - TTF font path
- `wantedFontType` - values:
-- 0: embedding for permanent installation
-- 1: reserved - do not use!
-- 2: embedding restricted (not allowed!)
-- 4: embedding for preview & printing allowed
-- 8: embedding for editing allowed
Hint: fsType values can be added. So a fsType value of '12' (which is 4 + 8) means set 'embedding for preview&printing allowed' and set 'embedding for editing allowed'.

#### Using from CLI

``` bash
ttfpatch filePath wantedFontType
```

#### Using in script

```javascript
var ttfpatch = require('nodeTTFPatch');
ttfpatch();	//for module help
ttfpatch(filePath);	//for font file check filetype
ttfpatch(filePath,wantedFontType); //for modify font file type
```

# TTFPatch Patches and Builds

## Introduction

Ever wanted to embed a freely licensed font into your web page, for example as a local mirror of a Google Web Font, but you were presented with an error message like `@font-face failed OpenType embedding permission check. Permission must be Installable.` from Internet Explorer?

Do you have the right to use a font, but due to technical error, the font has been built with the wrong permission flag?

Are you a font author who wants to change the permission flag on their font?

This tool is here to help.

## About

TTFPatch was created by Wolfram Eßer, for modifying the font embedding licensing flag flag of TTF fonts.

This project is based on TTFPatch, updated to build with Visual Studio 2013 and to allow modification of permission flags of fonts conforming to OpenType rev 1.4 and 1.6 specifications.

## Disclaimer

Please be mindful of whether you are within your rights to make modifications to the font file. This tool is intended to be used by font authors and other permitted individuals who wish to set and change permission flags on their fonts.

Be aware that this application directly modifies the font file and may destructively alter the font. Always keep a backup of the original font file.

Further disclaimer terms apply to this product. For more information, see the license file.

## License

Licensing information is contained in `LICENSE.md`. To read the original licensing terms for this project, please see `docs/ttfpatch-1.0-readme.txt`.

## Links

 * [TTFPATCH by Wolfram Eßer](http://www.derwok.de/downloads/ttfpatch/)
