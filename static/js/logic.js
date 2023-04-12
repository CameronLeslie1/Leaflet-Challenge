// Store our API endpoint as queryUrl.
// Below is the .geojson for All Earthquakes for the past 7 days, updated every minute
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

console.log();

// Creating the map object
var map = L.map("map", {
    center: [
      25, -75
    ],
    zoom: 3
  });

// Adding the tile layer
var basemap = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
    {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    });

// Adding the 'basemap' tile layer
basemap.addTo(map);

// Performing get request
d3.json(queryUrl).then(function (data) {

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

  // Sets color of the marker based on depth
  function getColor(depth) {
    switch (true) {
      case depth > 100:
        return "#CC0000";
      case depth > 75:
        return "#FF0000";
      case depth > 50:
        return "#FF3333";
      case depth > 25:
        return "#FF6666";
      case depth > 10:
        return "#FF9999";
      default:
        return "#FFCCCC";
    }
  }

  // Determining radius size based on magnitude of the earthquake
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    // Creating popup
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

  // Creating legend control
  var legend = L.control({position: "bottomright"});
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");

    var grades = [90, 70, 50, 30, 10, -10];
    var colors = ["#CC0000", "#FF0000", "#FF3333", "#FF6666", "#FF9999", "#FFCCCC"];

    div.innerHTML += '<h4>Earthquake Magnitude</h4>';

    // Looping through our intervals to generate a label with a colored square for each interval.
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> "
        + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    div.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
    return div;
  };

  // Adding legend to the map
  legend.addTo(map);

});