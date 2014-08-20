function CustomGenerator(code) {
    this.generatorRawCode = code;
    /**
       ["version"]: Version of the code
       ["blocks"]: A list of object [("blockId", numberLayer)]
       ["biomes"]: A list of biome
       ["structures"]: List of generated structures
    */
    this.objectCode = {};

    this.compile = function() {
	var rawCode = "";

	if( this.objectCode["version"] ) {
	    rawCode = this.objectCode["version"] + ";";
	} else {
	    //The compilation cannot success if the version is not defined
	    //Which probaly means there is nothing to compile
	    throw "Custom Code Compilation aborted, nothing to compile";
	}

	if( this.objectCode["blocks"] ) {	    
	    blocksCode = this.compileBlocks(this.objectCode["blocks"]);
	    rawCode += blocksCode;
	}

	if( this.objectCode["biomes"] ) {
	    rawCode += ";";
	    var biomesCode = this.objectCode["biomes"].join();
	    rawCode += biomesCode;	    
	}

	if( this.objectCode["structures"] ) {
	    rawCode += ";";
//	    var structuresCode = this.objectCode["structures"].join();
	    var structuresCode = this.compileStructures(this.objectCode["structures"]);
	    rawCode += structuresCode;
	}
	this.generatorRawCode = rawCode;
	return rawCode;
    }

    this.decompile = function() {
	var splitted = this.generatorRawCode.split(";");
	splitted = this.removeEmptyIndexes(splitted);

	if( splitted.length >= 1 ) {
	    this.objectCode["version"] = splitted[0];
	}

	if( splitted.length >= 2 ) {
	    var blocksSplitted = splitted[1].split(",");
	    var blocksList = this.createBlocksList(blocksSplitted);
	    this.objectCode["blocks"] = blocksList;
	}

	if( splitted.length >= 3 ) {
	    this.objectCode["biomes"] = splitted[2].split(",");
	}

	if( splitted.length >= 4 ) {
	    //@todo: Décomposer les paramètres des structures si possible
	    this.objectCode["structures"] = splitted[3].split(",");
	}
    }
    
    /**
       This function returns the "blocks" object from a splitted list
    */
    this.createBlocksList = function(blocksList) {
	var blocks = new Array();
	
	for( var i = 0; i < blocksList.length; i++ ) {
	    var block = blocksList[i];
	    var splitted = block.split("x");

	    if(splitted.length > 1) {
		var obj = {
		    "blockId": splitted[1],
		    "numberLayer": parseInt(splitted[0], 10)
		};
		blocks.push(obj);
	    } else if(splitted.length == 1) {
		var obj = {
		    "blockId": block
		};
		blocks.push(obj);
	    }	    
	}
	return blocks;
    }

    this.createStructuresObject = function(structures) {
	console.log(structures);
    }

    this.compileStructures = function(structureObject) {
	var structureCode = "";
	var objectSize = Object.size(structureObject);
	var k = 0;
	for( var rootStructKey in structureObject ) {
	    var structure = structureObject[rootStructKey];
	    var name = structure["name"];
	    var parametersNumber = structure["parametersNumber"];
	    
	    structureCode += name;
	    
	    if( parametersNumber > 0 ) {
		structureCode += "(";
		var i = 0;
		var parameters = structure["parameters"];
		for( var paramKey in parameters ) {
		    var parameterObj = parameters[paramKey];
		    var value = parameterObj["value"];
		    structureCode += paramKey + "=" + value

		    if( i < parametersNumber - 1 ) {
			structureCode += " ";
		    }

		    i++;
		}
		structureCode += ")";
	    }
	    
	    if( k < objectSize - 1 ) {
		structureCode += ",";
	    }
	    
	    k++;
	}
	return structureCode;
    }

    /**
       Compile the blocks array to a raw format
    */
    this.compileBlocks = function(blocksList) {
	var blockCode = "";
	if( blocksList instanceof Array ) {
	    for( var i = 0; i < blocksList.length; i++ ) {
		var obj = blocksList[i];
		var numberLayer = -1;
		if( obj["numberLayer"] ) {
		    numberLayer = obj["numberLayer"];
		}

		var blockId = obj["blockId"];
		var tmp = "";
		if( numberLayer > 1 ) {
		    tmp = numberLayer + "x";
		}
		
		tmp += blockId;

		if( i < blocksList.length - 1 ) {
		    tmp += ",";
		}
		blockCode += tmp;
	    }
	} else {
	    throw "Cannot compile blocks, blocksList is not an Array";
	    
	}
	return blockCode;
    }

    /**
       This function remove the empty indexes (string,undefined) 
       of a regular array
    */
    this.removeEmptyIndexes = function(array) {
	var newArray = new Array();
	for( var i = 0; i < array.length; i++ ) {
	    if( array[i] != undefined && array[i] != "" ) {
		newArray.push(array[i]);
	    }
	}
	return newArray;
    }

    this.findFirstOfBlocks = function(blockId) {
	for(var i = 0; i < this.objectCode["blocks"].length; i++) {
	    var block = this.objectCode["blocks"][i];
	    if( block["blockId"] === blockId ) {
		return i;
	    }
	}
	return -1;
    }

    this.findLastOfBlocks = function( blockId ) {
	for( var i = this.objectCode["blocks"].length - 1; i >= 0; i-- ) {
	    var block = this.objectCode["blocks"][i];
	    if( block["blockId"] === blockId ) {
		return i;
	    }
	}
	return -1;
    }

    this.decompile();
}

