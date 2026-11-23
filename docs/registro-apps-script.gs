/**
 * Pomodoro Arcade → Google Sheets
 * Pega este código en Extensiones > Apps Script de tu hoja y publícalo
 * como "Aplicación web" (pasos en docs/registro-google-sheets.md).
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registro')
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Registro');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Fecha', 'Tipo', 'Detalle', 'Tickets']);
    sheet.setFrozenRows(1);
  }
  var data = JSON.parse(e.postData.contents || '{}');
  var rows = (data.rows || []).map(function (r) {
    return [new Date(r.fecha), r.tipo || '', r.detalle || '', r.tickets != null ? r.tickets : ''];
  });
  if (rows.length) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
  return ContentService.createTextOutput('ok');
}
