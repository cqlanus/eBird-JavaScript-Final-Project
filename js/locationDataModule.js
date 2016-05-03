/** This module leverages the Google Geocoding API to transform a zip code
  * into latitude and longitude data. It is subscribed to the form module.
  * It publishes its location data to pass to Google Maps and eBird APIs.
  */
var getTheLocation = (function(){

  // Declare variables.
  var myLocation = {};

  render();

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
        // Publish geolocation object to pubsub.
        events.emit('getLocation', myLocation);
      }
    }
  }

  function getLocation(){

            if(navigator.geolocation){
               // timeout at 60000 milliseconds (60 seconds)
               var options = {timeout:60000};
               navigator.geolocation.getCurrentPosition(getPosition, errorHandler, options);
            }

            else{
               alert("Sorry, browser does not support geolocation!");
            }
         }

  function getPosition(position){
    console.log(position);
    var currentLoc = {lat: position.coords.latitude, lng: position.coords.longitude};
    events.emit('newGeoObj', currentLoc);
  }

  function errorHandler(err) {
            if(err.code == 1) {
               console.log("Error: Access is denied!");
            }

            else if( err.code == 2) {
               console.log("Error: Position is unavailable!");
            }
         }

  function render(){
    // Access DOM elements.
    var submit = document.getElementById('submit');
    var logLocation = document.getElementById('logLocation');
    logLocation.addEventListener('click', getLocation)

    // Subscribe to pubsub data.
    events.on('getFormData', getGeo);
  }


})();
