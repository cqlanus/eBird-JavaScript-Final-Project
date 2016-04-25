
var findTheBirds = (function(){
  events.on('getLocation', findBirds);
  events.on('newGeoObj', findBirds);
  //events.on('getFormData', getDays);

  var output = document.getElementById('output');

  var daysAgo = document.getElementById('date');
  var daysAgoValue;
  daysAgo.addEventListener('change', function(){
    daysAgoValue = this.value;
  })

  var birdData;
  render();

  function clearBox(){
    output.innerHTML = '';
  }

  function findBirds(geoObj){

    var myLatLng = geoObj;
    // var form = formData;
    // var daysAgo = getDays(obj);
    // console.log(daysAgo);
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
        div.id = i + ' bird';
      }
    }
  }

  function createTextNode(el, msg){
    var div = document.createElement(el);
    var t = document.createTextNode(msg);
    div.appendChild(t);
    output.appendChild(div);
    return div;
  }

  function highlightText(){
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
      //$(theDiv).click(addBirdDetails(birdData));
      //, removeBirdDetails(evt))
      theDiv.addEventListener('click', (function(evt){
        return function(evt){
          addBirdDetails(evt, birdData);
        }
      })());

      // theDiv.onclick = (function(evt){
      //   return function(evt){
      //     removeBirdDetails(evt);
      //   }
      // })();
    }
  };

    function addBirdDetails(evt, birdData){
      var div = document.createElement('DIV');
      var index = parseInt(evt.currentTarget.id)
      var text = '<br>Latin name: '+birdData[index].sciName + '<br>';
      text += 'How many: '+birdData[index].howMany+ '<br>';
      text += 'Location: '+birdData[index].locName+ '<br>';
      text += 'Date: '+birdData[index].obsDt+ '<br><br>';
      div.className = 'birdDetails';
      div.innerHTML = text;
      evt.currentTarget.appendChild(div);
    }

    function removeBirdDetails(evt){
      var birds = document.getElementsByClassName('bird');
      var birdDetails = document.getElementsByClassName('birdDetails');
      birds.addEventListener('click', function(){
          evt.currentTarget.removeChild(birdDetails);
      })
    }

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
