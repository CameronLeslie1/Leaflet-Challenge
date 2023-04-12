// Store our API endpoint as queryUrl.
// Below is the .geojson for All Earthquakes for the past 7 days, updated every minute
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//Your data markers should reflect the magnitude of the earthquake by their size and the depth of the earthquake by color. 
// Earthquakes with higher magnitudes should appear larger, 
// And earthquakes with greater depth should appear darker in color
// Magnitude can be found under features > properties > mag | it is Decimal type
// {feature.properties.mag}
// Depth can be found under features > geometry > coordinates > depth[2]
// Longitude can be found under features > geometry > coordinates > longitude[0]
// Latitude can be found under features > geometry > coordinates > latitude[1]
// {feature.geometry.coordinates[2]}
    //"type":
        //"FeatureCollection",
    //"metadata":
        //{"generated":1680570104000,"url":"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson","title":"USGS Magnitude 4.5+ Earthquakes, Past Week","status":200,"api":"1.10.3","count":75},
    //"features":[
        // "type":
            // "Feature",
        // "properties":
            // {"mag":5.3,"place":"Owen Fracture Zone region","time":1680559222520,"updated":1680560487040,"tz":null,"url":"https://earthquake.usgs.gov/earthquakes/eventpage/us6000k1u2","detail":"https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us6000k1u2.geojson","felt":null,"cdi":null,"mmi":null,"alert":null,"status":"reviewed","tsunami":0,"sig":432,"net":"us","code":"6000k1u2","ids":",us6000k1u2,","sources":",us,","types":",moment-tensor,origin,phase-data,","nst":87,"dmin":10.378,"rms":0.98,"gap":66,"magType":"mww","type":"earthquake","title":"M 5.3 - Owen Fracture Zone region"},
        // "geometry":
            // "type":"Point",
            // "coordinates":[56.3995,14.5149,10]},
        // "id":"us6000k1u2",

// We create the tile layer that will be the background of our map.
console.log();

// Create the map object with options.
var map = L.map("map", {
    center: [
      25, -75
    ],
    zoom: 3
  });

// Add the tile layer that will be the background of our map.
var basemap = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
    {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    });

// Add the 'basemap' tile layer to the map.
basemap.addTo(map);

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on the map. 
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }
  // Magnitude of the earthquake is passed into two separate functions to calculate the color and radius.

  // This function determines the color of the marker based on the magnitude of the earthquake.
  function getColor(depth) {
    switch (true) {
      case depth > 90:
        return "#CC0000";
      case depth > 70:
        return "#FF0000";
      case depth > 50:
        return "#FF3333";
      case depth > 30:
        return "#FF6666";
      case depth > 10:
        return "#FF9999";
      default:
        return "#FFCCCC";
    }
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  // Here we add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // We turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // We set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // We create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "Magnitude: "
        + feature.properties.mag
        + "<br>Depth: "
        + feature.geometry.coordinates[2]
        + "<br>Location: "
        + feature.properties.place
      );
    }
  }).addTo(map);

  // Here we create a legend control object.
  var legend = L.control({position: "bottomright"});

  // Then add all the details for the legend
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");

    var grades = [90, 70, 50, 30, 10, -10];
    var colors = ["#CC0000", "#FF0000", "#FF3333", "#FF6666", "#FF9999", "#FFCCCC"];

    // Add title to the legend
    div.innerHTML += '<h4>Earthquake Magnitude</h4>';

    // Looping through our intervals to generate a label with a colored square for each interval.
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> "
        + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    // Set the background-color property 
    div.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
    return div;
  };

  // Finally, we our legend to the map.
  legend.addTo(map);

});