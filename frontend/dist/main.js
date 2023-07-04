// Initialisation de la vu sur la carte
var map = L.map('map').setView([38.8610, 71.2761], 7);
// Position de la barre du zoom
map.zoomControl.setPosition('topright');
// Ajout des tuiles (fond de carte)
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
var watercolorMap = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 1,
    maxZoom: 16,
    ext: 'jpg'
});
var st = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
});
// Ajout d'un marqeur au centre de la carte
var singleMarker = L.marker([38.8610, 71.2761])
   .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
   .openPopup();

 //Ajout de l'echelle de la carte
 L.control.scale().addTo(map)
 


 // Affichage de coordonnées sur la carte
 map.on('mousemove', function(e){
     $('.coordinate').html(`Lat: ${e.latlng.lat} Lng: ${e.latlng.lng}`)
 })


 // chargement des données Geojson
 var marker = L.markerClusterGroup();
 var taji = L.geoJSON(data,{
     onEachFeature: function(feature, layer){
         layer.bindPopup(feature.properties.name)
     }
 });
 taji.addTo(marker);
 marker.addTo(map);

 // Outil de control des couches
 var baseMaps = {
     'OSM': osm,
     'Water Color Map': watercolorMap,
     'Stamen Toner': st
 }

 var overlayMaps = {
     'GeoJSON Markers': marker,
     'Single Marker' : singleMarker
 }

 L.control.layers(baseMaps, overlayMaps, {collapsed: false, position: 'topleft'}).addTo(map);


