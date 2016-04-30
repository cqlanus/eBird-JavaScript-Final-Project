/** This module controls all functionality dealing with map on the page. It
  * handles the initiation of the map, any click or drag events on the map,
  * adding markers or infoboxes to the map, etc.
  */

var setTheMap = (function(){
  var map;

  render();

  /** This function creates a Google map from the geolocation object passed in as an
    * argument. The argument is an object literal with lat and lng properties.
    * The function adds a drag event listener to the map and then publishes the
    * new map center to the pubsub in order to find birds at that new center.
    */
  window.initMap = function(geoObj) {
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
          // console.log(map.getZoom());
          // Publishes new map center
          events.emit('newGeoObj', newGeoObj);

          var geocoder = new google.maps.Geocoder;

          geocoder.geocode({'latLng': newGeoObj}, function(results, status){
            if (status == google.maps.GeocoderStatus.OK) {
              var address = results[0].address_components;
              for (var i = 0; i<address.length; i++){
                if (parseInt(address[i].long_name) && address[i].long_name.length == 5) {
                  var zip = address[i].long_name;
                  events.emit('zipCodeFromDrag', zip);
                }
              }
            }
          });
      });

      // console.log(myLatLng);
  }

  /** This function is invoked when new bird data is found in the pubsub. Its job
    * is to pass in the birdData argument (an array of objects; each object
    * contains data from the eBird API, including the location of the bird sighting
    * and the name of the bird. Using these data, this function creates a marker
    * (and info window for each marker) on the map for each bird sighting, publishing
    * each marker to the pubsub so as to handle click events and write data to the sidebar.

  */
  function plotBirdData(birdData){

    // Loop through bird data.
    for (var i = 0; i<birdData.length; i++){
      // Create a new geoObj with lat and lng properties.
      var myLatLng = {lat: birdData[i].lat, lng: birdData[i].lng}
      // Use the location name as the title of each marker.
      var contentString = birdData[i].locName;

      // Generate a new marker for each item in the birdData array.
      var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: contentString,
        info: contentString
      });

      // And generate a new infowindow for each item in the birdData array.
      var infowindow = new google.maps.InfoWindow({
        maxWidth: 200
      });

      // Add a listener for a click event on the marker
      marker.addListener('click', function () {
        // On click, add the location name to the infowindow and open.
        infowindow.setContent(this.info);
        infowindow.open(map, this);
        // Publish the location name to manipulate the sidebar on each click.
        events.emit('currentMarker', this.info);
        });
    }
  }

  // This function passes in the map that is generated on load.
  function getOnLoadMap(map){
    return map;
  }

  function render(){
    // Handling all the subscription to the pubsub module below.
    events.on('birdData', plotBirdData);
    events.emit('getMap', map);
    events.on('onLoadMap', getOnLoadMap);
  }

})();
