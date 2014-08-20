function BlocksFileHandler(data){
    this.jsonData = data;
    /**
       tagsIndex["aTag"] = Array("minecraft:dirt", "minecraft:grass"...)
    */
    this.tagsIndex = {};

    this.compile();
}

/**
   This function will extract all of the tags
   from the data and associate each of them with
   the block it is associated
*/
BlocksFileHandler.prototype.compile = function() {
    for( var key in this.jsonData) {
	var value = this.jsonData[key];
	var splittedTags = value.tags.split(",");
	for( var i = 0; i < splittedTags.length; i++ ) {
	    var tag = splittedTags[i];
	    if( this.tagsIndex[tag] == undefined ) {
		//If the index is undefined, then we create it
		this.tagsIndex[tag] = new Array();
		this.tagsIndex[tag].push(key);
	    } else {
		this.tagsIndex[tag].push(key);
	    }
	}
    }
}

/**
   This function return an array of json object
   representing the jsonData
   Each of the json objects will have a "stringId" property
   designating the string id of the item (eg: minecraft:grass)
*/
BlocksFileHandler.prototype.getFormattedData = function() {
    var data = new Array();
    for( key in this.jsonData ) {
	var jsonValue = this.jsonData[key];
	jsonValue["stringId"] = key;
	data.push(jsonValue);
    }
    return data;
}

BlocksFileHandler.prototype.keyExists = function(key) {
    if( this.jsonData[key] == undefined ) {
	return false;
    } else {
	return true;
    }
}

BlocksFileHandler.prototype.get = function(key){
    if( this.keyExists(key) ){
	var value = this.jsonData[key];
	return value;
    } else {
	return false;
    }
}

BlocksFileHandler.prototype.getByTagName = function(tag) {
    if( tag == undefined || typeof tag != 'string' ) {
	return false;
    }

    var blocks = new Array();
    var associatedBlocks = this.tagsIndex[tag];
    for( var j = 0; j < associatedBlocks.length; j++ ) {
	var key = associatedBlocks[j];
	var jsonObj = this.jsonData[key];
	jsonObj["stringId"] = key;
	blocks.push(jsonObj);
    }
    return blocks;
}

BlocksFileHandler.prototype.getByTagsName = function(tags) {
    if( tags == undefined || typeof tags != 'string' ) {
	return false;
    }

    var blocks = {};

    var splittedTags = tags.split(",");

    for(var i = 0; i < splittedTags.length; i++) {
	var tag = splittedTags[i];
	var tmp = this.getByTagName(tag);
	blocks[tag] = tmp;
    }

    return blocks
}

BlocksFileHandler.prototype.getByBlockName = function(name, caseSensitive) {
    if( name == undefined || typeof name != 'string' ) {
	return false;
    }

    if( caseSensitive == undefined ) {
	caseSensitive = false;
    }
    
    var lName = name;
    
    if( !caseSensitive )
	lName = name.toLowerCase();

    for( key in this.jsonData) {
	var value = this.jsonData[key];
	if( !caseSensitive ) {
	    if( value["name"].toLowerCase() == lName ) {
	        return value;
	    }
	} else {
	    if( value["name"] == lName ) {
		return value;
	    }
	}
    }
    return false;
}
