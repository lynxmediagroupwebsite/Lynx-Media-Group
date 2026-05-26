const SPREADSHEET_ID = "1j6vW_X6ETyKQXKYv8MfV1hk2JqjZeZoQjgwGBesJ2Fc";

const SHEETS = {
  business: {
    name: "Business Applications",
    headers: ["Submitted At", "Business Name", "Email", "Social Page", "Goal", "Page"]
  },
  creator: {
    name: "Creator Applications",
    headers: ["Submitted At", "Creator Name", "Email", "Social Page", "Creator Style", "Page"]
  }
};

function doGet() {
  return ContentService
    .createTextOutput("Lynx Media Group application endpoint is ready.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data = JSON.parse(event.postData.contents);
    const type = data.applicationType;
    if (!SHEETS[type]) throw new Error("Unknown application type.");

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetConfig = SHEETS[type];
    const sheet = getOrCreateSheet(spreadsheet, sheetConfig);

    if (type === "business") {
      sheet.appendRow([data.submittedAt || new Date().toISOString(), data.businessName || "", data.email || "", data.socialPage || "", data.goal || "", data.page || ""]);
    }

    if (type === "creator") {
      sheet.appendRow([data.submittedAt || new Date().toISOString(), data.creatorName || "", data.email || "", data.socialPage || "", data.creatorStyle || "", data.page || ""]);
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: error.message })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateSheet(spreadsheet, config) {
  let sheet = spreadsheet.getSheetByName(config.name);
  if (!sheet) sheet = spreadsheet.insertSheet(config.name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(config.headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, config.headers.length).setFontWeight("bold");
  }
  return sheet;
}
