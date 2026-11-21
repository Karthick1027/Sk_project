
// =====================================================
// SK BRIDAL STUDIO - WORKSHOP REGISTRATION SYSTEM
// Google Sheets + WhatsApp Payment Confirmation
// =====================================================

const CONFIG = {
  SPREADSHEET_ID: "1TdrQD7sq_uRgLkPoKwubH23QJY-reCejaNTVgvr3ows",
  SHEET_NAME: "Form Responses 1",
  SHEET_ID: 1885927180,
  FIRST_DATA_ROW: 2,
  SUGGESTED_PAYMENT_RUPEES: 500,
  CURRENCY: "INR",
  TIME_ZONE: "Asia/Kolkata",
  BACKEND_VERSION: "workshop-manual-v9-table-safe",

  // Registration columns
  COURSE_COL: 15,          // O
  NAME_COL: 2,             // B
  EMAIL_COL: 8,            // H
  PHONE_COL: 3,            // C
  CITY_COL: 9,             // I
  GENDER_COL: 4,           // D
  MAIN_GOAL_COL: 5,        // E
  QUESTION_COL: 6,         // F
  EXPERIENCE_COL: 7,       // G
  PAYMENT_SCREENSHOT_COL: 11, // K

  // Payment automation columns
  PAYMENT_ID_COL: 16,      // P
  ORDER_ID_COL: 17,        // Q
  ADVANCE_COL: 18,         // R
  PAYMENT_COL: 12,         // L
  CONFIRMATION_COL: 13,    // M
  WHATSAPP_LINK_COL: 14    // N
};

const ALLOWED_COURSES = [
  "Full 2-day masterclass", "Muhurtham Look (Day 1)", "Reception Look (Day 2)"
];

function validateRegistration_(data) {
  const fields = {};
  const registration = {};
  const limits = { name: 100, email: 150, gender: 50, goal: 500, question: 1000, experience: 150, city: 100, course: 150, paymentScreenshot: 1000 };
  data = data && typeof data === "object" && !Array.isArray(data) ? data : {};
  data = Object.assign({}, data, {
    name: data.name || data.fullName, email: data.email || data.emailAddress,
    phone: data.phone || data.whatsapp || data.whatsappNumber || data.contact,
    goal: data.goal || data.mainGoal || data.main_goal,
    question: data.question || data.comments || data.additionalComments,
    experience: data.experience || data.currentExperience || data.makeupExperience,
    city: data.city || data.location || data.cityLocation,
    course: data.course || data.selectedCourse,
    paymentScreenshot: data.paymentScreenshot || data.paymentProofUrl
  });
  Object.keys(limits).forEach(function(field) {
    registration[field] = String(data[field] == null ? "" : data[field]).trim();
    if (registration[field].length > limits[field]) fields[field] = "Please use " + limits[field] + " characters or fewer.";
  });
  registration.email = registration.email.toLowerCase();
  registration.phone = String(data.phone || "").replace(/\D/g, "");
  if (registration.phone.length === 10) registration.phone = "91" + registration.phone;
  else if (registration.phone.length === 11 && registration.phone.charAt(0) === "0") registration.phone = "91" + registration.phone.substring(1);
  ["name", "phone", "email", "gender", "experience", "goal", "course"].forEach(function(field) {
    if (!registration[field]) fields[field] = "This field is required.";
  });
  if (registration.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email)) fields.email = "Please enter a valid email address.";
  if (!/^91[6-9][0-9]{9}$/.test(registration.phone)) fields.phone = "Enter a valid Indian WhatsApp number.";
  if (ALLOWED_COURSES.indexOf(registration.course) === -1) fields.course = "Please select one of the available courses.";
  if (registration.gender && ["Female", "Male", "Prefer not to say"].indexOf(registration.gender) === -1) fields.gender = "Please select a valid gender.";
  if (Object.keys(fields).length) {
    const error = new Error("Please correct the highlighted registration fields.");
    error.code = "VALIDATION_ERROR";
    error.fields = fields;
    throw error;
  }
  return registration;
}

