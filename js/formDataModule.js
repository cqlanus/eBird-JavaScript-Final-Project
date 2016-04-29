/** This module controls all functionality dealing with the form section of the
  * page. Accesses and handles all form data and buttons.
  */

var formData = (function(){

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
      return;
    }
    if (parseInt(newForm.date) > 30){
      alert('Date must be less than 31 days ago.');
      return;
    }
    console.log(newForm.date);
    events.emit('getFormData', newForm);
  }

  // Resets form and output div.
  function clearBox(){
    output.innerHTML = "";
    zipCode.value = ""
    date.value = 7;
  }

  function render(){
    // Gets the important DOM elements
    var zipCode = document.getElementById('zipCode');
    var date = document.getElementById('date');
    var species = document.getElementById('species');
    var findBirds = document.getElementById('findBirds');
    var reset = document.getElementById('reset');
    var output = document.getElementById('output');
    var newForm = {};

    // Attaches event listeners to those DOM elements.
    findBirds.addEventListener('click', triggerNewData);
    reset.addEventListener('click', clearBox);
    //displayBirdList()
  }

  /** This will hopefully be a function that can make an AJAX request to the
    * eBird API in order to create a text input that autocompletes with common
    * or scientific bird names. In this way, the goal would be to search for
    * bird sightings by species, finding the nearest bird to current location,
    * or finding if bird happens to be within the map area.
    */

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
