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
                    refRoute = new Anchor("dayBloodbrine", "2020-12-08T16:00:00.000Z");
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
export default function main(refRoute, inputKeys, inputTimespan) {
    var validKeys = convertKeys(inputKeys);
    adjustTimespan(refRoute, inputTimespan);
    var totalRoutes = findAllRoutes(inputTimespan);
    var validRoutes = filterRoutes(totalRoutes, validKeys);
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
    var startHourDiff = timespan.start.subtract(refRoute.datetime).hour();
    if ((startHourDiff % 2) != 0) {
        timespan.start = timespan.start.add(1, 'hour');
    }
    var endHourDiff = timespan.start.subtract(refRoute.datetime).hour();
    if ((endHourDiff % 2) != 0) {
        timespan.end = timespan.end.subtract(1, 'hour');
    }
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
    var routesElapsed = hoursPassed / 2;
    var sailingRoutes = ['Bloodbrine', 'Rothlyt', 'Merlthor', 'Rhotano'];
    var sailingTimes = ['day', 'sunset', 'night'];
    var hourlyRoute = sailingRoutes[(daysElapsed + routesElapsed) % 4];
    var hourlyTime = sailingTimes[Math.floor((daysElapsed + routesElapsed) / 4) % 3];
    var currentRoute = hourlyTime.concat(hourlyRoute);
    var jsDate = inputTime.toDate();
    var displayDate = jsDate.toLocaleString([], { month: '2-digit', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short' });
    return new Solution(currentRoute, displayDate);
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
//# sourceMappingURL=routeFinder.js.map