const HEADERS = [
  "Timestamp",
  "Full Name",
  "Contact/WhatsApp No.",
  "Gender",
  "What is your main goal for joining this course?",
  "Any additional comments or suggestions?",
  "What is your current makeup experience?",
  "Email Address",
  "City / Location",
  "Score",
  "Please share a screenshot of your payment confirmation to secure your seat.",
  "Payment Status",
  "Confirmation Sent",
  "WhatsApp Link",
  "Course",
  "Razorpay Payment ID",
  "Razorpay Order ID",
  "Advance Paid (INR)"
];


// =====================================================
// 1. GET GOOGLE SHEET
// =====================================================

function getExistingResponseSheet_() {
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) throw backendError_("SHEET_NOT_FOUND", 'The existing "Form Responses 1" tab was not found. No new tab was created.');
  if (sheet.getSheetId() !== CONFIG.SHEET_ID) throw backendError_("SHEET_DESTINATION_MISMATCH", "The registration tab does not match the configured Google Sheet destination. No registration was written.");
  return sheet;
}

function getResponseSheet_() {
  const sheet = getExistingResponseSheet_();
  const columns = sheet.getMaxColumns();
  if (columns < 18) sheet.insertColumnsAfter(columns, 18 - columns);
  // Google Forms owns A-K. Never rename, clear or rewrite those headers.
  const headers = sheet.getRange(1, 12, 1, 7).getValues()[0];
  headers.forEach(function(value, index) {
    if (value === "" || value == null) sheet.getRange(1, 12 + index).setValue(HEADERS[11 + index]);
  });
  return sheet;
}

function backendError_(code, message, fields) {
  const error = new Error(message);
  error.code = code;
  if (fields) error.fields = fields;
  return error;
}

// Owner-only exception diagnostics. Never pass the request, row values or
// stack to the logger. Redact before truncating so a partial secret cannot leak.
function safeWorkshopException_(error, registration) {
  let message = String(error && error.message || error || "Unknown exception");
  const sensitive = Object.keys(registration || {}).map(function(key) { return registration[key]; });
  try {
    const properties = PropertiesService.getScriptProperties();
    const keyId = properties.getProperty("RAZORPAY_KEY_ID") || "";
    const secret = properties.getProperty("RAZORPAY_KEY_SECRET") || "";
    sensitive.push(keyId, secret);
    if (keyId && secret) sensitive.push(Utilities.base64Encode(keyId + ":" + secret));
  } catch (_) { /* Diagnostics must not replace the original exception. */ }
  sensitive.filter(function(value) { return typeof value === "string" && value.trim(); })
    .sort(function(a, b) { return b.length - a.length; })
    .forEach(function(value) {
      const escaped = value.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      message = message.replace(new RegExp(escaped, "gi"), "[redacted]");
    });
  message = message
    .replace(/https?:\/\/[^\s<>]+/gi, "[redacted-url]")
    .replace(/\b(?:Basic|Bearer)\s+\S+/gi, "[redacted-authorization]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[redacted-email]")
    .replace(/\b[a-f0-9]{64}\b/gi, "[redacted-signature]")
    .replace(/\b(?:\d[\s()+-]*){10,}\b/g, "[redacted-phone]")
    .replace(/"[^"\r\n]*"|'[^'\r\n]*'/g, "[redacted-value]");
  const name = String(error && error.name || "Error");
  return { exceptionClass: /^[A-Za-z][A-Za-z0-9_.]{0,79}$/.test(name) ? name : "Error", exceptionMessage: message.slice(0, 1000) };
}

