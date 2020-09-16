var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
export var routeList = new Array();
export var refRoute;
export function setup() {
    return __awaiter(this, void 0, void 0, function () {
        var parsedRoutes, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4, fetch('data/routes.json')];
                case 1:
                    response = _a.sent();
                    return [4, response.json()];
                case 2:
                    parsedRoutes = _a.sent();
                    importRoutes(routeList, parsedRoutes);
                    refRoute = setAnchor(routeList, refRoute);
                    return [3, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error(error_1);
                    alert('Request failed');
                    return [2];
                case 4: return [2];
            }
        });
    });
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
