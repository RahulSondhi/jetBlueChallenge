$(function() {

startEm()

});

function startEm() {
  var map = L.map('map').setView([42.877742, -97.380979], 5);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy;<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
  }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy;<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>',
    zIndex: 100
  }).addTo(map);


  var client = new carto.Client({
    apiKey: 'O3SGGVPJiF4y0NdG_thKXw',
    username: 'rahulsondhi'
  });

  var query = 'SELECT * FROM airportlocations';
  var airportDataset = new carto.source.SQL(query);
  var airportSQL = new carto.source.SQL(query);

  var airportStyle = new carto.style.CartoCSS(`
        #layer {
		  marker-width: 1.5;
		  marker-fill: #8409B2;
		  marker-fill-opacity: 1;
		  marker-allow-overlap: true;
		  marker-line-width: 0;
		  marker-line-color: #FFFFFF;
		  marker-line-opacity: 1;
		  [zoom>5]{
		  	 marker-width: 20;
		  	 marker-fill-opacity: 0.9;
		  }
		   [zoom>10]{
		  	 marker-width: 30;
		  	 marker-fill-opacity: 0.9;
		  }
		}`);

  // // 3.3 Define another styling option for the biggest wildfires
  // var bigWildfiresStyle = new carto.style.CartoCSS(`
  //     #layer {
  //         marker-width: ramp([fire_size], range(4, 40), equal(10));
  //         marker-fill: ramp([stat_cause_descr], (#5F4690, #1D6996, #38A6A5, #0F8554, #73AF48, #EDAD08, #E17C05, #CC503E, #94346E, #6F4070, #666666), ("Debris Burning", "Miscellaneous", "Arson", "Lightning", "Missing/Undefined", "Equipment Use", "Campfire", "Children", "Smoking", "Railroad"), "=");
  //         marker-fill-opacity: 1;
  //         marker-allow-overlap: true;
  //         marker-line-width: 0;
  //         marker-line-color: #FFFFFF;
  //         marker-line-opacity: 1;
  //         [zoom>5]{
  //            marker-fill-opacity: 0.9;
  //         }
  //          [zoom>10]{
  //            marker-fill-opacity: 0.9;
  //         }
  //         }
  //     #markers {
  //   marker-file: url(https://image.flaticon.com/icons/svg/24/24143.svg);
  //   }`);

  // Create a layer object, combining a source and style.
  // Identify columns that should be accessible on mouseover
  var airports = new carto.layer.Layer(airportDataset, airportStyle);

  // 3.4 Adding the layer(s) to the client
  client.addLayers([airports]);

  // // 3.5 Adding the layer(s) to the map
  client.getLeafletLayer().addTo(map);

  // // Creating a pop-up on the layer object
  // var popup = L.popup();
  // wildfires.on('featureOver', function(featureEvent) {
  //   popup.setLatLng(featureEvent.latLng);
  //   // some HTML for formatting the pop-up content, get emoji from the style library
  //   popup.setContent(`<h2>Fire Name: ${featureEvent.data.fire_name}</h2>
  //                       <i class="em em-fire"
  //                          style="width: ${Math.log(Math.ceil(featureEvent.data.fire_size))+20}px;
  //                                 height: ${Math.log(Math.ceil(featureEvent.data.fire_size))+20}px;">
  //                       </i>
  //                       <p style="font-size:16px";><strong>Fire size (acres):</strong> ${featureEvent.data.fire_size.toFixed(2)}</p>
  //                       <p style="font-size:16px";><strong>Year of Discovery:</strong> ${featureEvent.data.fire_year}</p>
  //                       <p>`);
  //   popup.openOn(map);
  // });
  // wildfires.on('featureOut', function(featureEvent) {
  //   popup.removeFrom(map);
  // });
  //
  // // // 4.1 Defining a category dataview
  // var wildfiresDataView = new carto.dataview.Category(wildfiresSQL, 'stat_cause_descr', {
  //   limit: 14,
  //   operation: carto.operation.count,
  //   operationColumn: 'fire_size'
  // });
  //
  // // 4.2 Listening to data changes on the dataview
  // wildfiresDataView.on('dataChanged', function(newData) {
  //   refreshWildfiresWidget(newData.categories);
  //   categoryData = newData.categories;
  // });
  //
  // colorDict = {
  //   "Debris Burning": '#5F4690',
  //   "Miscellaneous": '#1D6996',
  //   "Arson": '#38A6A5',
  //   "Lightning": '#0F8554',
  //   "Missing/Undefined": '#73AF48',
  //   "Equipment Use": '#EDAD08',
  //   "Campfire": '#E17C05',
  //   "Children": '#CC503E',
  //   "Smoking": '#94346E',
  //   "Railroad": ' #6F4070'
  // }
  //
  // // Define how the Widget updates upon changes to the wildfiresDataView
  // var refreshWildfiresWidget = function(data) {
  //   // var $widget = document.querySelector('#fireCategoryWidget');
  //   // var $wildfiresTypes = $widget.querySelector('.js-fires_cat');
  //   //
  //   // // Remove whatever was in the category widget beforehand
  //   // while ($wildfiresTypes.firstChild) {
  //   //   $wildfiresTypes.removeChild($wildfiresTypes.firstChild);
  //   // }
  //   // // iteratively add list elements
  //   // if (data) {
  //   //   for (var wildfiretype of data) {
  //   //     var $li = document.createElement('li');
  //   //     // Adding a tooltip/hover action
  //   //     $li.className = 'tooltip';
  //   //     $li.setAttribute("id", wildfiretype.name)
  //   //     var x = document.createElement('span');
  //   //     var t = document.createTextNode("Finding all " + wildfiretype.name.toLowerCase() + " fires");
  //   //     x.className = 'tooltiptext';
  //   //     x.appendChild(t); // Append the hover text to span object
  //   //     $li.appendChild(x); // Append span object to the list object
  //   //
  //   //     // set colors of list element
  //   //     if (colorDict[wildfiretype.name])
  //   //       $li.style.color = colorDict[wildfiretype.name];
  //   //     else {
  //   //       $li.style.color = "black";
  //   //     }
  //   //
  //   //     // Set the text of the list element as wildfire category name + the value (in this case, the count)
  //   //     listText = document.createTextNode(wildfiretype.name + ': ' + wildfiretype.value);
  //   //     $li.appendChild(listText);
  //   //     $wildfiresTypes.appendChild($li);
  //   //   }
  //   // }
  // }
  //
  // // // 4.3 Adding the dataview to the client
  // client.addDataview(airportDataView);

  // 5 Adding the bounding box filter
  // 5.1 Defining the bounding box filter for the map
  var boundingBoxFilter = new carto.filter.BoundingBoxLeaflet(map);
  // 5.2 Apply the bounding box filter to the dataview
  var applyBoundingBox = function(event) {
    if (event.checked) {
      wildfiresDataView.addFilter(boundingBoxFilter);
    } else {
      wildfiresDataView.removeFilter(boundingBoxFilter);
    }
  }
}
