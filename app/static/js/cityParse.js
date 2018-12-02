//Reading in cities, gets [[source city, all destinations connected to it for mint][same source city, all destinations not mint]]

function buildConfig() {
    return {
        header: true,
        worker: false,
        comments: false,
        step: undefined,
        complete: completeFn
    }
}

function completeFn(results)
{
	console.log("    Results:", results.data.lastIndexOf);
}

var allDestinations = function(sourceCity, allRoutes) {
    
    var config = buildConfig();
    var allResults = Papa.parse(routes, config);
   // while allResults.data.
    var destEnum = {
        city2: null,
        city3: "ABC",
        isMint: 0,
        isSeasonal: 0
    }
    return allResults
    //loop through routes/search it until it gets to the first instance of the source, 
    //fill in the dest enums for those cities it's going to, the next lines
    
}

