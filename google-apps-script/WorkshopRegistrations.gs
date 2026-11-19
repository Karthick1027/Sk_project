
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
  BACKEND_VERSION: "workshop-spark-v2-flexible",

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

function doPost(event) {
  try {
    if (!event || !event.postData || !event.postData.contents) throw backendError_("INVALID_REQUEST", "Request data is missing.");
    const request = JSON.parse(event.postData.contents);
    if (!request || typeof request !== "object" || Array.isArray(request)) throw backendError_("INVALID_REQUEST", "Request data is invalid.");
    if (request.action === "create_order") return jsonResponse(createWorkshopOrder_(request.registration, request.amount));
    if (request.action === "verify_payment") return jsonResponse(verifyWorkshopPayment_(request));
    // No public append/mark-verified action or legacy token callback is allowed.
    throw backendError_("UNKNOWN_ACTION", "Unknown registration action.");
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error.message || error), code: error.code || "REQUEST_FAILED", fields: error.fields || undefined, verified: error.code === "REGISTRATION_SAVE_FAILED", saved: false });
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

function createWorkshopOrder_(data, requestedAmount) {
  const registration = validateRegistration_(data);
  const amount = paymentAmountPaise_(requestedAmount);
  // Check sheet access before allowing Checkout. This never creates a tab.
  getExistingResponseSheet_();
  const credentials = razorpayCredentials_();
  const record = { registration: registration, amount: amount, currency: CONFIG.CURRENCY };
  const stored = JSON.stringify(record);
  if (Utilities.newBlob(stored).getBytes().length > 8500) throw backendError_("VALIDATION_ERROR", "Please shorten your goal or comments.", { goal: "Please shorten your goal or comments." });
  const order = razorpayRequest_("/orders", "post", {
    amount: amount, currency: CONFIG.CURRENCY,
    receipt: "ws_" + Date.now() + "_" + Utilities.getUuid().substring(0, 8),
    notes: { type: "workshop_advance", backend: CONFIG.BACKEND_VERSION, course: registration.course, registration_hash: registrationHash_(registration) }
  });
  if (!/^order_[A-Za-z0-9]+$/.test(order.id || "") || order.amount !== amount || order.currency !== CONFIG.CURRENCY) throw backendError_("ORDER_FAILED", "The payment service returned an invalid order. Checkout was not opened.");
  try { PropertiesService.getScriptProperties().setProperty("WORKSHOP_ORDER_" + order.id, stored); }
  catch (_) { throw backendError_("ORDER_SAVE_FAILED", "Your order details could not be saved. Checkout was not opened. Please contact SK Bridal Studio."); }
  return { ok: true, keyId: credentials.keyId, orderId: order.id, amount: order.amount, currency: order.currency };
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

function verifyWorkshopPayment_(request) {
  if (typeof request.orderId !== "string" || !/^order_[A-Za-z0-9]+$/.test(request.orderId) || request.orderId.length > 100 ||
      typeof request.paymentId !== "string" || !/^pay_[A-Za-z0-9]+$/.test(request.paymentId) || request.paymentId.length > 100 ||
      typeof request.signature !== "string" || !/^[a-f0-9]{64}$/i.test(request.signature)) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Payment verification details are invalid.");
  verifySignature_(request.orderId, request.paymentId, request.signature);
  const properties = PropertiesService.getScriptProperties();
  const key = "WORKSHOP_ORDER_" + request.orderId;
  const stored = properties.getProperty(key);
  const record = stored ? JSON.parse(stored) : null;
  const pending = record && record.registration ? pendingRegistration_(record) : null;
  const order = razorpayRequest_("/orders/" + encodeURIComponent(request.orderId));
  if (order.id !== request.orderId || !Number.isSafeInteger(order.amount) || order.amount < 100 || order.currency !== CONFIG.CURRENCY || !order.notes || order.notes.type !== "workshop_advance" || !order.notes.registration_hash) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Payment does not match this workshop order.");
  if (pending && (!Number.isSafeInteger(record.amount) || record.amount < 100 || record.amount !== order.amount || record.currency !== CONFIG.CURRENCY || order.notes.course !== pending.registration.course || pending.hashes.indexOf(order.notes.registration_hash) === -1)) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Payment does not match the saved registration or its stored expected amount.");
  const path = "/payments/" + encodeURIComponent(request.paymentId);
  let payment = razorpayRequest_(path);
  if (payment.id !== request.paymentId || !paymentMatchesOrder_(payment, request.orderId, order.amount)) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Payment amount, currency or order could not be verified.");
  if (payment.status === "authorized") {
    if (!pending) throw backendError_("PAYMENT_VERIFICATION_FAILED", "The original registration is missing. Contact SK Bridal Studio before making another payment.");
    try { razorpayRequest_(path + "/capture", "post", { amount: order.amount, currency: CONFIG.CURRENCY }); }
    catch (_) { /* Another concurrent verification may already have captured it. Refetch below. */ }
    payment = razorpayRequest_(path);
  }
  if (!paymentMatchesOrder_(payment, request.orderId, order.amount) || payment.id !== request.paymentId || payment.status !== "captured" || payment.captured !== true) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Payment has not been captured. If you were charged, retry verification without paying again.");
  let result;
  try {
    result = saveVerifiedRegistration_(pending && pending.registration, request.orderId, request.paymentId, order.amount);
  } catch (error) {
    if (error.code === "PAYMENT_ALREADY_USED") throw error;
    console.error("Verified registration save failed", error.code || "SHEET_WRITE_ERROR");
    throw backendError_("REGISTRATION_SAVE_FAILED", "Your payment was verified, but registration could not be saved. Try Again will retry saving without charging you again.");
  }
  // The saved row is the durable deduplication record. A retry without this
  // pending property still rechecks HMAC, Razorpay and the exact saved row.
  try { properties.deleteProperty(key); } catch (_) { /* Saving already succeeded. */ }
  return { ok: true, verified: true, saved: true, amount: order.amount, currency: CONFIG.CURRENCY, duplicate: result.duplicate, row: result.row };
}

function findPaymentRow_(sheet, orderId, paymentId, amount) {
  const lastRow = sheet.getLastRow();
  if (lastRow < CONFIG.FIRST_DATA_ROW) return null;
  const rows = sheet.getRange(CONFIG.FIRST_DATA_ROW, CONFIG.PAYMENT_ID_COL, lastRow - CONFIG.FIRST_DATA_ROW + 1, 2).getDisplayValues();
  const index = rows.findIndex(function(row) { return row[0] === paymentId || row[1] === orderId; });
  if (index < 0) return null;
  const row = CONFIG.FIRST_DATA_ROW + index;
  const values = sheet.getRange(row, 1, 1, 18).getValues()[0];
  if (String(values[15]) !== paymentId || String(values[16]) !== orderId) throw backendError_("PAYMENT_ALREADY_USED", "This payment or order is already associated with another registration.");
  if (String(values[11]).toLowerCase() !== "verified" || Number(values[17]) !== amount / 100) throw backendError_("SHEET_ROW_CONFLICT", "The saved payment record needs review. Please contact SK Bridal Studio.");
  return row;
}

function saveVerifiedRegistration_(registration, orderId, paymentId, amount) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getResponseSheet_();
    const existing = findPaymentRow_(sheet, orderId, paymentId, amount);
    if (existing) { SpreadsheetApp.flush(); return { duplicate: true, row: existing }; }
    if (!registration) throw backendError_("ORDER_NOT_FOUND", "The original order details are missing. Please contact SK Bridal Studio with your payment ID.");
    const details = validateRegistration_(registration);
    const whatsapp = "https://web.whatsapp.com/send?phone=" + details.phone + "&text=" + encodeURIComponent(buildConfirmationMessage_(details.name, amount / 100));
    sheet.appendRow([
      new Date(), cleanValue(details.name, 100), details.phone, cleanValue(details.gender, 50),
      cleanValue(details.goal, 500), cleanValue(details.question, 1000), cleanValue(details.experience, 150),
      cleanValue(details.email, 150), cleanValue(details.city, 100), "", cleanValue(details.paymentScreenshot || "", 1000),
      "Verified", "Ready to Send", whatsapp, details.course, paymentId, orderId, amount / 100
    ]);
    SpreadsheetApp.flush();
    // Locate this payment, not getLastRow(): a Google Form can append at the
    // same time, and is not governed by the Apps Script website lock.
    const row = findPaymentRow_(sheet, orderId, paymentId, amount);
    if (!row) throw backendError_("SHEET_WRITE_ERROR", "The registration row could not be read back.");
    try { createWhatsAppLink_(sheet, row); } catch (_) { console.warn("Registration saved; the plain WhatsApp URL remains available."); }
    return { duplicate: false, row: row };
  } finally { lock.releaseLock(); }
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
  try { getResponseSheet_(); SpreadsheetApp.flush(); }
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
  const message = buildConfirmationMessage_(name, advance);

  // Encode complete message, including emojis.
  const encodedMessage = encodeURIComponent(message);

  const url =
    "https://web.whatsapp.com/send?phone=" +
    phone +
    "&text=" +
    encodedMessage;

  const richText = SpreadsheetApp.newRichTextValue()
    .setText("Send WhatsApp")
    .setLinkUrl(url)
    .build();

  linkCell.setRichTextValue(richText);

  // Update confirmation status.
  const confirmationCell = sheet.getRange(
    row,
    CONFIG.CONFIRMATION_COL
  );

  const currentStatus = String(
    confirmationCell.getDisplayValue()
  ).trim();

  if (currentStatus !== "Confirmation Sent") {
    confirmationCell.setValue("Ready to Send");
  }
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
