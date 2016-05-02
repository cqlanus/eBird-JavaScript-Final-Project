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
    if (filter2.checked && newForm.species == ''){
      alert('Please provide a species.');
      return;

    }
    //console.log(newForm.date);
    events.emit('getFormData', newForm);
  }

  // Resets form and output div.
  function clearBox(){
    output.innerHTML = "";
    zipCode.value = ""
    date.value = 7;
  }

  // Testing here
  function updateZipcode(zip){
    zipCode.value = zip;
  }

  function pressReset(){
    events.emit('resetBtn', true);
  }

  /** This function is supposed to check whether the filter by species button
    * is checked. If so, it will publish true, otherwise, it will publish false.
    */
  function speciesFilter(){
    var bySpecies;
    if (filter2.checked){
      speciesSpan.style.display = 'inline';
      bySpecies = true;
    }
    else{
      speciesSpan.style.display = 'none';
      bySpecies = false;
    }
    events.emit('speciesFilter', bySpecies);

  }

  function render(){

    // Gets the important DOM elements
    var zipCode = document.getElementById('zipCode');
    var date = document.getElementById('date');
    var species = document.getElementById('species');
    var findBirds = document.getElementById('findBirds');
    var reset = document.getElementById('reset');
    var output = document.getElementById('output');
    var filter2 = document.getElementById('filter2');
    var speciesSpan = document.getElementById('speciesSpan');

    var newForm = {};

    speciesSpan.style.display = 'none';

    events.on('zipCodeFromDrag', updateZipcode);

    // Attaches event listeners to those DOM elements.
    findBirds.addEventListener('click', triggerNewData);
    //reset.addEventListener('click', clearBox);
    reset.addEventListener('click', pressReset);
    filter2.addEventListener('click', speciesFilter)
  }

})();
