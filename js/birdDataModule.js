
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

  function createTextNode(el, msg){
    var div = document.createElement(el);
    var t = document.createTextNode(msg);
    div.appendChild(t);
    output.appendChild(div);
    return div;
  }

  function highlightText(){
      // event handler on spanTags to highlight on mouseover
      $(".bird").mouseover(function(){
        $(this).addClass('highlight');
      });
      $(".bird").mouseout(function(){
        $(this).removeClass('highlight');
      });

  }

    function showBirdDetails(){
      var birds = document.getElementsByClassName('bird');
      var birdDetails = document.getElementsByClassName('birdDetails');

      for (var i = 0; i < birds.length; i++){
        var index = parseInt(birds[i].id);
      //  console.log('#'+index+' birdDetails ' + birdDetails[i].id);
        // birds[i].addEventListener('click', function(){
        //   alert("hello");
          var element = document.getElementById(index+' birdDetails');

          element.className = 'birdDetails';
        // })
      }
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
    output.addEventListener('click', showBirdDetails);
  }

})();
