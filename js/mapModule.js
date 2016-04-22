var setTheMap = (function(){
  var map;
  events.on('getLocation', initMap);
  events.on('birdData', plotBirdData);
  events.on('newGeoObj', initMap);

  render();

  function initMap(geoObj) {
      var myLatLng = geoObj;

      map = new google.maps.Map(document.getElementById('myMap'), {
        zoom: 12,
        center: myLatLng
      });

      var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: 'Hello World!'
      });

      // This event listener finds the map center each time map is dragged
      map.addListener('dragend', function() {
        var newGeoObj = {
          lat: map.getCenter().lat(),
          lng: map.getCenter().lng()
        }
          console.log(map.getZoom());
          // Publishes new map center
          events.emit('newGeoObj', newGeoObj);
      });

      console.log(geoObj);
  }

  function plotBirdData(birdData){

    for (var i = 0; i<birdData.length; i++){
      var myLatLng = {lat: birdData[i].lat, lng: birdData[i].lng}

      var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: birdData[i].locName
      });
      // Need to create a closure to save the state of each birdData[i].locName
      var contentString = birdData[i].locName;
      var infowindow = new google.maps.InfoWindow({
        content: contentString,
        maxWidth: 200
      });
      marker.addListener('click', function() {
        infowindow.open(map, marker);
      });
    }
  }

  function getOnLoadMap(map){
    return map;
  }
  function render(){
    events.emit('getMap', map);
    events.on('onLoadMap', getOnLoadMap)
  }

})();
