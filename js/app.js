var levelGeneratorCode = new CustomGenerator("2;");
var appLoaded = false;
var selectedItem = {};
var selectedBiome = {};
var selectedStructure = {};

$(function(){
    $("input#result").val("");
    $.ajax({
        method: "GET",
        url: "data/blocks_with_pictures.json",
        dataType: "json",
	beforeSend: function() {
	    $("span#loadingMessage").empty().text("Loading Blocks");
	},
        error: function(xhr, status, error) {
                console.log(error, status);
         },
         success: function(data, status, xhr) {
             var blocksData = new BlocksFileHandler(data);
	     start(blocksData);
	     appLoaded = true;
         },
	complete: function() {
	    $("span#loadingMessage").empty();
	}
    });

    $.ajax({
	method: "GET",
	url: "data/biomes.json",
	dataType: "json",
	beforeSend: function() {
	    $("div#biomes_loadingMessage").empty().text("Loading Biomes");
	},
	complete: function() {
	    $("div#biomes_loadingMessage").empty();
	},
	error: function(xhr, status, error) {
	    console.error("Error while loading biomes.json", error, status);
	},
	success: function(data, status, xhr) {
	    onBiomesLoaded(data);
	}
    });

    $.ajax({
	method: "GET",
	url: "data/structures.json",
	dataType: "json",
	beforeSend: function() {
	    $("div#structures_loadingMessage").empty().text("Loading Structures");
	},
	complete: function() {
	    $("div#structures_loadingMessage").empty();
	},
	error: function(xhr, status, error) {
	    console.error("Error while loading structures.json", error, status);
	},
	success: function(data, status, xhr) {
	    onStructuresLoaded(data);
	}
    });
});


function start(blocksData) {
    var blocksListTable = $("div#blocksList table#blockslist_table > tbody");
    
    if( blocksListTable.length > 0 ) {
	var blocks = blocksData.getByTagName("ground");
	
	for( var i = 0; i < blocks.length; i++ ) {
	    var block = blocks[i];
	    var row = $("<tr class='blockRow'></tr>");
	    var imgCell = $("<td></td>");
	    var nameCell = $("<td></td>");
	    var b64Img = block["image"];
	    nameCell.text(block.name);
	    imgCell.append("<img src='" + b64Img + "' width='25' height='25' alt='' />");
	    row.append(imgCell);
	    row.append(nameCell);
	    blocksListTable.append(row);
	    row.data("blockData", block);
	    
	}
    }

    blocksListTable.children("tr").click(function() {
	selectedItem = {};

	var blockImage = $("div#blockImage").empty();
	var data = $(this).data("blockData");
	var b64Img = data["image"];
	var name = data["name"];
	var dec = data["dec"];
	var hex = data["hex"];
	var minecraftId = data["stringId"];
	
	$("td#blockInfos_name").text(name);
	$("td#blockInfos_minecraftId").text(minecraftId);
	$("td#blockInfos_decId").text(dec);
	$("td#blockInfos_hexId").text(hex);

	$("<img/>").attr("src", b64Img).attr("width", 150).attr("height", 150).appendTo(blockImage);
	selectedItem = data;
    });

    $("a#useSelectedBlockBtn").click(function() {
	if( appLoaded ) {
	    var numberLayers = parseInt($("input#numberLayersGenerated").val(), 10);
	    
	    onUseSelectedButtonClick($(this), selectedItem, numberLayers);
	}
    });

    $("a#removeFirst").click(function() {
	if( appLoaded ) {
	    onRemoveFirstClick($(this), selectedItem);
	}
    });

    $("a#removeLast").click(function() {
	if( appLoaded ) {
	    onRemoveLastClick($(this), selectedItem);
	}
    });

    $("a#removeAll").click(function() {
	if( appLoaded ) {
	    onRemoveAllClick($(this), selectedItem);
	}
    });

}

function onUseSelectedButtonClick(button, data, numberLayers) {
    var blockId = data.dec;
    
    levelGeneratorCode.addBlock(blockId, numberLayers);
    var rawCode = levelGeneratorCode.getRawCode();
    $("input#result").val(rawCode);
}

function onRemoveFirstClick(button, data) {
    var blockId = data.dec;

    levelGeneratorCode.removeBlock(blockId, "first", false);
    var rawCode = levelGeneratorCode.getRawCode();
    $("input#result").val(rawCode);
}

function onStructuresLoaded(structuresData) {
    var table = $("table#structureslist_table");

    table.empty();

    for( var key in structuresData ) {
	structuresData[key]["name"] = key;
	var row = $("<tr></tr>");
	var cell = $("<td></td>").text(key);

	row.append(cell);
	row.data("structureData", structuresData[key]);
	table.append(row);
    }

    table.find("tr").click(function() {
	onSelectStructure($(this));
    });

    $("a#addStructure").click(function() {
	onAddStructureClick($(this), selectedStructure);
    });

    $("a#removeStructure").click(function() {
	onRemoveStructureClick($(this), selectedStructure);
    });
}

function onAddStructureClick(button, structureData) {
    var formattedStructure = structureData.name;
    var structParams = $("tr.structParam");
    var pNumber = selectedStructure.parametersNumber;
    var structCopy = structureData;
    
    if( structParams.length != pNumber ) {
	console.error("Cannot add " + selectedStructure.name + ", invalid parameters number");
	return false;
    }
    
    if( structureData.parametersNumber > 0 ) {
	formattedStructure += "(";
	for( var i = 0; i < structParams.length; i++ ) {
	    var row = structParams[i];
	    var tds = $(row).children();
	    var pName = $(tds[0]).text();
	    var pValue = $(tds[1]).find("input").val();	
	    structCopy["parameters"][pName]["value"] = pValue;
	    formattedStructure += pName + "=" + pValue;

	    if( i < structParams.length -1 ) {
		formattedStructure += ",";
	    }
	}
	formattedStructure += ")";
    }
//    levelGeneratorCode.addStructure(formattedStructure);
    levelGeneratorCode.addStructure(structCopy);
    var rawCode = levelGeneratorCode.getRawCode();

    $("input#result").val(rawCode);
}

