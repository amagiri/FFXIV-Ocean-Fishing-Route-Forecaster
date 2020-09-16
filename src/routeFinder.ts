// Stores the list of routes
export var routeList: Route[] = new Array();

// Stores a baseline Route that everything else will be calculated off of
export var refRoute: Route; 


/* SETUP */
// Adds default route options to a reference array
export async function setup() {
    // Import route options JSON
    var parsedRoutes;
    try {
        const response = await fetch('data/routes.json');
        parsedRoutes = await response.json();

        importRoutes(routeList, parsedRoutes);
        refRoute = setAnchor(routeList, refRoute);
    } catch (error) {
        console.error(error);
        alert('Request failed');
        return;
    }
}

// Import route options
function importRoutes(routeList: Route[], parsedRoutes: Object[]) {
    var routeKeys: string[] = Object.keys(parsedRoutes);
    routeKeys.forEach((route) => {
        const name: string = parsedRoutes[route].routeName;
        const time: string = parsedRoutes[route].routeTime;
        const loc: string = parsedRoutes[route].routeLocation;
        const fish: string = parsedRoutes[route].fishType;
        const key: string = route;

        var reference = new Route(name, time, loc, key, fish);
        routeList.push(reference);  // Generates global variable list of current routes
    });
}

// Sets anchor time and route with which everything will be calculated
function setAnchor(routeList: Route[], refRoute: Route) {
    refRoute = getRouteByKey('sunsetMerlthor', routeList);   // Anchor route is Northern Strait of Merlthor at sunset
    refRoute.datetime = dayjs("2020-09-03T16:00:00.000Z"); // Anchor time is currently September 3, 2020 at 9am PDT

    return refRoute;
}


/* MAIN FUNCTION */
export default function main(refRoute: Route, inputKeys: string[], inputTimespan: Period) {
    adjustTimespan(refRoute, inputTimespan);    // Adjust timespan relative to the reference so that it starts and ends on a route time

    var validRoutes = findAllRoutes(inputTimespan);
    validRoutes = filterRoutes(validRoutes, inputKeys);

    return validRoutes;
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

    var currentRoute = getRouteByLocTime(hourlyRoute, hourlyTime);
    currentRoute.datetime = dayjs(inputTime);

    return currentRoute;
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

// Returns a route for a given route name and time combination
function getRouteByLocTime(routeType: string, routeTime: string) {
    for (let i = 0; i < routeList.length; i++) {
        if (routeType === routeList[i].routeLocation && routeTime === routeList[i].routeTime) {
            const route: Route = JSON.parse(JSON.stringify(routeList[i]));

            return route;
        }
    }
}


/* CLASS DECLARATIONS */
export class Route {
    routeName: string;
    routeTime: string;
    routeLocation: string;
    fishType: string;
    key: string;
    datetime: Dayjs;

    constructor(name: string, time: string, loc: string, key: string, fish: string) {
        this.routeName = name;
        this.routeTime = time;
        this.fishType = fish;
        this.routeLocation = loc;
        this.key = key;
    }
}

export class Period {
    start: Dayjs;
    end: Dayjs;

    constructor(start: Dayjs, end: Dayjs) {
        this.start = start;
        this.end = end;
    }
}