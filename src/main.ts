var routeList: Route[] = new Array();

// Create a baseline Route that everything else will be calculated off of
var refRoute: Route; 

/* SETUP */
// Invoking an IIFE in conjunction with <script defer> to ensure page is loaded first
(function() {
    // Import route options JSON
    var routesURL = 'data/routes.json';
    var routesRequest = new XMLHttpRequest();
    routesRequest.overrideMimeType("application/json");
    routesRequest.open('GET', routesURL);
    routesRequest.send();
    routesRequest.onload = function() {
        var response = routesRequest.response;
        var parsedRoutes = JSON.parse(response);
        var routeKeys = Object.keys(parsedRoutes);
        routeKeys.forEach(function(route) {
            const name: string = parsedRoutes[route].routeName;
            const time: string = parsedRoutes[route].routeTime;
            const type: string = parsedRoutes[route].routeType;
            const key: string = route;

            var reference = new Route(name, time, type, key);
            routeList.push(reference);  // Generates global variable list of current routes
        });

        refRoute = getRouteByKey('sunsetMerlthor', routeList);   // Anchor route is Northern Strait of Merlthor at sunset
        refRoute.datetime = dayjs("2020-09-03T16:00:00.000Z"); // Anchor time is currently September 3, 2020 at 9am PDT
    };

    // Generate default from and to dates
    const fromDate = dayjs();
    var displayFromDate: string = fromDate.format('YYYY-MM-DD[T]HH:mm');
    $('#dateFrom').val(displayFromDate);

    const addedDays = 7; 
    var toDate = fromDate.add(addedDays, 'day');
    var displayToDate: string = toDate.format('YYYY-MM-DD[T]HH:mm');
    $('#dateTo').val(displayToDate);

})();

function formValidation() {
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
    const inputTimespan: Period = getDateInputs();
    if (inputTimespan.end.diff(inputTimespan.start) < 0) {
        alert('Start time is larger than end time.')
        return false;
    }

    if (inputTimespan.start.diff(refRoute.datetime) < 0) {
        alert('This date is not supported.');
        return false;
    }

    return inputCheck;
}

// Main function
function getSpecifiedRoutes() {
    const inputKeys: string[] = getRouteInputs();
    var inputTimespan: Period = getDateInputs();
    adjustTimespan(refRoute, inputTimespan);    // Adjust timespan relative to the reference so that it starts and ends on a route time

    var validRoutes = findAllRoutes(inputTimespan);
    validRoutes = filterRoutes(validRoutes, inputKeys);

    displayRoutes(validRoutes);
}

// Finds all routes
function findAllRoutes(timespan: Period) {
    var outputRoutes: Route[] = new Array();
    var currentTime: Dayjs = timespan.start;

    while (timespan.end.diff(currentTime) > 0) {
        outputRoutes.push(getRoute(refRoute, currentTime));

        currentTime = currentTime.add(2, 'hour');   // Move forward two hours
    } 

    return outputRoutes;
}

function filterRoutes(routeList: Route[], inputKeys: string[]) {
    var filteredRoutes: Route[] = new Array();

    routeList.forEach((route) => {
        if (inputKeys.includes(route.key)) {
            filteredRoutes.push(route);
        }
    })

    return filteredRoutes;
}

function getRouteInputs() {
    var selectedRoutes: string[] = new Array();
    $('input[type="checkbox"]').each(function() {
        if ($(this).prop("checked"))
            selectedRoutes.push($(this).attr('id'));
    })

    return selectedRoutes;
}

function getDateInputs() {
    // These will not have seconds/millisecond values
    const startDatetime = dayjs($('#dateFrom').val().toString());
    const endDatetime = dayjs($('#dateTo').val().toString());

    return new Period(startDatetime, endDatetime);
}

function adjustTimespan(refRoute: Route, timespan: Period) {
    // Round start period up to the nearset hour
    timespan.start = timespan.start.minute(0);   
    timespan.start = timespan.start.add(1, 'hour');  
    // If num in setHours(num) exceeds 23, the day will increment, so I will not check for overflow
    // Likewise if it is less than 0, the day will decrement

    timespan.end = timespan.end.minute(0); // Round end period down

    // Adjust start and end times as necessary so that they are in increments of 2 from the reference
    const refHour = refRoute.datetime.hour();

    if (((timespan.start.hour() - refHour) % 2) != 0) {
        timespan.start = timespan.start.add(1, 'hour'); // Increment one hour if the difference is odd
    }

    if (((timespan.end.hour() - refHour) % 2) != 0) {
        timespan.end = timespan.end.subtract(1, 'hour'); // Decrement one hour if the difference is odd
    }

    return;
}

