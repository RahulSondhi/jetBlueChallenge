var config = {
  delimiter: "", // auto-detect
  newline: "", // auto-detect
  quoteChar: '"',
  escapeChar: '"',
  header: true,
  trimHeaders: false,
  dynamicTyping: false,
  preview: 0,
  encoding: "",
  worker: false,
  comments: false,
  step: undefined,
  complete: undefined,
  error: undefined,
  download: false,
  skipEmptyLines: false,
  chunk: undefined,
  fastMode: undefined,
  beforeFirstChunk: undefined,
  withCredentials: undefined,
  transform: undefined
};

$(function() {

  startEm()

  initSite();

});

var route;

async function initSite() {
  $.ajax({
    type: "GET",
    cache: true,
    url: "/static/data/routes.json",
    success: async function(data) {
      route = data;
    }
  })
}

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
    apiKey: 'Ztr1SjtBL3Cv28aLYa2Wrg',
    username: 'rahulsondhi'
  });

  var query = 'SELECT * FROM airportlocations';
  var airportDataset = new carto.source.SQL(query);
  var airportSQL = new carto.source.SQL(query);

  var airportStyle = new carto.style.CartoCSS(`
        #layer {
		  marker-width: 60;
      marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/rahulsondhi/assets/20181201232317airplane.svg');
		  marker-allow-overlap: true;
		  marker-line-width: 0;
		  marker-line-color: #FFFFFF;
		  marker-line-opacity: 1;
      [zoom>5]{
        marker-width: 40;
      }
      [zoom>10]{
        marker-width: 10;
      }
		}`);

  var airports = new carto.layer.Layer(airportDataset, airportStyle, {
    featureOverColumns: ['name', 'lon', 'lat']
  });

  client.addLayers([airports]);
  client.getLeafletLayer().addTo(map);

  var placesStyle = new carto.style.CartoCSS(`
    #layer {
		  marker-width: 30;
		  marker-fill: #1AB2A3;
		  marker-fill-opacity: 1;
		  marker-allow-overlap: true;
		  marker-line-width: 0;
		  marker-line-color: #FFFFFF;
		  marker-line-opacity: 1;
      [zoom>5] {
        marker-width: 25;
      }
      [zoom>10] {
        marker-width: 5;
      }
		}`);

  var popup = L.popup();

  airports.on('featureClicked', function(featureEvent) {

    $("#infoFill").html('This airport is called '+featureEvent.data.name+".");

    
    // let places = $.ajax({
    //   method: 'GET',
    //   url: '/explore',
    //   data: {
    //     lat: featureEvent.data.lat,
    //     lon: featureEvent.data.lon,
    //     isAccessible: false // TODO: This should be user set
    //   }
    // });
    //
    // let updateAoiDB = places.then(function(data) {
    //   let parsedData = JSON.parse(data);
    //   placesSQL = new carto.source.SQL('DELETE FROM aoi');
    //   for (let i = 0; i < parsedData.businesses.length; i++) {
    //     placesSQL = new carto.source.SQL(`
    //       INSERT INTO aoi (
    //         name, rating, lon, lat, price, location, phone
    //       ) VALUES (
    //         ${parsedData.businesses[i].name},
    //         ${parsedData.businesses[i].rating},
    //         ${parsedData.businesses[i].coordinates.longitude},
    //         ${parsedData.businesses[i].coordinates.latitude},
    //         ${parsedData.businesses[i].price},
    //         ${JSON.stringify(parsedData.businesses[i].location)},
    //         ${parsedData.businesses[i].display_phone}
    //       );`);
    //   }
    // });
    //
    // let cartoPlacesLayer = updateAoiDB.then(function() {
    //   let placesDataset = new carto.source.SQL('SELECT * FROM aoi');
    //   console.log('database selected');
    //   let placesLayer = new carto.layer.Layer(placesDataset, placesStyle, {
    //     featureOverColumns: ['name', 'lon', 'lat']
    //   });
    //
    //   client.addLayers([placesLayer]);
    //   client.getLeafletLayer().addTo(map);
    // });

  });
  airports.on('featureOver', function(featureEvent) {
    popup.setLatLng(featureEvent.latLng);
    popup.setContent(`<h2>${featureEvent.data.name}</h2>`);
    popup.openOn(map);
  });
  airports.on('featureOut', function(featureEvent) {
    popup.removeFrom(map);
  });

}
