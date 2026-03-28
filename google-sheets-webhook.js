/**
 * Google Apps Script — Personality Quiz Webhook
 *
 * Receives POST requests from the personality quiz app
 * and appends each submission as a new row in the active Google Sheet.
 *
 * Deploy as: Web app  |  Execute as: Me  |  Access: Anyone
 */

// ===== HANDLE POST REQUESTS =====
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Extract Big Five percentages (default to empty string if missing)
    var bigFive = data.bigFive || {};
    var O = bigFive.O != null ? bigFive.O : '';
    var C = bigFive.C != null ? bigFive.C : '';
    var E = bigFive.E != null ? bigFive.E : '';
    var A = bigFive.A != null ? bigFive.A : '';
    var N = bigFive.N != null ? bigFive.N : '';

    // Build the row
    var row = [
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.mbtiType || '',
      data.enneagramType || '',
      data.discType || '',
      O,
      C,
      E,
      A,
      N
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Row added' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== HANDLE GET REQUESTS (health check) =====
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Webhook is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== SET UP SHEET HEADERS (run once manually) =====
function setupHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = [
    'Timestamp',
    'Name',
    'MBTI Type',
    'Enneagram Type',
    'DISC Type',
    'Big Five: O',
    'Big Five: C',
    'Big Five: E',
    'Big Five: A',
    'Big Five: N'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}
