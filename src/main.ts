import * as rf from "./routeFinder.ts";
var dayjs = require("dayjs");
// var flatpickr = require("flatpickr");
import $ from "jquery";
// import "bootstrap";
require("bootstrap");
// import "bootstrap-select";
// require("flatpickr");
import flatpickr from "flatpickr";
import parsedNames from '../data/routeNames.json';


/* SETUP */
// Invoking an IIFE in conjunction with <script defer> to ensure page is loaded first
(async function() {
    // Set up reference routes array and reference route/time
    await rf.setup();

    // Generate default from and to datetimes
    const fromDate = dayjs();
    const jsFromDate: Date = fromDate.toDate();
    // $('#dateFrom').flatpickr({enableTime: true, defaultDate: jsFromDate, dateFormat: "m-d-Y h:i K"});
    flatpickr('#dateFrom', {enableTime: true, defaultDate: jsFromDate, dateFormat: "m-d-Y h:i K"});

    const addedDays = 7; 
    const toDate = fromDate.add(addedDays, 'day');
    const jsToDate: Date = toDate.toDate();
    // $('#dateTo').flatpickr({enableTime: true, defaultDate: jsToDate, dateFormat: "m-d-Y h:i K"});
    flatpickr('#dateTo', {enableTime: true, defaultDate: jsToDate, dateFormat: "m-d-Y h:i K"});

    // Run route finder with default settings
    const refRoute = rf.refRoute;

    getRoutes(refRoute);
})();

// Validates form inputs on submit
function evaluateCriteria(refRoute: rf.Anchor) {
    // Browser seems to check if datetime-local is filled correctly, so I won't touch on that.
    // Check if start time is larger than end time
    const inputTimespan: rf.Period = getDateInputs();
    if (inputTimespan.end.diff(inputTimespan.start) < 0) {
        alert('Start time is larger than end time. Updating start date.')

        const fromInput = flatpickr('#dateFrom', {});
        const toInput = flatpickr('#dateTo', {});

        fromInput.setDate(toInput.selectedDates, true, "m-d-Y h:i K");

        return false;
    }

    if (inputTimespan.start.diff(refRoute.datetime) < 0 || inputTimespan.end.diff(refRoute.datetime) < 0) {
        alert('One or more of these dates is not supported. Updating dates.');

        if (inputTimespan.start.diff(refRoute.datetime) < 0) {
            const fromInput = flatpickr('#dateFrom', {});
            fromInput.setDate(dayjs().toDate());  // Sets start time to current time
        }

        if (inputTimespan.end.diff(refRoute.datetime) < 0) {
            const toInput = flatpickr('#dateTo', {});
            toInput.setDate(dayjs().toDate());  // Sets start time to current time
        }
        

        return false;
    }

    return true;
}

// Main function
function getRoutes(refRoute: rf.Anchor) {
    const inputKeys: string[] = getRouteInputs();
    var inputTimespan: rf.Period = getDateInputs();
    
    const validRoutes: rf.Solution[] = rf.default(refRoute, inputKeys, inputTimespan);
    displayRoutes(validRoutes);
}

// Reads form route checkboxes
function getRouteInputs() {
    var selectedRoutes: string[] = new Array();
    $('#routeFilters input[type="checkbox"]').each(function() {
        if ($(this).prop("checked"))
            selectedRoutes.push($(this).attr('id'));
    })

    // If nothing is selected, default to displaying everything instead
    if (selectedRoutes.length === 0) {
        $('#routeFilters input[type="checkbox"]').each(function() {
            selectedRoutes.push($(this).attr('id'));
        })
    }

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
        // const nameResponse = await fetch('data/routeNames.json');
        // const parsedNames = await nameResponse.json();
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
$('#routeFilters').on('change', function(event) {
    event.preventDefault();

    const refRoute = rf.refRoute;

    if(!evaluateCriteria(refRoute)) {
        return;
    }

    // Run main function
    getRoutes(refRoute);
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

$('#routeFilters input:checkbox').on('click', function(event) {
    // Updates icon to correct status
    if ($(this).prop('checked')) {
        $(this).parent().find('i').text('remove_circle');
    }
    else {
        $(this).parent().find('i').text('add_circle');    
    }

    // Runs route finder
    const refRoute = rf.refRoute;

    if(!evaluateCriteria(refRoute)) {
        return;
    }

    // Run main function
    getRoutes(refRoute);
})
