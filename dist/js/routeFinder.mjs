export var routeList = new Array();
export var refRoute;
export function setup() {
    var routesURL = 'data/routes.json';
    var routesRequest = new XMLHttpRequest();
    routesRequest.overrideMimeType("application/json");
    routesRequest.open('GET', routesURL);
    routesRequest.send();
    routesRequest.onload = function () {
        var response = routesRequest.response;
        var parsedRoutes = JSON.parse(response);
        importRoutes(routeList, parsedRoutes);
        refRoute = setAnchor(routeList, refRoute);
        return;
    };
}
function importRoutes(routeList, parsedRoutes) {
    var routeKeys = Object.keys(parsedRoutes);
    routeKeys.forEach(function (route) {
        var name = parsedRoutes[route].routeName;
        var time = parsedRoutes[route].routeTime;
        var type = parsedRoutes[route].routeType;
        var key = route;
        var reference = new Route(name, time, type, key);
        routeList.push(reference);
    });
}
function setAnchor(routeList, refRoute) {
    refRoute = getRouteByKey('sunsetMerlthor', routeList);
    refRoute.datetime = dayjs("2020-09-03T16:00:00.000Z");
    return refRoute;
}
export default function main(refRoute, inputKeys, inputTimespan) {
    adjustTimespan(refRoute, inputTimespan);
    var validRoutes = findAllRoutes(inputTimespan);
    validRoutes = filterRoutes(validRoutes, inputKeys);
    return validRoutes;
}
function adjustTimespan(refRoute, timespan) {
    timespan.start = timespan.start.minute(0);
    timespan.start = timespan.start.add(1, 'hour');
    timespan.end = timespan.end.minute(0);
    var refHour = refRoute.datetime.hour();
    if (((timespan.start.hour() - refHour) % 2) != 0) {
        timespan.start = timespan.start.add(1, 'hour');
    }
    if (((timespan.end.hour() - refHour) % 2) != 0) {
        timespan.end = timespan.end.subtract(1, 'hour');
    }
    return;
}
function findAllRoutes(timespan) {
    var outputRoutes = new Array();
    var currentTime = timespan.start;
    while (timespan.end.diff(currentTime) > 0) {
        outputRoutes.push(getRoute(refRoute, currentTime));
        currentTime = currentTime.add(2, 'hour');
    }
    return outputRoutes;
}
function getRoute(refRoute, inputTime) {
    var timeElapsed = inputTime.diff(refRoute.datetime);
    var hourConversion = 1000 * 60 * 60;
    var totalHours = timeElapsed / hourConversion;
    var daysElapsed = Math.floor(totalHours / 24);
    var hoursPassed = totalHours % 24;
    var dailySchedule = ['sunset', 'sunset', 'night', 'night', 'day', 'day'];
    var sailingRoutes = ['Northern Strait of Merlthor', 'Open Rhotano Sea'];
    var sailingTimes = ['sunset', 'night', 'day'];
    var dailyStartTime = dailySchedule[daysElapsed % 6];
    var dailyStartRoute = sailingRoutes[daysElapsed % 2];
    var hourlyRoute;
    if (hoursPassed % 4 > 0) {
        var filteredRoute = sailingRoutes.slice(0);
        filteredRoute.splice(filteredRoute.indexOf(dailyStartRoute), 1);
        hourlyRoute = filteredRoute[0];
    }
    else {
        hourlyRoute = dailyStartRoute;
    }
    var hourlyTime;
    switch (hoursPassed % 12) {
        case 0:
        case 2:
            hourlyTime = dailyStartTime;
            break;
        case 4:
        case 6:
            var skip = 1;
            if ((sailingTimes.indexOf(dailyStartTime) + skip) < sailingTimes.length) {
                var i = sailingTimes.indexOf(dailyStartTime) + skip;
                hourlyTime = sailingTimes[i];
            }
            else {
                var i = sailingTimes.indexOf(dailyStartTime) - (sailingTimes.length - skip);
                hourlyTime = sailingTimes[i];
            }
            break;
        case 8:
        case 10:
            var skip = 2;
            if ((sailingTimes.indexOf(dailyStartTime) + skip) < sailingTimes.length) {
                var i = sailingTimes.indexOf(dailyStartTime) + skip;
                hourlyTime = sailingTimes[i];
            }
            else {
                var i = sailingTimes.indexOf(dailyStartTime) - (sailingTimes.length - skip);
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
function filterRoutes(routeList, inputKeys) {
    var filteredRoutes = new Array();
    routeList.forEach(function (route) {
        if (inputKeys.includes(route.key)) {
            filteredRoutes.push(route);
        }
    });
    return filteredRoutes;
}
function getRouteByKey(routeKey, routeList) {
    for (var i = 0; i < routeList.length; i++) {
        if (routeKey === routeList[i].key) {
            var route = JSON.parse(JSON.stringify(routeList[i]));
            return route;
        }
    }
}
function getRouteByNameTime(routeType, routeTime) {
    for (var i = 0; i < routeList.length; i++) {
        if (routeType === routeList[i].routeType && routeTime === routeList[i].routeTime) {
            var route = JSON.parse(JSON.stringify(routeList[i]));
            return route;
        }
    }
}
var Route = (function () {
    function Route(name, time, type, key) {
        this.routeName = name;
        this.routeTime = time;
        this.routeType = type;
        this.key = key;
    }
    return Route;
}());
export { Route };
var Period = (function () {
    function Period(start, end) {
        this.start = start;
        this.end = end;
    }
    return Period;
}());
export { Period };
