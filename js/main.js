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
import * as rf from "./routeFinder.js";
(function () {
    rf.setup();
    var fromDate = dayjs();
    var jsFromDate = fromDate.toDate();
    $('#dateFrom').flatpickr({ enableTime: true, defaultDate: jsFromDate, dateFormat: "m-d-Y h:i K" });
    var addedDays = 7;
    var toDate = fromDate.add(addedDays, 'day');
    var jsToDate = toDate.toDate();
    $('#dateTo').flatpickr({ enableTime: true, defaultDate: jsToDate, dateFormat: "m-d-Y h:i K" });
})();
function formValidation(refRoute) {
    if ($('input[type="checkbox"]').filter(':checked').length === 0) {
        alert('No routes selected.');
        return;
    }
    var inputTimespan = getDateInputs();
    if (inputTimespan.end.diff(inputTimespan.start) < 0) {
        alert('Start time is larger than end time. Updating start date.');
        var fromInput = document.querySelector('#dateFrom')._flatpickr;
        var toInput = document.querySelector('#dateTo')._flatpickr;
        fromInput.setDate(toInput.selectedDates);
        return false;
    }
    if (inputTimespan.start.diff(refRoute.datetime) < 0 || inputTimespan.end.diff(refRoute.datetime) < 0) {
        alert('This date is not supported. Updating dates.');
        if (inputTimespan.start.diff(refRoute.datetime) < 0) {
            var fromInput = document.querySelector('#dateFrom')._flatpickr;
            fromInput.setDate(dayjs().toDate());
        }
        if (inputTimespan.end.diff(refRoute.datetime) < 0) {
            var toInput = document.querySelector('#dateTo')._flatpickr;
            toInput.setDate(dayjs().toDate());
        }
        return false;
    }
    return true;
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
    var fromInput = document.querySelector('#dateFrom')._flatpickr;
    var startDatetime = dayjs(fromInput.selectedDates);
    var toInput = document.querySelector('#dateTo')._flatpickr;
    var endDatetime = dayjs(toInput.selectedDates);
    return new rf.Period(startDatetime, endDatetime);
}
function displayRoutes(results) {
    return __awaiter(this, void 0, void 0, function () {
        var nameMap, nameResponse, parsedNames, error_1, $results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nameMap = new Map();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4, fetch('data/routeNames.json')];
                case 2:
                    nameResponse = _a.sent();
                    return [4, nameResponse.json()];
                case 3:
                    parsedNames = _a.sent();
                    mapDisplayNames(parsedNames, nameMap);
                    return [3, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error(error_1);
                    alert('Request failed');
                    return [2];
                case 5:
                    $results = $('#results tbody');
                    $results.text('');
                    results.forEach(function (route) {
                        var $routeCell = $('<td></td>').text(nameMap.get(route.key));
                        var $timeCell = $('<td></td>').text(route.displayTime);
                        var $row = $('<tr></tr>').append($routeCell).append($timeCell);
                        $results.append($row);
                    });
                    return [2];
            }
        });
    });
}
function mapDisplayNames(parsedNames, nameMap) {
    parsedNames.names.forEach(function (value) {
        nameMap.set(value.key, value.displayname);
    });
}
$('#routeForm').on('submit', function (event) {
    event.preventDefault();
    var refRoute = rf.refRoute;
    if (!formValidation(refRoute)) {
        return;
    }
    getSpecifiedRoutes(refRoute);
});
//# sourceMappingURL=main.js.map