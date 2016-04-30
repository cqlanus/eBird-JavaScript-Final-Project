// TODO:
// 1. Figure out how to manage window.onload - don't want to recreate entire functionality
// 2. Functionality for the form - autocomplete bird list
// 3. Interactivity with markers and bird list - hover over birds, highlight marker.
// 4. Info menus for bird info - AJAX request to wikipedia?
// 5. Style the page

/** This module handles the window's laod event, creating a default map to
  * display on each reload. Publishes this map and its geolocation to the
  * pubsub.
  */

window.addEventListener('load', function(){
  events.on('getLocation', initMap);
  events.on('newGeoObj', initMap);

  var myLatLng = {lat: 34.0439082973197, lng: -118.25277576660153};
  var map = new google.maps.Map(document.getElementById('myMap'), {
    zoom: 12,
    center: myLatLng
  });
  events.emit('onLoadMap', map);

  events.emit('newGeoObj', myLatLng);

  map.addListener('dragend', function() {
    var newGeoObj = {
      lat: map.getCenter().lat(),
      lng: map.getCenter().lng()
    }

  // Publishes new map center
  events.emit('newGeoObj', newGeoObj);


  });
});