function doPost(event) {
  const requestReference = Utilities.getUuid().substring(0, 8);
  let action = "unknown";
  console.log(JSON.stringify({ event: "workshop_post_received", reference: requestReference, version: CONFIG.BACKEND_VERSION }));
  try {
    if (!event || !event.postData || !event.postData.contents) throw backendError_("INVALID_REQUEST", "Request data is missing.");
    let request;
    try { request = JSON.parse(event.postData.contents); }
    catch (_) { throw backendError_("INVALID_REQUEST", "Request data must be valid JSON."); }
    if (!request || typeof request !== "object" || Array.isArray(request)) throw backendError_("INVALID_REQUEST", "Request data is invalid.");
    if (request.action === "create_order" || request.action === "verify_payment") action = request.action;
    console.log(JSON.stringify({ event: "workshop_request_started", action: action, reference: requestReference, version: CONFIG.BACKEND_VERSION }));
    let result;
    if (action === "create_order") result = createWorkshopOrder_(request.registration, request.amount);
    else if (action === "verify_payment") throw backendError_("MANUAL_VERIFICATION_REQUIRED", "Payments are checked manually by SK Bridal Studio. No automatic payment verification is available.");
    // No public append/mark-verified action or legacy token callback is allowed.
    else throw backendError_("UNKNOWN_ACTION", "Unknown registration action.");
    console.log(JSON.stringify({ event: "workshop_request_completed", action: action, reference: requestReference, verified: result.verified === true, saved: result.saved === true, registrationSaved: result.registrationSaved === true, pendingSaved: result.pendingSaved === true, row: result.row || undefined, duplicate: result.duplicate === true }));
    return jsonResponse(result);
  } catch (error) {
    const reference = error.reference || requestReference;
    const code = error.code || "REQUEST_FAILED";
    // doPost catches errors, so Apps Script can label rejected requests
    // Completed. Explicitly log the action and rejection without the payload.
    const stage = error.saveStage || (action === "create_order" ? "creating_order" : action === "verify_payment" ? "manual_review_required" : "parse_request");
    console.error(JSON.stringify({ event: "workshop_request_failed", action: action, reference: reference, code: code, stage: stage, saveStage: error.saveStage || undefined, saveCause: error.saveCause || undefined, version: CONFIG.BACKEND_VERSION }));
    // Raw platform exceptions can contain cell contents or personal data.
    const message = error.code ? String(error.message) : "The registration server could not complete this request. Contact SK Bridal Studio with the reference below.";
    return jsonResponse({ ok: false, error: message, code: code, stage: stage, fields: error.fields || undefined, reference: reference, saveStage: error.saveStage || undefined, saveCause: error.saveCause || undefined, verified: false, saved: false, registrationSaved: error.registrationSaved === true, row: error.row || undefined });
  }
}

function razorpayCredentials_() {
  const properties = PropertiesService.getScriptProperties();
  const keyId = properties.getProperty("RAZORPAY_KEY_ID");
  const secret = properties.getProperty("RAZORPAY_KEY_SECRET");
  if (!keyId || !secret) throw backendError_("CONFIG_ERROR", "Razorpay credentials are not configured in Apps Script Script Properties.");
  return { keyId: keyId, secret: secret };
}

function razorpayRequest_(path, method, payload) {
  const credentials = razorpayCredentials_();
  let response;
  let result;
  try {
    const options = {
      method: method || "get", contentType: "application/json", muteHttpExceptions: true,
      headers: { Authorization: "Basic " + Utilities.base64Encode(credentials.keyId + ":" + credentials.secret) }
    };
    if (payload !== undefined) options.payload = JSON.stringify(payload);
    response = UrlFetchApp.fetch("https://api.razorpay.com/v1" + path, options);
    result = JSON.parse(response.getContentText());
  } catch (_) {
    throw backendError_("RAZORPAY_API_ERROR", "The payment service is unavailable. Please retry; do not pay again if you were charged.");
  }
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300 || !result || typeof result !== "object") {
    console.error("Razorpay request failed", response.getResponseCode());
    throw backendError_("RAZORPAY_API_ERROR", "The payment service could not confirm this request. Please retry.");
  }
  return result;
}

