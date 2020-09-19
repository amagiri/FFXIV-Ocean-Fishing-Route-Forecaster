var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var routeMap = new Map();
export var refRoute;
export function setup() {
    return __awaiter(this, void 0, void 0, function () {
        var routeResponse, parsedKeys, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4, fetch('data/routeKeys.json')];
                case 1:
                    routeResponse = _a.sent();
                    return [4, routeResponse.json()];
                case 2:
                    parsedKeys = _a.sent();
                    mapRouteIdentifiers(parsedKeys);
                    refRoute = new Anchor("sunsetMerlthor", "2020-09-03T16:00:00.000Z");
                    return [3, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [2];
                case 4: return [2];
            }
        });
    });
}
function mapRouteIdentifiers(parsedRoutes) {
    parsedRoutes.keywords.forEach(function (value) {
        routeMap.set(value.name, value.routes);
    });
}
export default function main(refRoute, inputKeys, inputTimespan, inputRange) {
    var validKeys = convertKeys(inputKeys);
    adjustTimespan(refRoute, inputTimespan);
    var validHours = filterHours(refRoute, inputRange);
    var totalRoutes = findAllRoutes(inputTimespan);
    var validRoutes = filterRoutes(totalRoutes, validKeys, validHours);
    return validRoutes;
}
function convertKeys(inputKeys) {
    var validSet = new Set();
    inputKeys.forEach(function (key) {
        if (routeMap.has(key)) {
            var values = routeMap.get(key);
            values.forEach(function (value) {
                if (!validSet.has(value)) {
                    validSet.add(value);
                }
            });
        }
        else {
            if (!validSet.has(key)) {
                validSet.add(key);
            }
        }
    });
    var validKeys = Array.from(validSet);
    return validKeys;
}
function adjustTimespan(refRoute, timespan) {
    timespan.start = timespan.start.millisecond(0);
    timespan.start = timespan.start.second(0);
    timespan.start = timespan.start.minute(0);
    timespan.start = timespan.start.add(1, 'hour');
    timespan.end = timespan.end.minute(0);
    timespan.end = timespan.end.second(0);
    timespan.end = timespan.end.minute(0);
    var refHour = refRoute.datetime.hour();
    if (((timespan.start.hour() - refHour) % 2) != 0) {
        timespan.start = timespan.start.add(1, 'hour');
    }
    if (((timespan.end.hour() - refHour) % 2) != 0) {
        timespan.end = timespan.end.subtract(1, 'hour');
    }
}
function filterHours(refRoute, inputRange) {
    var validHours = new Array();
    var refHour = refRoute.datetime.hour();
    var currentHour = inputRange.start;
    while (currentHour <= inputRange.end) {
        if (Math.abs(currentHour - refHour) % 2 === 0) {
            validHours.push(currentHour);
        }
        currentHour++;
    }
    return validHours;
}
function findAllRoutes(timespan) {
    var outputRoutes = new Array();
    var currentTime = timespan.start;
    while (timespan.end.diff(currentTime) >= 0) {
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
    var sailingRoutes = ['Merlthor', 'Rhotano'];
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
    var currentHour = inputTime.hour();
    var currentRoute = hourlyTime.concat(hourlyRoute);
    var jsDate = inputTime.toDate();
    var displayDate = jsDate.toLocaleString([], { month: '2-digit', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short' });
    return new RawSolution(currentRoute, displayDate, currentHour);
}
function filterRoutes(routeList, inputKeys, validHours) {
    var filteredRoutes = new Array();
    routeList.forEach(function (route) {
        if (inputKeys.includes(route.key) && validHours.includes(route.hour)) {
            filteredRoutes.push(route);
        }
    });
    return filteredRoutes;
}
function getRoutesByCriteria(criteria) {
    var route;
    criteria.forEach(function (input) {
    });
    return route;
}
var Anchor = (function () {
    function Anchor(key, datetime) {
        this.key = key;
        this.datetime = dayjs(datetime);
    }
    return Anchor;
}());
export { Anchor };
var Period = (function () {
    function Period(start, end) {
        this.start = start;
        this.end = end;
    }
    return Period;
}());
export { Period };
var Solution = (function () {
    function Solution(key, displayTime) {
        this.key = key;
        this.displayTime = displayTime;
    }
    return Solution;
}());
export { Solution };
var RawSolution = (function (_super) {
    __extends(RawSolution, _super);
    function RawSolution(key, displayTime, hour) {
        var _this = _super.call(this, key, displayTime) || this;
        _this.hour = hour;
        return _this;
    }
    return RawSolution;
}(Solution));
var Range = (function () {
    function Range(start, end) {
        this.start = start;
        this.end = end;
    }
    return Range;
}());
export { Range };
//# sourceMappingURL=routeFinder.js.map