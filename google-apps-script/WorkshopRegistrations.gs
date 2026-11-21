
// =====================================================
// SK BRIDAL STUDIO - WORKSHOP REGISTRATION SYSTEM
// Google Sheets + WhatsApp Payment Confirmation
// =====================================================

const CONFIG = {
  SPREADSHEET_ID: "1TdrQD7sq_uRgLkPoKwubH23QJY-reCejaNTVgvr3ows",
  SHEET_NAME: "Form Responses 1",
  FIRST_DATA_ROW: 2,
  SUGGESTED_PAYMENT_RUPEES: 500,
  CURRENCY: "INR",
  TIME_ZONE: "Asia/Kolkata",
  BACKEND_VERSION: "workshop-spark-v6-registration-saved",

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
    else if (action === "verify_payment") result = verifyWorkshopPayment_(request);
    // No public append/mark-verified action or legacy token callback is allowed.
    else throw backendError_("UNKNOWN_ACTION", "Unknown registration action.");
    console.log(JSON.stringify({ event: "workshop_request_completed", action: action, reference: requestReference, verified: result.verified === true, saved: result.saved === true, registrationSaved: result.registrationSaved === true, pendingSaved: result.pendingSaved === true, row: result.row || undefined, duplicate: result.duplicate === true }));
    return jsonResponse(result);
  } catch (error) {
    const reference = error.reference || requestReference;
    const code = error.code || "REQUEST_FAILED";
    // doPost catches errors, so Apps Script can label rejected requests
    // Completed. Explicitly log the action and rejection without the payload.
    const stage = error.saveStage || (action === "create_order" ? "creating_order" : action === "verify_payment" ? "verifying_payment" : "parse_request");
    console.error(JSON.stringify({ event: "workshop_request_failed", action: action, reference: reference, code: code, stage: stage, saveStage: error.saveStage || undefined, saveCause: error.saveCause || undefined, version: CONFIG.BACKEND_VERSION }));
    // Raw platform exceptions can contain cell contents or personal data.
    const message = error.code ? String(error.message) : "The registration server could not complete this request. Contact SK Bridal Studio with the reference below.";
    return jsonResponse({ ok: false, error: message, code: code, stage: stage, fields: error.fields || undefined, reference: reference, saveStage: error.saveStage || undefined, saveCause: error.saveCause || undefined, verified: code === "REGISTRATION_SAVE_FAILED", saved: false, registrationSaved: false });
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

function registrationHash_(registration) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, JSON.stringify(registration), Utilities.Charset.UTF_8)
    .map(function(byte) { return (byte & 255).toString(16).padStart(2, "0"); }).join("");
}

function sheetRegistrationHash_(registration) {
  const stored = Object.assign({}, registration, {
    name: cleanValue(registration.name, 100), gender: cleanValue(registration.gender, 50),
    goal: cleanValue(registration.goal, 500), question: cleanValue(registration.question, 1000),
    experience: cleanValue(registration.experience, 150), email: cleanValue(registration.email, 150),
    city: cleanValue(registration.city, 100), paymentScreenshot: cleanValue(registration.paymentScreenshot || "", 1000),
    course: cleanValue(registration.course, 150)
  });
  return registrationHash_(stored);
}