function createWorkshopOrder_(data, requestedAmount) {
  const registration = validateRegistration_(data);
  const amountPaise = paymentAmountPaise_(requestedAmount);
  const credentials = razorpayCredentials_();
  // A unique internal reference locates this Pending row even if rows move.
  const reference = "registration_" + Utilities.getUuid().replace(/-/g, "");
  let row;
  let stage = "save_pending_registration";
  try {
    // Save first: a Razorpay outage must not discard the registration details.
    row = savePendingRegistration_(registration, reference, amountPaise);
    stage = "create_razorpay_order";
    const order = razorpayRequest_("/orders", "post", {
      amount: amountPaise, currency: CONFIG.CURRENCY, payment: { capture: "manual" },
      receipt: "ws_" + Date.now() + "_" + Utilities.getUuid().substring(0, 8),
      notes: { type: "workshop_advance", backend: CONFIG.BACKEND_VERSION, course: registration.course, registration_reference: reference }
    });
    if (!/^order_[A-Za-z0-9]+$/.test(order.id || "") || order.amount !== amountPaise || order.currency !== CONFIG.CURRENCY) throw backendError_("ORDER_FAILED", "The payment service returned an invalid order.");
    console.log(JSON.stringify({ event: "workshop_order_created", version: CONFIG.BACKEND_VERSION, orderId: order.id, amount: order.amount, currency: order.currency }));
    stage = "link_razorpay_order";
    row = linkPendingOrder_(registration, reference, order.id, amountPaise);
    return { ok: true, registrationSaved: true, saved: true, pendingSaved: true,
      verificationMode: "manual", paymentVerification: "MANUAL", row: row,
      spreadsheetId: CONFIG.SPREADSHEET_ID, sheetId: CONFIG.SHEET_ID,
      keyId: credentials.keyId, orderId: order.id, amount: order.amount, currency: order.currency };
  } catch (error) {
    const requestReference = Utilities.getUuid().substring(0, 8);
    const saveStage = error.saveStage || stage;
    console.error(JSON.stringify(Object.assign({ event: "workshop_pending_save_failed", reference: requestReference,
      stage: saveStage, cause: error.code || "SHEET_WRITE_ERROR", registrationSaved: Boolean(row), row: row || undefined,
      spreadsheetId: CONFIG.SPREADSHEET_ID, sheetId: CONFIG.SHEET_ID, sheetName: CONFIG.SHEET_NAME }, safeWorkshopException_(error, registration))));
    const failure = backendError_(row ? "ORDER_AFTER_REGISTRATION_SAVE_FAILED" : "PENDING_REGISTRATION_SAVE_FAILED",
      row ? "Your registration details are saved as Pending, but payment could not be opened. Contact SK Bridal Studio before retrying; do not pay again if charged." : "Your registration could not be confirmed in the required Google Sheet. Checkout was not opened. Please contact SK Bridal Studio.");
    failure.reference = requestReference;
    failure.saveStage = saveStage;
    failure.saveCause = error.code || "SHEET_WRITE_ERROR";
    failure.registrationSaved = Boolean(row);
    failure.row = row;
    throw failure;
  }
}

function linkPendingOrder_(registration, reference, orderId, amountPaise) {
  const lock = LockService.getScriptLock();
  let locked = false;
  let stage = "acquire_order_link_lock";
  try {
    lock.waitLock(20000); locked = true;
    stage = "locate_pending_reference";
    const sheet = getExistingResponseSheet_();
    const rows = findRegistrationRows_(sheet, reference, "").orderRows;
    if (rows.length !== 1 || findRegistrationRows_(sheet, orderId, "").orderRows.length) throw backendError_("SHEET_ROW_CONFLICT", "The saved registration reference is missing or duplicated.");
    confirmPendingRow_(sheet, rows[0], registration, reference, amountPaise);
    stage = "write_order_reference";
    setTextCell_(sheet, rows[0], CONFIG.ORDER_ID_COL, orderId);
    SpreadsheetApp.flush();
    stage = "read_back_linked_registration";
    const linked = findRegistrationRows_(sheet, orderId, "").orderRows;
    if (linked.length !== 1) throw backendError_("SHEET_WRITE_ERROR", "The saved Razorpay order reference could not be located.");
    confirmPendingRow_(sheet, linked[0], registration, orderId, amountPaise);
    return linked[0];
  } catch (error) { error.saveStage = stage; throw error; }
  finally { if (locked) lock.releaseLock(); }
}

