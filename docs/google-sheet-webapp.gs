/**
 * Google Apps Script — append feedback rows to a Google Sheet.
 *
 * SETUP (once):
 * 1. Create a Google Sheet. Row 1 headers (optional — script can add them):
 *    timestamp | submitter_name | submitter_email | feedback_for | feedback_for_id |
 *    relationship | operating_level | skill_ratings | intuit_values |
 *    narrative_best_work | narrative_advice | narrative_other | submission_json
 * 2. Extensions → Apps Script → paste this file → Save.
 * 3. Project Settings (gear) → Script properties → Add:
 *    SHEET_ID = <id from sheet URL between /d/ and /edit>
 *    Optional: FORM_SECRET = <random string> — then set the same in docs/app.js
 * 4. Deploy → New deployment → Select type: Web app
 *    Execute as: Me
 *    Who has access: Anyone (needed for public GitHub Pages form)
 * 5. Copy the Web app URL (ends in /exec). Paste into docs/app.js as GOOGLE_SCRIPT_WEBAPP_URL.
 * 6. Run doPost once from editor? Not needed. First real submit creates rows.
 */

function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var sheetId = props.getProperty("SHEET_ID");
    if (!sheetId) {
      throw new Error("Set SHEET_ID in Project Settings → Script properties");
    }

    var secret = props.getProperty("FORM_SECRET");
    var p = e.parameter;
    if (secret && String(p.form_secret || "") !== String(secret)) {
      throw new Error("Invalid form secret");
    }

    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheetByName("Responses");
    if (!sheet) {
      sheet = ss.insertSheet("Responses");
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "timestamp",
        "submitter_name",
        "submitter_email",
        "feedback_for",
        "feedback_for_id",
        "relationship",
        "operating_level",
        "skill_ratings",
        "intuit_values",
        "narrative_best_work",
        "narrative_advice",
        "narrative_other",
        "submission_json",
      ]);
    }

    sheet.appendRow([
      new Date(),
      p.submitter_name || "",
      p.submitter_email || "",
      p.feedback_for || "",
      p.feedback_for_id || "",
      p.relationship || "",
      p.operating_level || "",
      p.skill_ratings || "",
      p.intuit_values || "",
      p.narrative_best_work || "",
      p.narrative_advice || "",
      p.narrative_other || "",
      p.submission_json || "",
    ]);

    return ackHtml(true);
  } catch (err) {
    return ackHtml(false);
  }
}

/** Notify the GitHub Pages parent window (use top — GAS may nest iframes). */
function ackHtml(ok) {
  var script =
    "(function(){try{window.top.postMessage({type:\"team-forward-feedback\",ok:" +
    (ok ? "true" : "false") +
    '},\"*\");}catch(e){}})();';
  return HtmlService.createHtmlOutput(
    "<html><body><script>" + script + "</script>" + (ok ? "OK" : "Error") + "</body></html>",
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
