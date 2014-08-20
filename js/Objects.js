Object.size = function(a) {
    var size = 0;
    for( var key in a ) {
	if( a.hasOwnProperty(key) ) {
	    size++;
	}
    }
    return size;
}