function confirmPendingRow_(sheet, row, registration, reference, amountPaise) {
  const values = sheet.getRange(row, 1, 1, 18).getValues()[0];
  const expected = [null, cleanValue(registration.name, 100), registration.phone, cleanValue(registration.gender, 50),
    cleanValue(registration.goal, 500), cleanValue(registration.question, 1000), cleanValue(registration.experience, 150),
    cleanValue(registration.email, 150), cleanValue(registration.city, 100), "", cleanValue(registration.paymentScreenshot || "", 1000),
    "Pending", "No", "", registration.course, "", reference, amountPaise / 100];
  const checks = values.map(function(value, index) {
    if (index === 0) return value instanceof Date && Number.isFinite(value.getTime());
    if (index === 17) return typeof value === "number" && value === expected[index];
    const text = String(value == null ? "" : value);
    const target = String(expected[index]);
    // Google Sheets may remove the leading apostrophe used for literal text.
    return text === target || (target.charAt(0) === "'" && text === target.substring(1));
  });
  const valid = checks.length === 18 && checks.every(function(value) { return value; });
  console.log(JSON.stringify({ event: "workshop_pending_read_back", row: row, valid: valid,
    matchedColumns: checks, spreadsheetId: CONFIG.SPREADSHEET_ID, sheetId: CONFIG.SHEET_ID }));
  if (!valid) throw backendError_("SHEET_WRITE_ERROR", "The complete registration could not be read back from the required sheet.");
}

function paymentAmountPaise_(value) {
  const text = String(value === undefined || value === null ? "" : value).trim();
  const rupees = Number(text);
  const amount = rupees * 100;
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(rupees) || rupees < 1 || !Number.isSafeInteger(amount)) throw backendError_("VALIDATION_ERROR", "Enter a whole-rupee amount of at least INR 1.", { amount: "Enter a whole-rupee amount of at least INR 1." });
  return amount;
}

function findRegistrationRows_(sheet, orderId, paymentId) {
  const lastRow = sheet.getLastRow();
  const result = { orderRows: [], paymentRows: [] };
  if (lastRow < CONFIG.FIRST_DATA_ROW) return result;
  const ids = sheet.getRange(CONFIG.FIRST_DATA_ROW, CONFIG.PAYMENT_ID_COL, lastRow - CONFIG.FIRST_DATA_ROW + 1, 2).getValues();
  ids.forEach(function(row, index) {
    if (orderId && String(row[1] || "") === orderId) result.orderRows.push(CONFIG.FIRST_DATA_ROW + index);
    if (paymentId && String(row[0] || "") === paymentId) result.paymentRows.push(CONFIG.FIRST_DATA_ROW + index);
  });
  return result;
}

function setTextCell_(sheet, row, column, value) {
  const cell = sheet.getRange(row, column);
  // Form response tables may manage their own column types and reject
  // setNumberFormat after the row was already saved. IDs are nonnumeric,
  // and normalized Indian phone numbers have only 12 digits (safe integers).
  // Validate raw stored values below instead of requiring a formatting write.
  cell.setValue(String(value || ""));
}

function appendPendingRow_(sheet, registration, orderId, amount, enterStage) {
  enterStage = enterStage || function() {};
  const timestamp = new Date();
  sheet.appendRow([
    timestamp, cleanValue(registration.name, 100), registration.phone, cleanValue(registration.gender, 50),
    cleanValue(registration.goal, 500), cleanValue(registration.question, 1000), cleanValue(registration.experience, 150),
    cleanValue(registration.email, 150), cleanValue(registration.city, 100), "", cleanValue(registration.paymentScreenshot || "", 1000),
    "Pending", "No", "", registration.course, "", orderId, amount / 100
  ]);
  // A returned append is separate from flush and successful lookup/read-back.
  console.log(JSON.stringify({ event: "workshop_pending_append_returned", orderId: orderId }));
  enterStage("flush_pending_row");
  SpreadsheetApp.flush();
  console.log(JSON.stringify({ event: "workshop_pending_flush_completed", orderId: orderId }));
  enterStage("locate_pending_row");
  const matches = findRegistrationRows_(sheet, orderId, "");
  console.log(JSON.stringify({ event: "workshop_pending_lookup_completed", orderId: orderId, matchCount: matches.orderRows.length }));
  if (matches.orderRows.length !== 1) throw backendError_("SHEET_WRITE_ERROR", "The pending registration row could not be confirmed.");
  const row = matches.orderRows[0];
  console.log(JSON.stringify({ event: "workshop_pending_row_located", row: row, orderId: orderId }));
  // The complete row was already written and flushed. Do not rewrite A-K
  // or require cosmetic changes before confirming the saved registration.
  return row;
}

