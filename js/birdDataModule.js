
var findTheBirds = (function(){
  events.on('getLocation', findBirds);
  events.on('newGeoObj', findBirds);

  var output = document.getElementById('output');
  var birdData;
  render();

  function clearBox(){
    output.innerHTML = '';
  }

  function findBirds(geoObj){

    var myLatLng = geoObj;
    clearBox();
    var xhr = new XMLHttpRequest();
    xhr.open("GET",'http://ebird.org/ws1.1/data/obs/geo/recent?lng='+myLatLng.lng+'&lat='+myLatLng.lat+'&dist=8&back=5&maxResults=500&locale=en_US&fmt=json',true);

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
        var div = createTextNode('DIV', ((i+1)+ ': '+ birdData[i].comName));
        div.className = 'bird';
        div.id = 'bird '+ (i+1);
      }
    }
  }

  function addBirdDetails(birdData){

  }

  function createTextNode(el, msg){
    var div = document.createElement(el);
    var t = document.createTextNode(msg);
    div.appendChild(t);
    output.appendChild(div);
    return div;
  }

  function highlightText(birdData){
    var divTags = document.getElementsByClassName('bird');
    for (var i = 0; i < divTags.length; i++){
      var theDiv = divTags[i];

      // event handler on spanTags to highlight on mouseover
      // use a closure and self-invoking function to accomplish this
      theDiv.onmouseover = (function(evt){
        return function(evt){
          evt.currentTarget.style.backgroundColor = 'yellow';
        }
      })();
      theDiv.onmouseout = (function(evt){
        return function(evt){
          evt.currentTarget.style.backgroundColor = 'white';
        }
      })();
      theDiv.onclick = (function(evt){
        return function(evt){
          var div = document.createElement('DIV');
          var text = 'This is a bird.'
          var t = document.createTextNode(text);
          div.appendChild(t);
          evt.currentTarget.appendChild(div);
        }
      })();
    }
  };

  function render(){
    var output = document.getElementById('output');
    output.addEventListener('mouseover', highlightText);
  }
  // function getBirdRadius(currentMap){
  //   var theMap = currentMap;
  //   var zoomOnMap = theMap.getZoom();
  //   var birdRadius = (15-zoomOnMap)*(Math.pow((4/3), (15-zoomOnMap)));
  //   birdRadius = Math.floor(birdRadius);
  //   return birdRadius;
  // }
})();
