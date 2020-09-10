const datetimeLocale = require('datetime-locale');  // Dependency

const refTime = new Date("2020-09-03T16:00:00Z"); // Baseline time that everything will calculate off of
// Anchor point is currently September 3, 2020 at 9am PDT

window.onload = function() {
    // Generate default from and to dates
    const fromDate = new Date();
    var displayFromDate = datetimeLocale.toString(fromDate);  
    displayFromDate = displayFromDate.slice(0, displayFromDate.lastIndexOf(":"));   // Remove seconds from string
    $('#dateFrom').val(displayFromDate);

    var toDate = fromDate;
    const addedDays = 7;
    toDate.setDate(toDate.getDate() + addedDays); 
    var displayToDate = datetimeLocale.toString(toDate);  
    displayToDate = displayToDate.slice(0, displayToDate.lastIndexOf(":"));   // Remove seconds from string
    $('#dateTo').val(displayToDate);

}

function formValidation() {
    // If no checkboxes are selected, return an error
    var inputCheck = false;
    $('input[type="checkbox"]').each(function() {
        if ($(this).prop("checked"))
            inputCheck = true;
    })

    if(!inputCheck) {
        alert('No routes selected.');
        return inputCheck;
    }

    // Browser seems to check if datetime-local is filled correctly, so I won't touch on that.
}

function findRoutes() {

}

function recordInputs() {
    var selectedRoutes = new Array();
    $('input[type="checkbox"]').each(function() {
        if ($(this).prop("checked"))
            selectedRoutes.push($(this).attr('id'));
    })

}

function outputRoutes() {
    $('#results tbody').text('');    // Clear old results
}

/* CLASS DECLARATIONS */



/* EVENT LISTENERS */
$('#routeForm').submit(function(event) {
    event.preventDefault();

    if(!formValidation()) {
        return;
    }

    // Run main function

})