function savePendingRegistration_(registration, orderId, amount) {
  const lock = LockService.getScriptLock();
  let locked = false;
  let stage = "acquire_lock";
  function enterStage(value) {
    stage = value;
    console.log(JSON.stringify({ event: "workshop_pending_save_stage", stage: stage, version: CONFIG.BACKEND_VERSION, spreadsheetId: CONFIG.SPREADSHEET_ID, sheetName: CONFIG.SHEET_NAME, orderId: orderId }));
  }
  try {
    enterStage(stage);
    lock.waitLock(20000);
    locked = true;
    enterStage("prepare_sheet");
    const sheet = getResponseSheet_();
    console.log(JSON.stringify({ event: "workshop_pending_destination_opened", spreadsheetId: CONFIG.SPREADSHEET_ID, sheetName: sheet.getName(), sheetId: sheet.getSheetId(), columnCount: sheet.getMaxColumns() }));
    enterStage("check_duplicate");
    const matches = findRegistrationRows_(sheet, orderId, "");
    if (matches.orderRows.length) throw backendError_("ORDER_ALREADY_EXISTS", "This payment order already has a registration row.");
    enterStage("append_pending_row");
    const row = appendPendingRow_(sheet, registration, orderId, amount, enterStage);
    enterStage("read_back_pending_row");
    confirmPendingRow_(sheet, row, registration, orderId, amount);
    console.log(JSON.stringify({ event: "workshop_pending_row_confirmed", row: row, pendingSaved: true, orderId: orderId }));
    return row;
  } catch (error) {
    error.saveStage = stage;
    throw error;
  } finally {
    if (locked) lock.releaseLock();
  }
}

// Run manually in the Apps Script editor. Read-only: no test registrations,
// payments, new tabs or changes to existing response rows are created.
function locateWorkshopRegistration(orderReference) {
  orderReference = String(orderReference || PropertiesService.getScriptProperties().getProperty("WORKSHOP_LOOKUP_ORDER_ID") || "").trim();
  if (!/^(?:order|registration)_[A-Za-z0-9]+$/.test(orderReference)) throw backendError_("INVALID_REFERENCE", "Pass the order ID from the Network response, or set WORKSHOP_LOOKUP_ORDER_ID in Script Properties.");
  const sheet = getExistingResponseSheet_();
  const matches = findRegistrationRows_(sheet, orderReference, "").orderRows;
  const report = { version: CONFIG.BACKEND_VERSION, spreadsheetId: CONFIG.SPREADSHEET_ID,
    sheetId: sheet.getSheetId(), sheetName: sheet.getName(), matches: matches.length,
    rows: matches.map(function(row) {
      const values = sheet.getRange(row, 1, 1, 18).getValues()[0];
      return { row: row, hasName: Boolean(values[1]), hasPhone: Boolean(values[2]), hasEmail: Boolean(values[7]),
        hasGoal: Boolean(values[4]), hasExperience: Boolean(values[6]), hasCourse: Boolean(values[14]),
        status: /^(pending|verified)$/i.test(String(values[11])) ? String(values[11]) : "other",
        sheetUrl: "https://docs.google.com/spreadsheets/d/" + CONFIG.SPREADSHEET_ID + "/edit#gid=" + CONFIG.SHEET_ID + "&range=A" + row + ":R" + row };
    }) };
  console.log(JSON.stringify(report));
  return report;
}

function diagnoseWorkshopSaving() {
  const sheet = getExistingResponseSheet_();
  const report = {
    version: CONFIG.BACKEND_VERSION,
    spreadsheetId: CONFIG.SPREADSHEET_ID,
    sheetName: sheet.getName(),
    sheetId: sheet.getSheetId(),
    timeZone: SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSpreadsheetTimeZone(),
    lastUsedRow: sheet.getLastRow(),
    columnCount: sheet.getMaxColumns(),
    hasFilter: Boolean(sheet.getFilter())
  };
  console.log(JSON.stringify(report));
  return report;
}