function createWorkshopOrder_(data, requestedAmount) {
  const registration = validateRegistration_(data);
  // Incoming amount is whole INR; convert once for Razorpay and keep paise
  // through order creation, validation, saving and the Checkout response.
  const amountPaise = paymentAmountPaise_(requestedAmount);
  // Check destination access before creating an order. This never creates a tab.
  try { getExistingResponseSheet_(); }
  catch (error) {
    const reference = Utilities.getUuid().substring(0, 8);
    console.error(JSON.stringify(Object.assign({ event: "workshop_destination_check_failed", reference: reference, stage: "check_destination", spreadsheetId: CONFIG.SPREADSHEET_ID, sheetName: CONFIG.SHEET_NAME }, safeWorkshopException_(error, registration))));
    const failure = backendError_(error.code || "SHEET_ACCESS_FAILED", "The registration sheet could not be opened. Please contact SK Bridal Studio.");
    failure.reference = reference;
    failure.saveStage = "check_destination";
    throw failure;
  }
  const credentials = razorpayCredentials_();
  const order = razorpayRequest_("/orders", "post", {
    amount: amountPaise, currency: CONFIG.CURRENCY,
    receipt: "ws_" + Date.now() + "_" + Utilities.getUuid().substring(0, 8),
    notes: { type: "workshop_advance", backend: CONFIG.BACKEND_VERSION, course: registration.course, registration_hash: sheetRegistrationHash_(registration) }
  });
  if (!/^order_[A-Za-z0-9]+$/.test(order.id || "") || order.amount !== amountPaise || order.currency !== CONFIG.CURRENCY) throw backendError_("ORDER_FAILED", "The payment service returned an invalid order. Checkout was not opened.");
  console.log(JSON.stringify({ event: "workshop_order_created", version: CONFIG.BACKEND_VERSION, orderId: order.id, amount: order.amount, currency: order.currency }));
  let row;
  try {
    row = savePendingRegistration_(registration, order.id, amountPaise);
  } catch (error) {
    const reference = Utilities.getUuid().substring(0, 8);
    console.error(JSON.stringify(Object.assign({ event: "workshop_pending_save_failed", reference: reference, stage: error.saveStage || "unknown", cause: error.code || "SHEET_WRITE_ERROR", spreadsheetId: CONFIG.SPREADSHEET_ID, sheetName: CONFIG.SHEET_NAME }, safeWorkshopException_(error, registration))));
    const failure = backendError_("PENDING_REGISTRATION_SAVE_FAILED", "Your registration could not be saved, so Checkout was not opened. Please try again.");
    failure.reference = reference;
    failure.saveStage = error.saveStage || "unknown";
    failure.saveCause = error.code || "SHEET_WRITE_ERROR";
    throw failure;
  }
  // Keep pendingSaved for existing frontends during rollout. Both flags are
  // emitted only after flush and read-back of the Pending registration row.
  return { ok: true, registrationSaved: true, pendingSaved: true, row: row, keyId: credentials.keyId, orderId: order.id, amount: order.amount, currency: order.currency };
}

function verifySignature_(orderId, paymentId, signature) {
  const bytes = Utilities.computeHmacSha256Signature(orderId + "|" + paymentId, razorpayCredentials_().secret, Utilities.Charset.UTF_8);
  const expected = bytes.map(function(byte) { return (byte & 255).toString(16).padStart(2, "0"); }).join("");
  let difference = 0;
  const received = signature.toLowerCase();
  for (let index = 0; index < expected.length; index++) difference |= expected.charCodeAt(index) ^ received.charCodeAt(index);
  if (difference !== 0) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Payment signature could not be verified.");
}

function paymentAmountPaise_(value) {
  const text = String(value === undefined || value === null ? "" : value).trim();
  const rupees = Number(text);
  const amount = rupees * 100;
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(rupees) || rupees < 1 || !Number.isSafeInteger(amount)) throw backendError_("VALIDATION_ERROR", "Enter a whole-rupee amount of at least INR 1.", { amount: "Enter a whole-rupee amount of at least INR 1." });
  return amount;
}

function paymentMatchesOrder_(payment, orderId, amount) {
  return payment && payment.order_id === orderId && payment.amount === amount && payment.currency === CONFIG.CURRENCY;
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

function registrationFromSheetRow_(sheet, row) {
  const values = sheet.getRange(row, 1, 1, 18).getValues()[0];
  return {
    registration: validateRegistration_({
      name: values[1], phone: values[2], gender: values[3], goal: values[4], question: values[5],
      experience: values[6], email: values[7], city: values[8], paymentScreenshot: values[10], course: values[14]
    }),
    values: values
  };
}

function setTextCell_(sheet, row, column, value) {
  const cell = sheet.getRange(row, column);
  cell.setNumberFormat("@");
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
  enterStage("format_pending_row");
  setTextCell_(sheet, row, CONFIG.PHONE_COL, registration.phone);
  setTextCell_(sheet, row, CONFIG.PAYMENT_ID_COL, "");
  setTextCell_(sheet, row, CONFIG.ORDER_ID_COL, orderId);
  enterStage("flush_pending_text_cells");
  SpreadsheetApp.flush();
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
    const saved = sheet.getRange(row, 1, 1, 18).getValues()[0];
    const checks = { status: String(saved[11]).toLowerCase() === "pending", confirmation: saved[12] === "No", whatsappBlank: saved[13] === "", course: saved[14] === registration.course, paymentIdBlank: saved[15] === "", orderId: String(saved[16]) === orderId, amount: Number(saved[17]) === amount / 100 };
    const valid = Object.keys(checks).every(function(key) { return checks[key]; });
    console.log(JSON.stringify({ event: "workshop_pending_read_back", row: row, orderId: orderId, valid: valid, checks: checks }));
    if (!valid) {
      throw backendError_("SHEET_WRITE_ERROR", "The pending registration row did not match the payment order.");
    }
    console.log(JSON.stringify({ event: "workshop_pending_row_confirmed", row: row, pendingSaved: true, orderId: orderId }));
    return row;
  } catch (error) {
    error.saveStage = stage;
    throw error;
  } finally {
    if (locked) lock.releaseLock();
  }
}

