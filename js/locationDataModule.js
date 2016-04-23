// This module leverages the Google Geocoding API to transform a zip code
// into latitude and longitude data. It is subscribed to the form module.
// It publishes its location data to pass to Google Maps and eBird APIs.
var getTheLocation = (function(){

  var submit = document.getElementById('submit');
  var myLocation = {};

  events.on('getFormData', getGeo);

  // Makes the AJAX request to convert Zip to lat/lng.
  function getGeo(newForm){
    // make an send an XmlHttpRequest
    var xhr = new XMLHttpRequest();
    xhr.open("GET","http://maps.googleapis.com/maps/api/geocode/json?address="+newForm.zipCode, true);
    xhr.send();

    // set up a listener for the response
    xhr.onreadystatechange=function(){
      if (this.readyState==4 && this.status==200){
        var l = JSON.parse(this.response).results[0].geometry.location;
        if (l.lat) {
          myLocation.lat = l.lat;
        }
        if (l.lng) {
          myLocation.lng = l.lng;
        }
        events.emit('getLocation', myLocation);
      }
    }
  }


})();