function getRoute(refRoute: Route, inputTime: Dayjs) {
    const timeElapsed: number = inputTime.diff(refRoute.datetime);
    const hourConversion = 1000 * 60 * 60;
    const totalHours = timeElapsed/hourConversion;  // This should always be a whole number due to our earlier rounding

    const daysElapsed = Math.floor(totalHours/24);
    const hoursPassed = totalHours % 24;

    const dailySchedule = ['sunset', 'sunset', 'night', 'night', 'day', 'day'];
    const sailingRoutes = ['Northern Strait of Merlthor', 'Open Rhotano Sea'];
    const sailingTimes = ['sunset', 'night', 'day'];

    const dailyStartTime = dailySchedule[daysElapsed % 6];
    const dailyStartRoute = sailingRoutes[daysElapsed % 2];
    
    var hourlyRoute: string;
    if (hoursPassed % 4 > 0) {  // 2 for flip, 0 for matching route
        var filteredRoute = sailingRoutes.slice(0);
        filteredRoute.splice(filteredRoute.indexOf(dailyStartRoute), 1);
        hourlyRoute = filteredRoute[0];
    }
    else {
        hourlyRoute = dailyStartRoute;
    }

    var hourlyTime: string;
    switch (hoursPassed % 12) {
        case 0:
        case 2:
            hourlyTime = dailyStartTime;
            break;
        case 4:
        case 6:
            var skip = 1;
            if ((sailingTimes.indexOf(dailyStartTime) + skip) < sailingTimes.length) {
                let i: number = sailingTimes.indexOf(dailyStartTime) + skip;
                hourlyTime = sailingTimes[i];
            }
            else {
                let i: number = sailingTimes.indexOf(dailyStartTime) - (sailingTimes.length - skip);    // Looping
                hourlyTime = sailingTimes[i];
            }
            break;
        case 8:
        case 10:
            var skip = 2;
            if ((sailingTimes.indexOf(dailyStartTime) + skip) < sailingTimes.length) {
                let i: number = sailingTimes.indexOf(dailyStartTime) + skip;
                hourlyTime = sailingTimes[i];
            }
            else {
                let i: number = sailingTimes.indexOf(dailyStartTime) - (sailingTimes.length - skip);    // Looping
                hourlyTime = sailingTimes[i];
            }
            break;
        default:
            console.log('LOL SHRUG');
            break;
    }

    var currentRoute = getRouteByNameTime(hourlyRoute, hourlyTime);
    currentRoute.datetime = dayjs(inputTime);

    return currentRoute;
}

function displayRoutes(routeList: Route[]) {
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


/* UTILITY FUNCTIONS */
// Returns a route for a given key/id
function getRouteByKey(routeKey: string, routeList: Route[]) {
    for (let i = 0; i < routeList.length; i++) {
        if (routeKey === routeList[i].key) {
            const route: Route = JSON.parse(JSON.stringify(routeList[i]));

            return route;
        }
    }
}

function getRouteByNameTime(routeType: string, routeTime: string) {
    for (let i = 0; i < routeList.length; i++) {
        if (routeType === routeList[i].routeType && routeTime === routeList[i].routeTime) {
            const route: Route = JSON.parse(JSON.stringify(routeList[i]));

            return route;
        }
    }

    console.log('bad times here.');
}


/* CLASS DECLARATIONS */
class Route {
    routeName: string;
    routeTime: string;
    routeType: string;
    key: string;
    datetime: Dayjs;

    constructor(name: string, time: string, type: string, key: string) {
        this.routeName = name;
        this.routeTime = time;
        this.routeType = type;
        this.key = key;
    }
}

class Period {
    start: Dayjs;
    end: Dayjs;

    constructor(start: Dayjs, end: Dayjs) {
        this.start = start;
        this.end = end;
    }
}


/* EVENT LISTENERS */
$('#routeForm').submit(function(event) {
    event.preventDefault();

    if(!formValidation()) {
        return;
    }

    // Run main function
    getSpecifiedRoutes();
})