CustomGenerator.prototype.getFormattedCode = function() {
    return this.objectCode;
}

CustomGenerator.prototype.setRawCode = function(code) {
    this.generatorRawCode = code;
    this.decompile();
}

CustomGenerator.prototype.getRawCode = function() {
    return this.compile();
}

CustomGenerator.prototype.addBlock = function(block, numberLayers) {
    numberLayers = parseInt(numberLayers, 10);

    if( typeof block === "number") {
	block = block.toString();
    }

    var obj = {
	"blockId": block
    };

    if( numberLayers !== undefined && numberLayers > 0 ) {
	obj["numberLayer"] = numberLayers;
    }
    
    // If the blocks section does not exists, we create it
    if( !this.objectCode["blocks"] ) {
	this.objectCode["blocks"] = new Array();
    }

    this.objectCode["blocks"].push(obj);
}

CustomGenerator.prototype.addBiome = function(biome) {
    if(typeof biome === "number") {
	biome = biome.toString();
    }

    if( !this.objectCode["biomes"] ) {
	this.objectCode["biomes"] = new Array();
    }
    
    this.objectCode["biomes"].push(biome);
}

CustomGenerator.prototype.addStructure = function(structure) {
    var structureName = structure.name;
    if( !this.objectCode["structures"] ) {
	this.objectCode["structures"] = new Object();
    }

    this.objectCode["structures"][structureName] = structure;
}

/**
   Idées pour les fonctions rémove
   * Proposer un paramètre "all" (true/false), si true, on
   * supprime tout
   * sinon, seulement le premier OU le dernier en fonction d'un 
   * paramètre "direction"('first'/'last')
*/
CustomGenerator.prototype.removeBlock = function(blockId, direction, all) {
    var removeDirection = "";
    
    if(typeof blockId === "number") {
	blockId = blockId.toString();
    }

    if( !direction ) {
	removeDirection = "first";
    } else {
	removeDirection = direction;
    }

    var removeAll = false;
    if( all != undefined ) {
	removeAll = all;
    }

    /*
      Detection of the index
     */
    if( !all ) {
	switch(removeDirection) {
	    case "first":
	    var index = this.findFirstOfBlocks(blockId);
	    if(index > -1 ) {
		this.objectCode["blocks"].splice(index, 1);
	    }
	    break;
	    case "last":
	    var index = this.findLastOfBlocks(blockId);
	    if(index > -1 ) {
		this.objectCode["blocks"].splice(index, 1);
	    }
	    break;
	}
    } else {
	for(var i = this.objectCode["blocks"].length - 1; i >= 0; i--) {
	    var block = this.objectCode["blocks"][i];

	    if( block["blockId"] == blockId ) {
		this.objectCode["blocks"].splice(i, 1);
	    }
	}
    }
}

CustomGenerator.prototype.removeBiome = function(biomeId) {
    if( typeof biomeId === "number") {
	biomeId = biomeId.toString();
    }

    var index = this.objectCode["biomes"].indexOf(biomeId);

    this.objectCode["biomes"].splice(index, 1);
}

CustomGenerator.prototype.removeStructure = function(structureName) {
    if( this.objectCode["structures"] ) {
	for( var key in this.objectCode["structures"] ) {
	    var structure = this.objectCode["structures"][key];
	    
	    if( structure["name"] === structureName ) {
		delete this.objectCode["structures"][key];
		break;
	    }
	}
    }
}

/**
   Compilation public method
*/
CustomGenerator.prototype.generateRawCode = function() {
    this.generatorRawCode = this.compile();
}

CustomGenerator.prototype.dump = function() {
    console.log("CUSTOM GENERATOR DUMP");
    console.log("Raw Code: ", this.generatorRawCode);
    console.log("Object Code: ", this.objectCode);
    console.log("END OF DUMP");
}
