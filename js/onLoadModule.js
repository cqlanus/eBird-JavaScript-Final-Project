// TODO:
// 1. Figure out how to manage window.onload - don't want to recreate entire functionality
// 2. Functionality for the form - autocomplete bird list; filter by date range
// 3. Interactivity with markers and bird list - hover over the marker; highlight birds;
//    hover over birds, highlight marker.
// 4. Info menus for bird info - AJAX request to wikipedia?
// 5. Style the page


window.addEventListener('load', function(){
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
      console.log(newGeoObj);
      // Publishes new map center
      events.emit('newGeoObj', newGeoObj);
  });
});
