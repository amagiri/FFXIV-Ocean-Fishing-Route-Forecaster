var routeMap = new Map<string, string[]>();  // Stores a mapping of criteria to keywords
export var refRoute: Anchor; // Stores a baseline Route that everything else will be calculated off of


/* SETUP */
// Adds default route options to a reference array
export async function setup() {
    // Import route options JSON
    try {
        const routeResponse = await fetch('data/routeKeys.json');
        var parsedKeys = await routeResponse.json();
        mapRouteIdentifiers(parsedKeys);

        refRoute = new Anchor("sunsetMerlthor", "2020-09-03T16:00:00.000Z"); // Sets anchor time and route with which everything will be calculated
    } catch (error) {
        console.error(error);
        return;
    }
}

// Maps route criteria to keywords
function mapRouteIdentifiers(parsedRoutes: KeyList) {
    parsedRoutes.keywords.forEach((value) => {
        routeMap.set(value.name, value.routes);
    })
}


/* MAIN FUNCTION */
export default function main(refRoute: Anchor, inputKeys: string[], inputTimespan: Period, inputRange: Range) {
    const validKeys = convertKeys(inputKeys);
    adjustTimespan(refRoute, inputTimespan);    // Adjust timespan relative to the reference so that it starts and ends on a route time
    var validHours: number[] = filterHours(refRoute, inputRange);

    var totalRoutes = findAllRoutes(inputTimespan);
    var validRoutes = filterRoutes(totalRoutes, validKeys, validHours);

    return validRoutes;
}

function convertKeys(inputKeys: string[]) {
    var validSet = new Set<string>();
    inputKeys.forEach((key) => {
        if (routeMap.has(key)) {
            var values: string[] = routeMap.get(key);
            values.forEach((value) => {
                if (!validSet.has(value)) {
                    validSet.add(value);
                }
            })
        }
        else {
            if (!validSet.has(key)) {
                validSet.add(key);
            }
        }
    })

    const validKeys = Array.from(validSet);
    return validKeys;
}

function adjustTimespan(refRoute: Anchor, timespan: Period) {
    // Round start period up to the nearset hour
    timespan.start = timespan.start.millisecond(0);
    timespan.start = timespan.start.second(0);
    timespan.start = timespan.start.minute(0);   
    timespan.start = timespan.start.add(1, 'hour');  
    // If num in setHours(num) exceeds 23, the day will increment, so I will not check for overflow
    // Likewise if it is less than 0, the day will decrement

    timespan.end = timespan.end.minute(0); // Round end period down
    timespan.end = timespan.end.second(0);
    timespan.end = timespan.end.minute(0);   

    // Adjust start and end times as necessary so that they are in increments of 2 from the reference
    const refHour = refRoute.datetime.hour();

    if (((timespan.start.hour() - refHour) % 2) != 0) {
        timespan.start = timespan.start.add(1, 'hour'); // Increment one hour if the difference is odd
    }

    if (((timespan.end.hour() - refHour) % 2) != 0) {
        timespan.end = timespan.end.subtract(1, 'hour'); // Decrement one hour if the difference is odd
    }
}

function filterHours(refRoute: Anchor, inputRange: Range) {
    var validHours: number[] = new Array();
    const refHour = refRoute.datetime.hour();
    var currentHour = inputRange.start;

    while (currentHour <= inputRange.end) {
        if (Math.abs(currentHour - refHour) % 2 === 0) {    // If the time is apart by a multiple of two, then it is a valid route hour
            validHours.push(currentHour);     
        }
        currentHour++;
    }

    return validHours;
}


// Finds all routes
function findAllRoutes(timespan: Period): RawSolution[] {
    var outputRoutes: RawSolution[] = new Array();
    var currentTime: Dayjs = timespan.start;

    while (timespan.end.diff(currentTime) >= 0) {
        outputRoutes.push(getRoute(refRoute, currentTime));

        currentTime = currentTime.add(2, 'hour');   // Move forward two hours
    } 

    return outputRoutes;
}

function getRoute(refRoute: Anchor, inputTime: Dayjs): RawSolution {
    const timeElapsed: number = inputTime.diff(refRoute.datetime);
    const hourConversion = 1000 * 60 * 60;
    const totalHours = timeElapsed/hourConversion;  // This should always be a whole number due to our earlier rounding

    const daysElapsed = Math.floor(totalHours/24);
    const hoursPassed = totalHours % 24;

    const dailySchedule = ['sunset', 'sunset', 'night', 'night', 'day', 'day']; // IMPORTANT: This is set up relative to the anchor point, so this will need to be updated if the anchor point is changed
    const sailingRoutes = ['Merlthor', 'Rhotano'];
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

    const currentHour = inputTime.hour();
    const currentRoute = hourlyTime.concat(hourlyRoute);    // Generate the keyword for the given combination
    const jsDate: Date = inputTime.toDate();    // Convert dayjs object back to JavaScript Date object
    const displayDate: string = jsDate.toLocaleString([], { month: '2-digit', day: '2-digit', year: '2-digit', hour: '2-digit', minute:'2-digit', hour12: true, timeZoneName: 'short'});    // Convert to string

    return new RawSolution(currentRoute, displayDate, currentHour);
}

function filterRoutes(routeList: RawSolution[], inputKeys: string[], validHours: number[]) {
    var filteredRoutes: Solution[] = new Array();

    routeList.forEach((route) => {
        if (inputKeys.includes(route.key) && validHours.includes(route.hour)) {
            filteredRoutes.push(route);
        }
    })

    return filteredRoutes;
}


/* UTILITY FUNCTIONS */
function getRoutesByCriteria(criteria: string[]): string | string[] {
    var route: string;
    criteria.forEach((input) => {

    })

    return route;
}

/* CLASS DECLARATIONS */
export class Anchor {
    key: string;
    datetime: Dayjs;

    constructor(key: string, datetime: string) {
        this.key = key;
        this.datetime = dayjs(datetime);
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

export class Solution {
    key: string;
    displayTime: string;

    constructor(key: string, displayTime: string) {
        this.key = key;
        this.displayTime = displayTime;
    }
}

class RawSolution extends Solution {
    hour: number;

    constructor(key: string, displayTime: string, hour: number) {
        super(key, displayTime);
        this.hour = hour;
    }
}

export class Range {
    start: number;
    end: number;

    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
    }
}


/* JSON IMPORT INTERFACES */
interface KeyList {
    keywords: RouteKeyword[];
}

interface RouteKeyword {
    name: string;
    routes: string[];
}