function doGet() {
  const properties = PropertiesService.getScriptProperties();
  let sheetAccessible = false;
  try { sheetAccessible = Boolean(getExistingResponseSheet_()); } catch (_) { /* Expose readiness, never student rows or credentials. */ }
  const credentialsConfigured = Boolean(properties.getProperty("RAZORPAY_KEY_ID") && properties.getProperty("RAZORPAY_KEY_SECRET"));
  return jsonResponse({ ok: sheetAccessible && credentialsConfigured, backend: "google-apps-script", version: CONFIG.BACKEND_VERSION, verificationMode: "manual", spreadsheetId: CONFIG.SPREADSHEET_ID, sheetId: CONFIG.SHEET_ID, sheet: CONFIG.SHEET_NAME, sheetAccessible: sheetAccessible, credentialsConfigured: credentialsConfigured, suggestedAmountRupees: CONFIG.SUGGESTED_PAYMENT_RUPEES, minimumAmountRupees: 1, currency: CONFIG.CURRENCY });
}

function setupWorkshopRegistration() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).setSpreadsheetTimeZone(CONFIG.TIME_ZONE);
    getResponseSheet_();
    SpreadsheetApp.flush();
  }
  finally { lock.releaseLock(); }
  const status = JSON.parse(doGet().getContent());
  console.log(JSON.stringify(status));
  return status;
}

function cleanValue(value, maxLength) {
  const text = String(value || "")
    .trim()
    .slice(0, maxLength);

  // Prevent Google Sheets formula injection.
  return /^[=+\-@]/.test(text)
    ? "'" + text
    : text;
}


// =====================================================
// 5. JSON RESPONSE
// =====================================================

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


// =====================================================
// 6. AUTOMATIC PAYMENT STATUS EDIT HANDLER
// =====================================================

function handlePaymentStatusEdit(e) {

  if (!e || !e.range) return;

  const sheet = e.range.getSheet();

  if (sheet.getName() !== CONFIG.SHEET_NAME) return;

  // Only respond to edits in Payment Status column.
  if (e.range.getColumn() !== CONFIG.PAYMENT_COL) return;

  // Ignore multi-cell edits.
  if (
    e.range.getNumRows() !== 1 ||
    e.range.getNumColumns() !== 1
  ) return;

  const row = e.range.getRow();

  if (row < CONFIG.FIRST_DATA_ROW) return;

  createWhatsAppLink_(sheet, row);
}


// =====================================================
// 7. CREATE WHATSAPP CONFIRMATION LINK
// =====================================================

function createWhatsAppLink_(sheet, row) {

  const status = String(
    sheet.getRange(row, CONFIG.PAYMENT_COL).getDisplayValue()
  ).trim().toLowerCase();

  const linkCell = sheet.getRange(
    row,
    CONFIG.WHATSAPP_LINK_COL
  );

  // Only generate a link when payment is verified.
  if (status !== "verified") {
    linkCell.clearContent();
    if (status === "pending") sheet.getRange(row, CONFIG.CONFIRMATION_COL).setValue("No");
    return;
  }

  const name = String(
    sheet.getRange(row, CONFIG.NAME_COL).getDisplayValue()
  ).trim();

  let phone = String(
    sheet.getRange(row, CONFIG.PHONE_COL).getValue()
  ).replace(/\D/g, "");

  // Convert Indian mobile numbers to international format.
  if (phone.length === 10) {
    phone = "91" + phone;

  } else if (phone.length === 11 && phone.startsWith("0")) {
    phone = "91" + phone.substring(1);
  }

  if (!name || phone.length < 8 || phone.length > 15) {
    linkCell.setValue("Check student name / phone");
    return;
  }

  const advance = Number(sheet.getRange(row, CONFIG.ADVANCE_COL).getValue());
  const url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(buildConfirmationMessage_(name, advance));
  linkCell.setValue(url);

  const confirmationCell = sheet.getRange(row, CONFIG.CONFIRMATION_COL);
  const currentStatus = String(confirmationCell.getValue() || "").trim();
  if (!/^(yes|sent|confirmation sent)$/i.test(currentStatus)) confirmationCell.setValue("Ready to Send");
}


