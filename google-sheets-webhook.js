/**
 * Google Apps Script — Personality Quiz Webhook
 *
 * Receives POST requests from the personality quiz app
 * and appends each submission as a new row in the active Google Sheet.
 *
 * Deploy as: Web app  |  Execute as: Me  |  Access: Anyone
 */

// ===== HANDLE GET REQUESTS (saves data + health check) =====
function doGet(e) {
  var p = e.parameter || {};
  if (p.name) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([p.timestamp || new Date().toISOString(), p.name, p.mbtiType, p.enneagramType, p.discType, p.bigFive]);
  }
  return ContentService.createTextOutput("ok");
}

// ===== SET UP SHEET HEADERS (run once manually) =====
function setupHeaders() {
  var s = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  s.getRange(1, 1, 1, 6).setValues([["Timestamp", "Name", "MBTI", "Enneagram", "DISC", "Big Five"]]);
  s.getRange(1, 1, 1, 6).setFontWeight("bold");
  s.setFrozenRows(1);
}
