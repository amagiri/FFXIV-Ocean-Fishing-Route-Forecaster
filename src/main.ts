import * as rf from "./routeFinder.js";

/* SETUP */
// Invoking an IIFE in conjunction with <script defer> to ensure page is loaded first
(function() {
    // Sets up reference routes array and reference route/time
    rf.setup();

    // Generate default from and to dates
    const fromDate = dayjs();
    var displayFromDate: string = fromDate.format('YYYY-MM-DD[T]HH:mm');
    $('#dateFrom').val(displayFromDate);

    const addedDays = 7; 
    var toDate = fromDate.add(addedDays, 'day');
    var displayToDate: string = toDate.format('YYYY-MM-DD[T]HH:mm');
    $('#dateTo').val(displayToDate);
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
        alert('Start time is larger than end time. Updating start value.')

        const displayFromDate: string = inputTimespan.end.format('YYYY-MM-DD[T]HH:mm');
        $('#dateFrom').val(displayFromDate);  // Sets start time to end time
        return false;
    }

    if (inputTimespan.start.diff(refRoute.datetime) < 0) {
        alert('This date is not supported. Updating start value.');

        const displayFromDate: string = refRoute.datetime.format('YYYY-MM-DD[T]HH:mm');
        $('#dateFrom').val(displayFromDate);    // Sets start time to first supported time
        return false;
    }

    return true;
}

// Main function
function getSpecifiedRoutes(refRoute: rf.Anchor) {
    const inputKeys: string[] = getRouteInputs();
    var inputTimespan: rf.Period = getDateInputs();
    
    const validRoutes: rf.Solution[] = rf.default(refRoute, inputKeys, inputTimespan);
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
    // These will not have seconds/millisecond values
    const startDatetime = dayjs($('#dateFrom').val().toString(), 'YYYY-MM-DD[T]HH:mm');
    const endDatetime = dayjs($('#dateTo').val().toString(), 'YYYY-MM-DD[T]HH:mm');

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


