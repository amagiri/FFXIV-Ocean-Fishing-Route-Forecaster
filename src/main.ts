import * as rf from "./routeFinder.js";

/* SETUP */
// Invoking an IIFE in conjunction with <script defer> to ensure page is loaded first
(function() {
    // Set up reference routes array and reference route/time
    rf.setup();

    // Generate default from and to datetimes
    const fromDate = dayjs();
    const jsFromDate: Date = fromDate.toDate();
    $('#dateFrom').flatpickr({enableTime: true, defaultDate: jsFromDate, dateFormat: "m-d-Y h:i K"});

    const addedDays = 7; 
    const toDate = fromDate.add(addedDays, 'day');
    const jsToDate: Date = toDate.toDate();
    $('#dateTo').flatpickr({enableTime: true, defaultDate: jsToDate, dateFormat: "m-d-Y h:i K"});
})();

// Validates form inputs on submit
function formValidation(refRoute: rf.Anchor) {
    // If no checkboxes are selected, return an error
    if ($('input[type="checkbox"]').filter(':checked').length === 0) {
        alert('No routes selected.');
        return;
    }

    // Browser seems to check if datetime-local is filled correctly, so I won't touch on that.
    // Check if start time is larger than end time
    const inputTimespan: rf.Period = getDateInputs();
    if (inputTimespan.end.diff(inputTimespan.start) < 0) {
        alert('Start time is larger than end time. Updating start date.')

        const fromInput = document.querySelector('#dateFrom')._flatpickr;
        const toInput = document.querySelector('#dateTo')._flatpickr;

        fromInput.setDate(toInput.selectedDates);
        return false;
    }

    if (inputTimespan.start.diff(refRoute.datetime) < 0 || inputTimespan.end.diff(refRoute.datetime) < 0) {
        alert('One or more of these dates is not supported. Updating dates.');

        if (inputTimespan.start.diff(refRoute.datetime) < 0) {
            const fromInput = document.querySelector('#dateFrom')._flatpickr;
            fromInput.setDate(dayjs().toDate());  // Sets start time to current time
        }

        if (inputTimespan.end.diff(refRoute.datetime) < 0) {
            const toInput = document.querySelector('#dateTo')._flatpickr;
            toInput.setDate(dayjs().toDate());  // Sets start time to current time
        }
        

        return false;
    }

    return true;
}

// Main function
function getSpecifiedRoutes(refRoute: rf.Anchor) {
    const inputKeys: string[] = getRouteInputs();
    var inputTimespan: rf.Period = getDateInputs();
    var inputRange = new rf.Range(0, 23);   // This is currently not supported on the web, so these are default values
    
    const validRoutes: rf.Solution[] = rf.default(refRoute, inputKeys, inputTimespan, inputRange);
    displayRoutes(validRoutes);
}

// Reads form route checkboxes
function getRouteInputs() {
    var selectedRoutes: string[] = new Array();
    $('input[type="checkbox"]').each(function() {
        if ($(this).prop("checked"))
            selectedRoutes.push($(this).attr('id'));
    })

    return selectedRoutes;
}

// Reads form datetime inputs
function getDateInputs() {
    const fromInput = document.querySelector('#dateFrom')._flatpickr;
    const startDatetime = dayjs(fromInput.selectedDates);

    const toInput = document.querySelector('#dateTo')._flatpickr;
    const endDatetime = dayjs(toInput.selectedDates);

    return new rf.Period(startDatetime, endDatetime);
}

// Displays routes in the results section
async function displayRoutes(results: rf.Solution[]) {
    // Import JSON for mapping keys to display names
    var nameMap = new Map<string, string>(); // Store a mapping of keywords to display names
    try {
        const nameResponse = await fetch('data/routeNames.json');
        const parsedNames = await nameResponse.json();
        mapDisplayNames(parsedNames, nameMap);
    } catch (error) {
        console.error(error);
        alert('Request failed');
        return;
    }

    const $results = $('#results tbody');
    $results.text('');  // Clear out old results

    results.forEach((route) => {
        const $routeCell = $('<td></td>').text(nameMap.get(route.key));
        const $timeCell = $('<td></td>').text(route.displayTime);
        const $row = $('<tr></tr>').append($routeCell).append($timeCell);
        $results.append($row);
    })
}

// Maps keywords to display names
function mapDisplayNames(parsedNames: NameList, nameMap: Map<string, string>) {
    parsedNames.names.forEach((value) => {
        nameMap.set(value.key, value.displayname);
    })
}


/* JSON IMPORT INTERFACES */
interface NameList {
    names: NameKeyPair[];
}

interface NameKeyPair {
    key: string;
    displayname: string;
}


/* EVENT LISTENERS */
$('#routeForm').on('submit', function(event) {
    event.preventDefault();

    const refRoute = rf.refRoute;

    if(!formValidation(refRoute)) {
        return;
    }

    // Run main function
    getSpecifiedRoutes(refRoute);
})

$('button#clearAll').on('click', function(event) {
    $('form input:checkbox').prop('checked', false);
})

$('button#clearRoute').on('click', function(event) {
    $('form #routeInputs input:checkbox').prop('checked', false);
})

$('button#clearFish').on('click', function(event) {
    $('form #fishInputs input:checkbox').prop('checked', false);
})