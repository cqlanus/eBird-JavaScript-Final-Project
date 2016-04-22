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
