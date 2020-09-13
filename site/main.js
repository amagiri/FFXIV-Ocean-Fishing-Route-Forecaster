var routeList = new Array();
var refRoute;
(function () {
    var routesURL = 'data/routes.json';
    var routesRequest = new XMLHttpRequest();
    routesRequest.overrideMimeType("application/json");
    routesRequest.open('GET', routesURL);
    routesRequest.send();
    routesRequest.onload = function () {
        var response = routesRequest.response;
        var parsedRoutes = JSON.parse(response);
        var routeKeys = Object.keys(parsedRoutes);
        routeKeys.forEach(function (route) {
            var name = parsedRoutes[route].routeName;
            var time = parsedRoutes[route].routeTime;
            var type = parsedRoutes[route].routeType;
            var key = route;
            var reference = new Route(name, time, type, key);
            routeList.push(reference);
        });
        refRoute = getRouteByKey('sunsetMerlthor', routeList);
        refRoute.datetime = dayjs("2020-09-03T16:00:00.000Z");
    };
    var fromDate = dayjs();
    var displayFromDate = fromDate.format('YYYY-MM-DD[T]HH:mm');
    $('#dateFrom').val(displayFromDate);
    var addedDays = 7;
    var toDate = fromDate.add(addedDays, 'day');
    var displayToDate = toDate.format('YYYY-MM-DD[T]HH:mm');
    $('#dateTo').val(displayToDate);
})();
function formValidation() {
    var inputCheck = false;
    $('input[type="checkbox"]').each(function () {
        if ($(this).prop("checked"))
            inputCheck = true;
    });
    if (!inputCheck) {
        alert('No routes selected.');
        return inputCheck;
    }
    var inputTimespan = getDateInputs();
    if (inputTimespan.end.diff(inputTimespan.start) < 0) {
        alert('Start time is larger than end time.');
        return false;
    }
    if (inputTimespan.start.diff(refRoute.datetime) < 0) {
        alert('This date is not supported.');
        return false;
    }
    return inputCheck;
}
function getSpecifiedRoutes() {
    var inputKeys = getRouteInputs();
    var inputTimespan = getDateInputs();
    adjustTimespan(refRoute, inputTimespan);
    var validRoutes = findAllRoutes(inputTimespan);
    validRoutes = filterRoutes(validRoutes, inputKeys);
    displayRoutes(validRoutes);
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
function filterRoutes(routeList, inputKeys) {
    var filteredRoutes = new Array();
    routeList.forEach(function (route) {
        if (inputKeys.includes(route.key)) {
            filteredRoutes.push(route);
        }
    });
    return filteredRoutes;
}
function getRouteInputs() {
    var selectedRoutes = new Array();
    $('input[type="checkbox"]').each(function () {
        if ($(this).prop("checked"))
            selectedRoutes.push($(this).attr('id'));
    });
    return selectedRoutes;
}
function getDateInputs() {
    var startDatetime = dayjs($('#dateFrom').val().toString());
    var endDatetime = dayjs($('#dateTo').val().toString());
    return new Period(startDatetime, endDatetime);
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
function displayRoutes(routeList) {
    var $results = $('#results tbody');
    $results.text('');
    routeList.forEach(function (route) {
        var jsDate = route.datetime.toDate();
        var $routeCell = $('<td></td>').text(route.routeName);
        var $timeCell = $('<td></td>').text(jsDate.toLocaleString([], { month: '2-digit', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short' }));
        var $row = $('<tr></tr>').append($routeCell).append($timeCell);
        $results.append($row);
    });
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
    console.log('bad times here.');
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
var Period = (function () {
    function Period(start, end) {
        this.start = start;
        this.end = end;
    }
    return Period;
}());
$('#routeForm').submit(function (event) {
    event.preventDefault();
    if (!formValidation()) {
        return;
    }
    getSpecifiedRoutes();
});
//# sourceMappingURL=main.js.map