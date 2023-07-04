// Vue en grand écran de la carte
 var mapId=document.getElementById('map');
 function fullScreenView() {
     if(document.fullscreenElement){
         document.exitFullscreen()
     }else{
        mapId.requestFullscreen();
     }

 }


// Fonction d'impression de Leaflet
L.control.browserPrint({position : 'topright'}).addTo(map);



// Outil de recherche de leaflet
 L.Control.geocoder().addTo(map);

// Fonction de mesure de Leaflet
L.control.measure({
    primaryLengthUnit: 'kilometers',
    secondaryLengthUnit: 'meters',
    primaryAreaUnit: 'sqmeters', 
    secondaryAreaUnit: undefined,
 
 }).addTo(map)

// Fonction de zoom sur la couche
  $('.zoom-to-layer').click(function() {
    map.setView([38.8610, 71.2761], 7)
})