function pendingRegistration_(record) {
  const raw = record.registration;
  const registration = validateRegistration_(Object.assign({}, raw, { goal: raw.goal || raw.mainGoal }));
  const hashes = [registrationHash_(registration)];
  // Recover an order created by the former Firebase bridge when its
  // original server-side registration is still present. Never trust a newly
  // supplied frontend registration during payment verification.
  if (typeof raw.mainGoal === "string") {
    const legacy = {};
    ["name", "email", "phone", "course", "city", "gender", "mainGoal", "experience", "question", "paymentScreenshot"].forEach(function(field) {
      legacy[field] = String(raw[field] || "").trim();
    });
    hashes.push(registrationHash_(legacy));
  }
  return { registration: registration, hashes: hashes };
}

function verifyWorkshopPayment_(request, trustedRecovery) {
  if (typeof request.orderId !== "string" || !/^order_[A-Za-z0-9]+$/.test(request.orderId) || request.orderId.length > 100 ||
      typeof request.paymentId !== "string" || !/^pay_[A-Za-z0-9]+$/.test(request.paymentId) || request.paymentId.length > 100 ||
      (!trustedRecovery && (typeof request.signature !== "string" || !/^[a-f0-9]{64}$/i.test(request.signature)))) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Payment verification details are invalid.");
  if (!trustedRecovery) verifySignature_(request.orderId, request.paymentId, request.signature);
  const properties = PropertiesService.getScriptProperties();
  const key = "WORKSHOP_ORDER_" + request.orderId;
  const stored = properties.getProperty(key);
  let record = null;
  try { record = stored ? JSON.parse(stored) : null; } catch (_) { /* A sheet row is the primary recovery record. */ }
  const sheet = getResponseSheet_();
  const matches = findRegistrationRows_(sheet, request.orderId, request.paymentId);
  if (matches.orderRows.length > 1 || matches.paymentRows.length > 1) throw backendError_("SHEET_ROW_CONFLICT", "Multiple registration rows match this payment. Please contact SK Bridal Studio.");
  if (matches.paymentRows.length && matches.paymentRows[0] !== matches.orderRows[0]) throw backendError_("PAYMENT_ALREADY_USED", "This payment ID is already associated with a different order.");

  let pending = null;
  let sheetRow = 0;
  let expectedAmount = 0;
  if (matches.orderRows.length) {
    sheetRow = matches.orderRows[0];
    const found = registrationFromSheetRow_(sheet, sheetRow);
    const values = found.values;
    const status = String(values[11] || "").trim().toLowerCase();
    const existingPaymentId = String(values[15] || "");
    if (status !== "pending" && status !== "verified") throw backendError_("SHEET_ROW_CONFLICT", "The registration row is not in a recoverable payment state.");
    if (existingPaymentId && existingPaymentId !== request.paymentId) throw backendError_("ORDER_ALREADY_VERIFIED", "This order is already associated with a different payment.");
    const rupees = Number(values[17]);
    if (!Number.isSafeInteger(rupees) || rupees < 1 || !Number.isSafeInteger(rupees * 100)) throw backendError_("SHEET_ROW_CONFLICT", "The pending registration has an invalid advance amount.");
    expectedAmount = rupees * 100;
    pending = { registration: found.registration, hashes: [sheetRegistrationHash_(found.registration)] };
  } else if (record && record.registration) {
    pending = pendingRegistration_(record);
    expectedAmount = Number(record.amount);
  }
  if (!pending) throw backendError_("ORDER_NOT_FOUND", "The original registration is missing from the response sheet and Script Properties. Contact SK Bridal Studio with your payment ID.");

  const order = razorpayRequest_("/orders/" + encodeURIComponent(request.orderId));
  if (order.id !== request.orderId || !Number.isSafeInteger(order.amount) || order.amount < 100 || order.currency !== CONFIG.CURRENCY || !order.notes || order.notes.type !== "workshop_advance" || !order.notes.registration_hash) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Payment does not match this workshop order.");
  if (!Number.isSafeInteger(expectedAmount) || expectedAmount < 100 || expectedAmount !== order.amount || order.notes.course !== pending.registration.course || pending.hashes.indexOf(order.notes.registration_hash) === -1) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Payment does not match the saved registration or its expected amount.");
  const path = "/payments/" + encodeURIComponent(request.paymentId);
  let payment = razorpayRequest_(path);
  if (payment.id !== request.paymentId || !paymentMatchesOrder_(payment, request.orderId, order.amount)) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Payment amount, currency or order could not be verified.");
  if (payment.status === "authorized") {
    try { razorpayRequest_(path + "/capture", "post", { amount: order.amount, currency: CONFIG.CURRENCY }); }
    catch (_) { /* Another concurrent verification may already have captured it. Refetch below. */ }
    payment = razorpayRequest_(path);
  }
  if (!paymentMatchesOrder_(payment, request.orderId, order.amount) || payment.id !== request.paymentId || payment.status !== "captured" || payment.captured !== true) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Payment has not been captured. If you were charged, retry verification without paying again.");
  console.log(JSON.stringify({ event: "workshop_payment_verified", orderId: request.orderId, verified: true, captured: true }));
  let result;
  try {
    result = saveVerifiedRegistration_(pending.registration, request.orderId, request.paymentId, payment.amount);
  } catch (error) {
    if (error.code === "PAYMENT_ALREADY_USED") throw error;
    const reference = Utilities.getUuid().substring(0, 8);
    console.error(JSON.stringify(Object.assign({ event: "workshop_registration_save_failed", reference: reference, stage: error.saveStage || "unknown", cause: error.code || "SHEET_WRITE_ERROR", spreadsheetId: CONFIG.SPREADSHEET_ID, sheetName: CONFIG.SHEET_NAME }, safeWorkshopException_(error, pending.registration))));
    const failure = backendError_("REGISTRATION_SAVE_FAILED", "Your payment was verified, but registration could not be saved. Reference: " + reference + ". Try Again will retry saving without charging you again.");
    failure.reference = reference;
    failure.saveStage = error.saveStage || "unknown";
    failure.saveCause = error.code || "SHEET_WRITE_ERROR";
    throw failure;
  }
  // New registrations are recovered from the sheet; this removes only legacy fallback data.
  try { properties.deleteProperty(key); } catch (_) { /* Saving already succeeded. */ }
  return { ok: true, verified: true, saved: true, orderId: request.orderId, paymentId: request.paymentId, amount: payment.amount, currency: payment.currency, duplicate: result.duplicate, row: result.row };
}