function onRemoveStructureClick(button, structure) {
    levelGeneratorCode.removeStructure(structure.name);
    var rawData = "";
    try {
	var rawData = levelGeneratorCode.getRawCode();
    } catch(err) {
	$("input#result").val(err);
    }
    $("input#result").val(rawData);
}

function onBiomesLoaded(biomesData) {
    var biomes = biomesData["biomes"];
    var table = $("table#biomelist_table > tbody");

    table.empty();

    for(var i = 0; i < biomes.length; i++) {
	var biome = biomes[i];
	var row = $("<tr></tr>");
	var idCell = $("<td></td>").text(biome.dec);
	var nameCell = $("<td></td>").text(biome.name);
	row.append(idCell);
	row.append(nameCell);
	row.data("biomeData", biome);
	table.append(row);
    }

    table.find("tr").click(function() {
	var data = $(this).data("biomeData");
	
	var infosBiomeID = $("td#biomeInfos_biomeId");
	var infosBiomeName = $("td#biomeInfos_biomeName");

	infosBiomeID.empty().text(data.dec);
	infosBiomeName.empty().text(data.name);
	selectedBiome = data;
    });

    $("a#useSelectedBiome").click(function() {
	onUseBiomeBtnClick($(this), selectedBiome);
    });

    $("a#removeBiome").click(function(){ 
	onRemoveBiomeBtnClick($(this), selectedBiome);
    });
}

function onSelectStructure(row) {
    var data = row.data("structureData");
    var nbParameters = data["parametersNumber"];
    var parameters = undefined;

    if( nbParameters > 0 ) {
	parameters = data["parameters"];
    }


    var structName = $("td#structInfos_structureName");

    structName.empty().text(data["name"]);

    $("tr.structParam").remove();
    if( nbParameters > 0 ) {
	var structNameRow = $("tr#structNameRow");
	for( var key in parameters ) {
	    var paramData = parameters[key];
	    var row = $("<tr class='structParam'></tr>");
	    var pName = $("<td></td>");
	    var pInput = $("<td></td>");

	    pName.text(key)
	    var input = "";
	    try {
		input = getStructureParameterInput(paramData);
	    } catch(err) {
		console.error(err);
		return false;
	    }
	    pInput.append(input);

	    row.append(pName);
	    row.append(pInput);
	    
	    structNameRow.after(row);
	}
    }

    selectedStructure = data;
}

/**
   Returns an approriate input according to the datas
   (type, min, max, default etc);
*/
function getStructureParameterInput(parameterData) {
    var type = parameterData["type"];
    var min = -1;
    var max = -1;
    var defaultValue = 0;
    var input = undefined;

    if( type === "int" ) {
	if( typeof parameterData["min"] !== "undefined") {
	    min = parseInt(parameterData["min"], 10);
	}

	if( typeof parameterData["max"] !== "undefined") {
	    max = parseInt(parameterData["max"], 10);
	}

	if( typeof parameterData["default"] !== "undefined") {
	    defaultValue = parseInt(parameterData["default"], 10);
	}
	
	input = "<input type='number'";

	if( min > -1 ) {
	    input += " min='" + min + "'";
	}

	if( max > -1 ) {
	    input += " max='" + max + "'";
	}
	
	input += " value='" + defaultValue + "'";
	input += "/>";
    } else if(type === "float"){
	if( typeof parameterData["min"] !== "undefined") {
	    min = parseFloat(parameterData["min"]);
	}

	if( typeof parameterData["max"] !== "undefined") {
	    max = parseFloat(parameterData["max"]);
	}

	if( typeof parameterData["default"] !== "undefined") {
	    defaultValue = parseFloat(parameterData["default"]);
	}

	input = "<input type='number' step='0.01'";
	
	if( min > -1 ) {
	    input += " min='" + min + "'";
	}

	if( max > -1 ) {
	    input += " max='" + max + "'";
	}

	input += " value='" + defaultValue + "'";

	input += "/>";
    } else {
	throw "Cannot create input from invalid type (" + type + ")";
    }
    
    return input;    
}

function onUseBiomeBtnClick(button, data) {
    levelGeneratorCode.addBiome(selectedBiome.dec);
    var rawCode = "";
    try {
	rawCode = levelGeneratorCode.getRawCode();
    } catch(err) {
	$("input#result").val(err);
    }
	
    $("input#result").val(rawCode);
}

function onRemoveBiomeBtnClick(button, data) {
    levelGeneratorCode.removeBiome(selectedBiome.dec);
    var rawCode = "";
    try {
	rawCode = levelGeneratorCode.getRawCode();
    } catch(err) {
	$("input#result").val(err);
    }

    $("input#result").val(rawCode);
}

function onRemoveLastClick(button, data) {
    var blockId = data.dec;
    levelGeneratorCode.removeBlock(blockId, "last", false);
    var rawCode = levelGeneratorCode.getRawCode();

    $("input#result").val(rawCode);
}

function onRemoveAllClick(button, data) {
    var blockId = data.dec;
    levelGeneratorCode.removeBlock(blockId, "first", true);
    var rawCode = levelGeneratorCode.getRawCode();
    
    $("input#result").val(rawCode);
}
