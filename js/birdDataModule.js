
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
    xhr.open("GET",'http://ebird.org/ws1.1/data/obs/geo/recent?lng='+myLatLng.lng+'&lat='+myLatLng.lat+'&dist=8&back=7&maxResults=500&locale=en_US&fmt=json',true);

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

  function getBirdRadius(currentMap){
    var theMap = currentMap;
    var zoomOnMap = theMap.getZoom();
    var birdRadius = (15-zoomOnMap)*(Math.pow((4/3), (15-zoomOnMap)));
    birdRadius = Math.floor(birdRadius);
    return birdRadius;
  }
})();
