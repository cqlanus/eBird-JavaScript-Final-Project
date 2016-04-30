/** This module controls the getting of bird data and writing it to the page
  * via the sidebar. It also controls all functionality of the sidebar, like
  * toggling details, highlighting text, and indicating birds at specific
  * locations.
  */
var findTheBirds = (function(){

  // Declare variables that will be manipulated within the module.
  var birdData;
  var daysAgoValue;
  var daysAgo;
  render();

  // This function clears the sidebar.
  function clearBox(){
    output.innerHTML = '';
  }

  /** This is the major function the makes the AJAX request to the eBird API
    * It takes a geolocation object (with a latitude and longitude) as an
    * argument, and passes that as well as the daysAgo input value into the
    * AJAX request URL.
    *
    * After successful AJAX request, it parses the data, publishes it to the
    * pub/sub class, and writes the data to the page.
    */
  function findBirds(geoObj){

    var myLatLng = geoObj;
    clearBox();
    var xhr = new XMLHttpRequest();
    if (daysAgoValue){
      xhr.open("GET",'http://ebird.org/ws1.1/data/obs/geo/recent?lng='+myLatLng.lng+'&lat='+myLatLng.lat+'&dist=7&back='+daysAgoValue+'&maxResults=500&locale=en_US&fmt=json',true);
    }
    else {
      xhr.open("GET",'http://ebird.org/ws1.1/data/obs/geo/recent?lng='+myLatLng.lng+'&lat='+myLatLng.lat+'&dist=7&back='+daysAgo.value+'&maxResults=500&locale=en_US&fmt=json',true);

    }

    xhr.send();

    // set up a listener for the response
    xhr.onreadystatechange=function(){
      if (this.readyState==4 && this.status==200){
        birdData = JSON.parse(this.response);
        // console.log(birdData);
        events.emit('birdData', birdData)
        writeBirdData(birdData);
      }
    }
  }

  /** This function writes all bird data to page. It creates DOM elements
    * based on the birdData passed into the function as an argument. It writes the
    * name of the bird as one element and the bird details as a separate element.
    * The bird details are hidden via CSS.
    */
  function writeBirdData(birdData){
    if(birdData.length == 0){
      createTextNode('DIV', 'No birds found in this area!')
    }
    else{
      for (var i = 0; i<birdData.length; i++){
        var div1 = createTextNode('DIV', ((i+1)+ ': '+ birdData[i].comName));
        div1.className = 'bird';
        div1.id = i + ' bird';

        var text = '<br>Latin name: '+birdData[i].sciName + '<br>';
        text += 'How many: '+birdData[i].howMany+ '<br>';
        text += 'Location: '+birdData[i].locName+ '<br>';
        text += 'Date: '+birdData[i].obsDt+ '<br><br>';

        var div2 = createTextNode('DIV');
        div2.innerHTML = text;
        div2.className = 'birdDetails';
        div2.className += ' hidden'
        div2.id = i + ' birdDetails';
      }
    }
  }

  // This function defines how textNodes are created on the page.
  // It takes an element name (string) and a message (string) as arguments.
  function createTextNode(el, msg){
    var div = document.createElement(el);
    var t = document.createTextNode(msg);
    div.appendChild(t);
    output.appendChild(div);
    return div;
  }

  // This function uses some jQuery to highlight text on mouseover and
  // remove highlighting on mouseout.
  function highlightText(){
      $(".bird").mouseover(function(){
        $(this).addClass('highlight');
      });
      $(".bird").mouseout(function(){
        $(this).removeClass('highlight');
      });

  }

  /** This function allows user to toggle visibility of of birdDetails
    * by manipulating the class name of the element. It takes an event as
    * an argument.
    */
  function toggleBirdDetails(e){

      var index = parseInt(e.target.id);
      var element = document.getElementById(index+' birdDetails');
      if (element.className == 'birdDetails hidden'){
        element.className = 'birdDetails';
      }
      else{
        element.className += ' hidden';
      }
    }

  /** This function uses the location of a map marker (published to the pub/sub)
    * as an argument and changes the styles of the bird element if it matches.
    */
  function findBirdsByLocation(birdLoc){
    var birdDivs = document.getElementsByClassName('bird');
    for (var i = 0; i < birdData.length; i++){
      birdDivs[i].style.borderStyle = "";

      if (birdData[i].locName == birdLoc){
        birdDivs[i].style.borderStyle = "solid";
        birdDivs[i].style.borderColor = "orange";
      }
    }
  }

  /** This is a render function invoked earlier in the module to collect necessary
    * DOM elements on the page and attach event listeners to those DOM elements.
    * It also subscribes to all published data to the pubsub class.
    */

  function render(){
    // Access DOM elements;
    var output = document.getElementById('output');
    daysAgo = document.getElementById('date');

    // Attach event listeners
    daysAgo.addEventListener('change', function(){
      daysAgoValue = this.value;
    })
    output.addEventListener('mouseover', highlightText);
    output.addEventListener('click', toggleBirdDetails);

    // Subscribe to necessary published data
    events.on('getLocation', findBirds);
    events.on('newGeoObj', findBirds);
    events.on('currentMarker', findBirdsByLocation);
    events.on('resetBtn', clearBox);
    //events.on('getFormData', getDays);
  }

})();
