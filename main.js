var datetimeLocale = require('datetime-locale');
var refTime = new Date("2020-09-03T16:00:00Z");
window.onload = function () {
    var fromDate = new Date();
    var displayFromDate = datetimeLocale.toString(fromDate);
    displayFromDate = displayFromDate.slice(0, displayFromDate.lastIndexOf(":"));
    $('#dateFrom').val(displayFromDate);
    var toDate = fromDate;
    var addedDays = 7;
    toDate.setDate(toDate.getDate() + addedDays);
    var displayToDate = datetimeLocale.toString(toDate);
    displayToDate = displayToDate.slice(0, displayToDate.lastIndexOf(":"));
    $('#dateTo').val(displayToDate);
};
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
}
$('#routeForm').submit(function (event) {
    event.preventDefault();
    if (!formValidation()) {
        return;
    }
});
//# sourceMappingURL=main.js.map