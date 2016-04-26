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
      var contentString = birdData[i].locName;

      var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: contentString,
        info: contentString
      });

      var infowindow = new google.maps.InfoWindow({
        maxWidth: 200
      });
      marker.addListener('click', function () {
        // where I have added .html to the marker object.
        infowindow.setContent(this.info);
        infowindow.open(map, this);
        events.emit('currentMarker', this.info);
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
