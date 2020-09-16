import * as rf from "./routeFinder.js";
(function () {
    rf.setup();
    var fromDate = dayjs();
    var displayFromDate = fromDate.format('YYYY-MM-DD[T]HH:mm');
    $('#dateFrom').val(displayFromDate);
    var addedDays = 7;
    var toDate = fromDate.add(addedDays, 'day');
    var displayToDate = toDate.format('YYYY-MM-DD[T]HH:mm');
    $('#dateTo').val(displayToDate);
})();
function formValidation(routeList, refRoute) {
    if (routeList.length === 0 || refRoute == undefined) {
        alert('REEEEEEE');
        return;
    }
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
        alert('Start time is larger than end time. Updating start value.');
        var displayFromDate = inputTimespan.end.format('YYYY-MM-DD[T]HH:mm');
        $('#dateFrom').val(displayFromDate);
        return false;
    }
    if (inputTimespan.start.diff(refRoute.datetime) < 0) {
        alert('This date is not supported. Updating start value.');
        var displayFromDate = refRoute.datetime.format('YYYY-MM-DD[T]HH:mm');
        $('#dateFrom').val(displayFromDate);
        return false;
    }
    return inputCheck;
}
function getSpecifiedRoutes(refRoute) {
    var inputKeys = getRouteInputs();
    var inputTimespan = getDateInputs();
    var validRoutes = rf["default"](refRoute, inputKeys, inputTimespan);
    displayRoutes(validRoutes);
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
    var startDatetime = dayjs($('#dateFrom').val().toString(), 'YYYY-MM-DD[T]HH:mm');
    var endDatetime = dayjs($('#dateTo').val().toString(), 'YYYY-MM-DD[T]HH:mm');
    return new rf.Period(startDatetime, endDatetime);
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
$('#routeForm').on('submit', function (event) {
    event.preventDefault();
    var routeList = rf.routeList;
    var refRoute = rf.refRoute;
    if (!formValidation(routeList, refRoute)) {
        return;
    }
    getSpecifiedRoutes(refRoute);
});
