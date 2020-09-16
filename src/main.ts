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
function formValidation(routeList: rf.Route[], refRoute: rf.Route) {
    // If references are not ready, return an error
    if (routeList.length === 0 || refRoute == undefined) {
        alert('REEEEEEE');
        return;
    }

    // If no checkboxes are selected, return an error
    var inputCheck: boolean = false;
    $('input[type="checkbox"]').each(function() {
        if ($(this).prop("checked"))
            inputCheck = true;
    })

    if(!inputCheck) {
        alert('No routes selected.');
        return inputCheck;
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

    return inputCheck;
}

// Main function
function getSpecifiedRoutes(refRoute: rf.Route) {
    const inputKeys: string[] = getRouteInputs();
    var inputTimespan: rf.Period = getDateInputs();
    
    const validRoutes: rf.Route[] = rf.default(refRoute, inputKeys, inputTimespan);
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
function displayRoutes(routeList: rf.Route[]) {
    const $results = $('#results tbody');
    $results.text('');  // Clear out old results

    routeList.forEach((route) => {
        const jsDate: Date = route.datetime.toDate();

        const $routeCell = $('<td></td>').text(route.routeName);
        const $timeCell = $('<td></td>').text(jsDate.toLocaleString([], { month: '2-digit', day: '2-digit', year: '2-digit', hour: '2-digit', minute:'2-digit', hour12: true, timeZoneName: 'short'}));
        const $row = $('<tr></tr>').append($routeCell).append($timeCell);
        $results.append($row);
    })
}


/* EVENT LISTENERS */
$('#routeForm').on('submit', function(event) {
    event.preventDefault();

    const routeList = rf.routeList;
    const refRoute = rf.refRoute;

    if(!formValidation(routeList, refRoute)) {
        return;
    }

    // Run main function
    getSpecifiedRoutes(refRoute);
})


