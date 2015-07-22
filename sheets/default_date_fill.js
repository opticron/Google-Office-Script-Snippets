function onOpen() {
  var menu = [{name: 'Set Default Dates', functionName: 'setDefaultDates'}];
  SpreadsheetApp.getActive().addMenu('Auto-Fill', menu);
}

function setDefaultDates() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('Raw Spending');
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    var entry = values[i];
    var timestamp = entry[0];
    var date_spent = entry[1];
    if (date_spent == "" && timestamp != "") {
      sheet.getRange(i+1, 2).setValue(timestamp);
    }
  }
}
