
// This module is responsible for the form data at the top of the page.
var formData = (function(){
  // Gets the important DOM elements
  var zipCode = document.getElementById('zipCode');
  var date = document.getElementById('date');
  var species = document.getElementById('species');
  var findBirds = document.getElementById('findBirds');
  var reset = document.getElementById('reset');
  var output = document.getElementById('output');
  var newForm = {};

  render();

  // Constructor function creates a new form element object to be passed
  // to the other modules to handle.
  function FormElements(zipCode, date, species){
    this.zipCode = zipCode.value;
    this.date = date.value;
    this.species = species.value;
  }

  // Handler function that instantiates new form object, then publishes
  // it to the events module.
  function triggerNewData(e){
    newForm = new FormElements(zipCode, date, species);
    if (newForm.zipCode == ''){
      alert('Please provide a location.');
    }
    console.log(newForm);
    events.emit('getFormData', newForm);
  }

  // Resets form and output div.
  function clearBox(){
    output.innerHTML = "";
    zipCode.value = ""
  }

  // Event listeners
  function render(){
    findBirds.addEventListener('click', triggerNewData);
    reset.addEventListener('click', clearBox);
    //displayBirdList()
  }

  // function getDate(){
  //   var today = new Date();
  //   today.toString();
  //   console.log(today);
  // }

//   function displayBirdList(){
//     var xhr = new XMLHttpRequest();
//     xhr.open("GET",'http://ebird.org/ws1.1/ref/taxa/ebird?cat=species&fmt=json',true);
//     xhr.send();
//
//     xhr.onreadystatechange=function(){
//       if (this.readyState==4 && this.status==200){
//         var birdList = JSON.parse(this.response);
//         console.log(birdList[145].comName)
//
//         $('#autocomplete').autocomplete({
//         lookup: birdList,
//         onSelect: function (suggestion) {
//         alert('You selected: ' + suggestion.value + ', ' + suggestion.data);
//     }
// });
//       }
//     }
//   }
})();


// This module leverages the Google Geocoding API to transform a zip code
// into latitude and longitude data. It is subscribed to the form module.
// It publishes its location data to pass to Google Maps and eBird APIs.
var getTheLocation = (function(){

  var submit = document.getElementById('submit');
  var myLocation = {};

  events.on('getFormData', getGeo);
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
        render();
      }
    }
  }

  function render() {
    events.emit('getLocation', myLocation)
  }

})();


var setTheMap = (function(){
  var map;
  events.on('getLocation', initMap);
  events.on('birdData', plotBirdData);

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
          console.log(newGeoObj);
          // Publishes new map center
          events.emit('newGeoObj', newGeoObj);
      });

      console.log(geoObj);
  }

  function plotBirdData(birdData){
    //var birdData = birdData;
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


  function render(){
    events.emit('getMap', map);
  }

})();

var findTheBirds = (function(){
  events.on('getLocation', findBirds);
  events.on('newGeoObj', findBirds);

  var output = document.getElementById('output');
  var birdData;

  function clearBox(){
    output.innerHTML = '';
  }

  function findBirds(geoObj){

    var myLatLng = geoObj;
    clearBox();
    var xhr = new XMLHttpRequest();
    xhr.open("GET",'http://ebird.org/ws1.1/data/obs/geo/recent?lng='+myLatLng.lng+'&lat='+myLatLng.lat+'&dist=9&back=7&maxResults=500&locale=en_US&fmt=json',true);

    xhr.send();

    // set up a listener for the response
    xhr.onreadystatechange=function(){
      if (this.readyState==4 && this.status==200){
        birdData = JSON.parse(this.response);
        console.log(birdData);
        events.emit('birdData', birdData)
        writeBirdData(birdData);
      }
    }
  }

  function writeBirdData(birdData){
    if(birdData.length == 0){
      createTextNode('DIV', 'No birds found in this area!')
    }
    else{
      for (var i = 0; i<birdData.length; i++){
        createTextNode('DIV', ((i+1)+ ': '+ birdData[i].comName))
      }
    }
  }

  function createTextNode(el, msg){
    var div = document.createElement(el);
    var t = document.createTextNode(msg);
    div.appendChild(t);
    output.appendChild(div);
  }
})();


window.addEventListener('load', function(){
  var myLatLng = {lat: 34.0851479, lng: -118.33174};
  var map = new google.maps.Map(document.getElementById('myMap'), {
    zoom: 12,
    center: myLatLng
  });

  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: 'Map Center'
  });

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
