/**
 * Google Apps Script for anonymous leadership survey.
 *
 * SETUP:
 * 1. Create a new Google Sheet.
 * 2. Extensions → Apps Script → paste this file → Save.
 * 3. Project Settings (gear) → Script properties → Add:
 *      SHEET_ID = <id from sheet URL between /d/ and /edit>
 *      Optional: DASHBOARD_SECRET = <random string> (protects doGet dashboard data)
 * 4. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone → Deploy.
 * 5. Copy the /exec URL into leadership-survey/app.js (WEBAPP_URL)
 *    and leadership-dashboard/app.js (WEBAPP_URL).
 */

var HEADERS = [
  "timestamp",
  "prioritization",
  "recognition",
  "performance_mgmt",
  "removing_blockers",
  "career_growth",
  "communication",
  "decision_making",
  "strategic_vision",
  "availability",
  "free_text"
];

function getSheet() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty("SHEET_ID");
  if (!sheetId) throw new Error("Set SHEET_ID in Script properties");
  var ss = SpreadsheetApp.openById(sheetId);
  var sheet = ss.getSheetByName("Responses");
  if (!sheet) {
    sheet = ss.insertSheet("Responses");
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

/** Form submissions (POST) */
function doPost(e) {
  try {
    var sheet = getSheet();
    var p = e.parameter;
    sheet.appendRow([
      new Date(),
      p.prioritization || "",
      p.recognition || "",
      p.performance_mgmt || "",
      p.removing_blockers || "",
      p.career_growth || "",
      p.communication || "",
      p.decision_making || "",
      p.strategic_vision || "",
      p.availability || "",
      p.free_text || ""
    ]);
    return ackHtml(true);
  } catch (err) {
    return ackHtml(false);
  }
}

/** Dashboard data (GET) — returns JSON of all responses */
function doGet(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty("DASHBOARD_SECRET");
    if (secret && String((e && e.parameter && e.parameter.secret) || "") !== String(secret)) {
      return ContentService.createTextOutput(JSON.stringify({ error: "unauthorized" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = getSheet();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ rows: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var headers = data[0];
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = data[i][j];
      }
      rows.push(obj);
    }

    return ContentService.createTextOutput(JSON.stringify({ rows: rows }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: String(err.message || err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function ackHtml(ok) {
  var script =
    '(function(){try{window.top.postMessage({type:"leadership-survey",ok:' +
    (ok ? "true" : "false") +
    '},"*");}catch(e){}})();';
  return HtmlService.createHtmlOutput(
    "<html><body><script>" + script + "</script>" + (ok ? "OK" : "Error") + "</body></html>"
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