// Owner-run recovery: supply payment and order IDs only. Registration data is
// loaded from the pending sheet row, then checked against Razorpay's API.
function recoverCapturedWorkshopPayment(paymentId) {
  const properties = PropertiesService.getScriptProperties();
  paymentId = String(paymentId || properties.getProperty("WORKSHOP_RECOVERY_PAYMENT_ID") || "").trim();
  if (!/^pay_[A-Za-z0-9]+$/.test(paymentId) || paymentId.length > 100) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Set WORKSHOP_RECOVERY_PAYMENT_ID to a valid Razorpay payment ID, or pass one to this function.");
  const payment = razorpayRequest_("/payments/" + encodeURIComponent(paymentId));
  if (payment.id !== paymentId || typeof payment.order_id !== "string" || !/^order_[A-Za-z0-9]+$/.test(payment.order_id)) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Razorpay did not return a valid order for this payment ID.");
  const result = verifyWorkshopPayment_({
    paymentId: paymentId,
    orderId: payment.order_id
  }, true);
  console.log(JSON.stringify({ event: "workshop_manual_recovery_completed", orderId: result.orderId, paymentId: result.paymentId, verified: result.verified, saved: result.saved, row: result.row, duplicate: result.duplicate }));
  return result;
}

function saveVerifiedRegistration_(registration, orderId, paymentId, amount) {
  const lock = LockService.getScriptLock();
  let locked = false;
  let stage = "acquire_lock";
  try {
    lock.waitLock(20000);
    locked = true;
    stage = "prepare_sheet";
    const sheet = getResponseSheet_();
    stage = "check_duplicate";
    const matches = findRegistrationRows_(sheet, orderId, paymentId);
    let duplicate = false;
    if (matches.orderRows.length > 1 || matches.paymentRows.length > 1) throw backendError_("SHEET_ROW_CONFLICT", "Multiple registration rows match this payment.");
    if (matches.paymentRows.length && matches.paymentRows[0] !== matches.orderRows[0]) throw backendError_("PAYMENT_ALREADY_USED", "This payment ID is already associated with a different order.");
    if (matches.orderRows.length) {
      const row = matches.orderRows[0];
      const values = sheet.getRange(row, 1, 1, 18).getValues()[0];
      const status = String(values[11] || "").trim().toLowerCase();
      const existingPaymentId = String(values[15] || "");
      if (existingPaymentId && existingPaymentId !== paymentId) throw backendError_("ORDER_ALREADY_VERIFIED", "This order is already associated with a different payment.");
      if (Number(values[17]) !== amount / 100) throw backendError_("SHEET_ROW_CONFLICT", "The registration amount does not match this payment.");
      if (status === "verified" && existingPaymentId === paymentId) {
        duplicate = true;
      } else {
        if (status !== "pending") throw backendError_("SHEET_ROW_CONFLICT", "The registration row is not pending payment.");
        const existing = registrationFromSheetRow_(sheet, row).registration;
        if (sheetRegistrationHash_(existing) !== sheetRegistrationHash_(registration)) throw backendError_("SHEET_ROW_CONFLICT", "The pending registration details changed before payment verification.");
      }
    } else {
      // Verification must never append. Even a valid legacy property is not
      // permission to recreate a deleted/missing row during payment recovery.
      stage = "locate_pending_row";
      throw backendError_("ORDER_NOT_FOUND", "Your payment was verified, but its existing registration row is missing. Contact SK Bridal Studio with your payment ID. Do not pay again.");
    }

    const row = matches.orderRows[0];
    stage = "update_verified_row";
    const sheetValues = sheet.getRange(row, 1, 1, 18).getValues()[0];
    const details = registrationFromSheetRow_(sheet, row).registration;
    const previousConfirmation = String(sheetValues[12] || "").trim();
    const confirmation = /^(yes|sent|confirmation sent)$/i.test(previousConfirmation) ? previousConfirmation : "Ready to Send";
    const whatsapp = "https://wa.me/" + details.phone + "?text=" + encodeURIComponent(buildConfirmationMessage_(details.name, amount / 100));
    const paymentCells = sheet.getRange(row, CONFIG.PAYMENT_COL, 1, 7);
    sheet.getRange(row, CONFIG.PAYMENT_ID_COL).setNumberFormat("@");
    sheet.getRange(row, CONFIG.ORDER_ID_COL).setNumberFormat("@");
    paymentCells.setValues([["Verified", confirmation, whatsapp, details.course, paymentId, orderId, amount / 100]]);
    stage = "flush_verified_row";
    SpreadsheetApp.flush();
    stage = "read_back_verified_row";
    const verified = sheet.getRange(row, 1, 1, 18).getValues()[0];
    if (String(verified[11]).toLowerCase() !== "verified" || String(verified[15]) !== paymentId || String(verified[16]) !== orderId || Number(verified[17]) !== amount / 100) {
      throw backendError_("SHEET_WRITE_ERROR", "The verified registration row could not be confirmed.");
    }
    return { duplicate: duplicate, row: row };
  } catch (error) {
    error.saveStage = stage;
    throw error;
  } finally { if (locked) lock.releaseLock(); }
}

// Run manually in the Apps Script editor. Read-only: no test registrations,
// payments, new tabs or changes to existing response rows are created.
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
  return jsonResponse({ ok: sheetAccessible && credentialsConfigured, backend: "google-apps-script", version: CONFIG.BACKEND_VERSION, sheet: CONFIG.SHEET_NAME, sheetAccessible: sheetAccessible, credentialsConfigured: credentialsConfigured, suggestedAmountRupees: CONFIG.SUGGESTED_PAYMENT_RUPEES, minimumAmountRupees: 1, currency: CONFIG.CURRENCY });
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
    return;
  }

  const name = String(
    sheet.getRange(row, CONFIG.NAME_COL).getDisplayValue()
  ).trim();

  let phone = String(
    sheet.getRange(row, CONFIG.PHONE_COL).getDisplayValue()
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
