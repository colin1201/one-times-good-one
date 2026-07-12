/**
 * Google Apps Script — Personality Quiz Webhook
 *
 * Handles two types of GET requests:
 * 1. Quiz results (name param) → saved to "Results" sheet
 * 2. Analytics events (analytics param) → saved to "Analytics" sheet
 *
 * Deploy as: Web app  |  Execute as: Me  |  Access: Anyone
 */

function doGet(e) {
  var p = e.parameter || {};
  var lock = LockService.getScriptLock();

  // Serialize concurrent writes — two beacons landing at the same instant
  // (several friends finishing together) could otherwise drop each other's rows.
  try {
    lock.waitLock(5000);
  } catch (err) {
    return ContentService.createTextOutput("busy");
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (p.analytics === '1') {
      var analyticsSheet = ss.getSheetByName('Analytics') || ss.insertSheet('Analytics');
      analyticsSheet.appendRow([p.timestamp, p.sessionId, p.name || '', p.event]);
    } else if (p.name) {
      var resultsSheet = ss.getSheetByName('Results') || ss.getActiveSheet();
      resultsSheet.appendRow([p.timestamp, p.name, p.mbtiType, p.enneagramType, p.discType, p.bigFive]);
    }
  } finally {
    lock.releaseLock();
  }

  return ContentService.createTextOutput("ok");
}

function setupHeaders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var results = ss.getSheetByName('Results') || ss.getActiveSheet();
  results.getRange(1, 1, 1, 6).setValues([["Timestamp", "Name", "MBTI", "Enneagram", "DISC", "Big Five"]]);
  results.getRange(1, 1, 1, 6).setFontWeight("bold");
  results.setFrozenRows(1);

  var analytics = ss.getSheetByName('Analytics') || ss.insertSheet('Analytics');
  analytics.getRange(1, 1, 1, 4).setValues([["Timestamp", "Session ID", "Name", "Event"]]);
  analytics.getRange(1, 1, 1, 4).setFontWeight("bold");
  analytics.setFrozenRows(1);
}
