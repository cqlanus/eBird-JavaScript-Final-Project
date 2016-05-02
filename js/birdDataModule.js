/** This module controls the getting of bird data and writing it to the page
  * via the sidebar. It also controls all functionality of the sidebar, like
  * toggling details, highlighting text, and indicating birds at specific
  * locations.
  */
var findTheBirds = (function(){

  // Declare variables that will be manipulated within the module.
  var birdData;
  var daysAgo;
  var newRadius;
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
  function findNearbyBirds(geoObj){
    var theRadius = newRadius || 7
    var myLatLng = geoObj;
    clearBox();
    var xhr = new XMLHttpRequest();

    xhr.open("GET",'http://ebird.org/ws1.1/data/obs/geo/recent?lng='+myLatLng.lng+'&lat='+myLatLng.lat+'&dist='+theRadius+'&back='+daysAgo.value+'&maxResults=500&locale=en_US&fmt=json',true);

    xhr.send();

    // set up a listener for the response
    xhr.onreadystatechange=function(){
      if (this.readyState==4 && this.status==200){
        birdData = JSON.parse(this.response);
        // console.log(birdData);
        events.emit('birdData', birdData)
        writeBirdData(birdData);
        console.log('findNearbyBirds')
      }
    }
  }

  /** This function is supposed to make an AJAX request to the eBird API to look
    * for nearby sightings of a specific species. At this point, I am only making
    * a request for Canada goose, but eventually, I will be able to pass in a
    * normalized scientific bird name.
    */
  function findBirdsBySpecies(geoObj){
    var theRadius = newRadius || 7
    var myLatLng = geoObj;
    var speciesName = species.value;
    var speciesNameArray = splitName(speciesName);
    clearBox();
    var xhr = new XMLHttpRequest();

    xhr.open("GET",'http://ebird.org/ws1.1/data/obs/geo_spp/recent?lng='+myLatLng.lng+'&lat='+myLatLng.lat+' &sci='+speciesNameArray[0]+'%20'+speciesNameArray[1]+'&dist='+theRadius+'&back='+daysAgo.value+'&maxResults=500&locale=en_US&fmt=json&includeProvisional=true',true);

    xhr.send();

    // set up a listener for the response
    xhr.onreadystatechange=function(){
      if (this.readyState==4 && this.status==200){
        birdData = JSON.parse(this.response);
        // console.log(birdData);
        events.emit('birdData', birdData)
        writeBirdData(birdData);
        console.log('findBirdsBySpecies')
      }
    }
  }

  /** This function checks if the species filter checkbox has been checked. If so,
    * findBirdsBySpecies will run, otherwise, findNearbyBirds will run.
    */
  function checkSearchCriteria(speciesFilter){
    if (speciesFilter == false){
      events.on('getLocation', findNearbyBirds);
      events.off('getLocation', findBirdsBySpecies);
      events.on('newGeoObj', findNearbyBirds);
      events.off('newGeoObj', findBirdsBySpecies);

      console.log('findNearbyBirds should work. speciesFilter = '+ speciesFilter)
    }
    else{
      events.on('getLocation', findBirdsBySpecies);
      events.off('getLocation', findNearbyBirds);
      events.on('newGeoObj', findBirdsBySpecies);
      events.off('newGeoObj', findNearbyBirds);

      console.log('findBirdsBySpecies should work. speciesFilter = '+ speciesFilter)

    }
  }
  var speciesFilterOn;
  function checkSpeciesFilter(speciesFilter){
    if (speciesFilter == true){
      speciesFilterOn = true
      return speciesFilterOn;
    }
    else {
      speciesFilterOn = false;
      return speciesFilterOn;
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
        if(speciesFilterOn == true){
          var div1 = createTextNode('DIV', ((i+1)+ ': '+ birdData[i].locName));
        }
        else {
          var div1 = createTextNode('DIV', ((i+1)+ ': '+ birdData[i].comName));
        }
        div1.className = 'bird';
        div1.id = i + 'bird';

        var latinString = normalizeName(birdData[i].sciName);
        var commString = normalizeName(birdData[i].comName);

        var text = '<br>Common name: <a href="https://www.allaboutbirds.org/guide/'+commString+'"target="_blank">'+birdData[i].comName+'</a><br>';
        text += 'Latin name: <a href="https://en.wikipedia.org/wiki/'+latinString+'"target="_blank">'+birdData[i].sciName+'</a><br>';
        text += 'How many: '+birdData[i].howMany+ '<br>';
        text += 'Location: '+birdData[i].locName+ '<br>';
        text += 'Date: '+birdData[i].obsDt+ '<br><br>';

        var div2 = createTextNode('DIV');
        div2.innerHTML = text;
        div2.className = 'birdDetails';
        div2.className += ' hidden'
        div2.id = i + 'birdDetails';
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
    // console.log(index);
    var element = document.getElementById(index+'birdDetails');
    if ($(element).hasClass('hidden')){
      $(element).removeClass('hidden');
    }
    else {
      $(element).addClass('hidden');
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

  /** This function takes the map's current zoom as an argument, then adjusts the
    * the radius value, to be passed into the eBird AJAX request. The limits on
    * the radius value are a response to the eBird radius limits.
    */
  function setSearchRadius(currentZoom){
    var startZoom = 12;
    var newZoom = currentZoom;
    var zoomDiff = (newZoom - startZoom);
    var startRadius = 7;
    newRadius = (startRadius - (2*zoomDiff));
    if (newRadius < 1){
      newRadius = 1;
    }
    else if (newRadius > 50){
      newRadius = 50;
    }
    console.log(newRadius);
    return newRadius;
  }

  function normalizeName(birdDataObj){
    var splitTheName = splitName(birdDataObj);
    // Joins the array with underscore
    var combinedName = splitTheName.join('_');
    // console.locombinedNameg(combinedName);
    return combinedName;
  }

  function splitName(birdDataObj){
    // Removes apostrophes
    var theName = birdDataObj.replace("'", "");
    // Splits into an array
    var splitTheName = theName.split(' ');
    return splitTheName;
  }

  /** This is a render function invoked earlier in the module to collect necessary
    * DOM elements on the page and attach event listeners to those DOM elements.
    * It also subscribes to all published data to the pubsub class.
    */

  function render(){
    // Access DOM elements;
    var output = document.getElementById('output');
    daysAgo = document.getElementById('date');
    var species = document.getElementById('species');
    var birdNames = document.getElementsByClassName('bird');

    // Attach event listeners
    daysAgo.addEventListener('change', function(){
      daysAgoValue = this.value;
    })
    output.addEventListener('mouseover', highlightText);

    $("#output").click(toggleBirdDetails);

    // Subscribe to necessary published data
    events.on('getLocation', findNearbyBirds);
    events.on('newGeoObj', findNearbyBirds);
    events.on('currentMarker', findBirdsByLocation);
    events.on('resetBtn', clearBox);
    events.on('mapZoom', setSearchRadius);
    events.on('speciesFilter', checkSearchCriteria);
    events.on('speciesFilter', checkSpeciesFilter);
  }

})();