// =====================================================
// 8. WHATSAPP CONFIRMATION MESSAGE
// =====================================================

function buildConfirmationMessage_(name, advance) {

  return [
    "Hi " + name + "! 💖",
    "",
    "Congratulations! 🎉",
    "",
    "Your advance payment" + (Number.isFinite(advance) && advance >= 1 ? " of INR " + advance.toFixed(2) : "") + " has been successfully verified.",
    "",
    "Your seat for the Professional Bridal Makeup & Hairstyle Course at SK BRIDAL STUDIO is officially CONFIRMED! 💄✨",
    "",
    "Thank you for choosing us! ❤️",
    "",
    "SK BRIDAL STUDIO"
  ].join("\n");
}


// =====================================================
// 9. REBUILD ALL VERIFIED STUDENT LINKS
// =====================================================

function rebuildVerifiedLinks() {

  const sheet = getResponseSheet_();

  const lastRow = sheet.getLastRow();

  if (lastRow < CONFIG.FIRST_DATA_ROW) {
    Logger.log("No student records found.");
    return;
  }

  const statuses = sheet.getRange(
    CONFIG.FIRST_DATA_ROW,
    CONFIG.PAYMENT_COL,
    lastRow - CONFIG.FIRST_DATA_ROW + 1,
    1
  ).getDisplayValues();

  let count = 0;

  for (let i = 0; i < statuses.length; i++) {

    if (
      String(statuses[i][0]).trim().toLowerCase() === "verified"
    ) {

      const row = CONFIG.FIRST_DATA_ROW + i;

      createWhatsAppLink_(sheet, row);

      count++;
    }
  }

  SpreadsheetApp.flush();

  Logger.log(
    "Successfully rebuilt " + count + " WhatsApp links."
  );
}


// =====================================================
// 10. INSTALL AUTOMATIC EDIT TRIGGER
// RUN THIS FUNCTION ONCE
// =====================================================

function setupEditTrigger() {

  const ss = SpreadsheetApp.openById(
    CONFIG.SPREADSHEET_ID
  );

  const triggers = ScriptApp.getProjectTriggers();

  // Remove duplicate triggers.
  triggers.forEach(function(trigger) {

    if (
      trigger.getHandlerFunction() ===
      "handlePaymentStatusEdit"
    ) {
      ScriptApp.deleteTrigger(trigger);
    }

  });

  // Create a new edit trigger.
  ScriptApp.newTrigger("handlePaymentStatusEdit")
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  Logger.log("Automatic payment trigger installed successfully.");
}


// =====================================================
// 11. REGENERATE LINK FOR SELECTED STUDENT
// =====================================================

function regenerateSelectedStudentLink() {

  const sheet = getResponseSheet_();

  const activeRange = sheet.getActiveRange();

  if (!activeRange) {
    throw new Error("Please select a student row.");
  }

  const row = activeRange.getRow();

  if (row < CONFIG.FIRST_DATA_ROW) {
    throw new Error("Select a student data row first.");
  }

  createWhatsAppLink_(sheet, row);

  SpreadsheetApp.flush();

  Logger.log(
    "WhatsApp link regenerated for row " + row
  );
}


// =====================================================
// 12. TEST WHATSAPP EMOJI ENCODING
// =====================================================

function testWhatsAppEmojiLink() {

  const emoji = "💖 🎉 💄 ✨ ❤️";

  const encoded = encodeURIComponent(emoji);

  Logger.log("Original: " + emoji);
  Logger.log("Encoded: " + encoded);

  Logger.log(
    "Replacement character exists: " +
    emoji.includes("\uFFFD")
  );

  const testUrl =
    "https://web.whatsapp.com/send?phone=918668038093&text=" +
    encoded;

  Logger.log("Test URL: " + testUrl);
}
