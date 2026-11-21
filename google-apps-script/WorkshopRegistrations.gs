// =====================================================
// SK BRIDAL STUDIO - WORKSHOP REGISTRATION SYSTEM
// Google Sheets + AUTOMATIC Payment Verification + WhatsApp Confirmation
// =====================================================

const CONFIG = {
  SPREADSHEET_ID: "1TdrQD7sq_uRgLkPoKwubH23QJY-reCejaNTVgvr3ows",
  SHEET_NAME: "Form Responses 1",
  FIRST_DATA_ROW: 2,
  PAYMENT_AMOUNT: 50000,
  CURRENCY: "INR",
  BACKEND_VERSION: "workshop-auto-verify-v5-proof-upload",

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
  "2-Day Online Live Demo Workshop", "15-Day Bridal Makeup Masterclass", "30-Day Professional Bridal Makeup Masterclass"
];
// Keep existing saved registrations verifiable without offering these for new orders.
const LEGACY_SAVED_COURSES = [
  "Full 2-day masterclass", "Muhurtham Look (Day 1)", "Reception Look (Day 2)"
];

function validateRegistration_(data, allowLegacySavedCourse) {
  data = data && typeof data === "object" && !Array.isArray(data) ? data : {};

  // Accept the field names used by both the current website and older form versions.
  const normalized = {
    name: data.name || data.fullName || "",
    email: data.email || data.emailAddress || "",
    phone: data.phone || data.whatsapp || data.whatsappNumber || data.contact || "",
    gender: data.gender || "",
    goal: data.goal || data.mainGoal || data.main_goal || "",
    question: data.question || data.comments || data.additionalComments || "",
    experience: data.experience || data.currentExperience || data.makeupExperience || "",
    city: data.city || data.location || data.cityLocation || "",
    course: data.course || data.selectedCourse || "",
    paymentScreenshot: data.paymentScreenshot || data.paymentProofUrl || ""
  };

  const limits = {
    name: 100, email: 150, gender: 50, goal: 500, question: 1000,
    experience: 150, city: 100, course: 150, paymentScreenshot: 1000
  };
  const registration = {};
  const fields = {};

  Object.keys(limits).forEach(function(field) {
    registration[field] = String(normalized[field] == null ? "" : normalized[field]).trim();
    if (registration[field].length > limits[field]) {
      fields[field] = "Please use " + limits[field] + " characters or fewer.";
    }
  });

  registration.email = registration.email.toLowerCase();
  registration.phone = String(normalized.phone || "").replace(/\D/g, "");

  if (registration.phone.length === 10) {
    registration.phone = "91" + registration.phone;
  } else if (registration.phone.length === 11 && registration.phone.charAt(0) === "0") {
    registration.phone = "91" + registration.phone.substring(1);
  }

  ["name", "phone", "email", "gender", "experience", "goal", "course"].forEach(function(field) {
    if (!registration[field]) fields[field] = "This field is required.";
  });

  if (registration.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email)) {
    fields.email = "Please enter a valid email address.";
  }
  if (!/^91[6-9][0-9]{9}$/.test(registration.phone)) {
    fields.phone = "Enter a valid Indian WhatsApp number.";
  }
  if (ALLOWED_COURSES.indexOf(registration.course) === -1 && !(allowLegacySavedCourse === true && LEGACY_SAVED_COURSES.indexOf(registration.course) !== -1)) {
    fields.course = "Please select one of the available courses.";
  }
  if (registration.gender && ["Female", "Male", "Prefer not to say"].indexOf(registration.gender) === -1) {
    fields.gender = "Please select a valid gender.";
  }

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

  // Google Forms owns A-K. The website automation owns L-R.
  // Repair only the automation headers; never alter the Google Form columns.
  const automationHeaders = HEADERS.slice(11, 18);
  sheet.getRange(1, 12, 1, 7).setValues([automationHeaders]);
  SpreadsheetApp.flush();

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
    if (!event || !event.postData || !event.postData.contents) {
      throw backendError_("INVALID_REQUEST", "Request data is missing.");
    }

    const request = JSON.parse(event.postData.contents);

    if (!request || typeof request !== "object" || Array.isArray(request)) {
      throw backendError_("INVALID_REQUEST", "Request data is invalid.");
    }

    const action = String(request.action || request.type || "").trim().toLowerCase();
    console.log("Workshop request action: " + action);

    if (action === "create_order" || action === "createworkshoporder") {
      const result = createWorkshopOrder_(request.registration, request.amount, request.paymentProof);
      console.log("Razorpay order created successfully.");
      return jsonResponse(result);
    }

    if (action === "verify_payment" || action === "verifyworkshoppayment") {
      const result = verifyWorkshopPayment_(request);
      console.log("Workshop payment verification result: " + JSON.stringify(result));
      return jsonResponse(result);
    }

    throw backendError_("UNKNOWN_ACTION", "Unknown registration action.");

  } catch (error) {
    console.error(
      "Workshop backend error: " +
      (error.code || "REQUEST_FAILED") +
      " - " +
      "Request rejected"
    );

    return jsonResponse({
      ok: false,
      error: error.code ? String(error.message) : "The registration server could not complete this request. Contact SK Bridal Studio; do not pay again if charged.",
      code: error.code || "REQUEST_FAILED",
      fields: error.fields || undefined,
      verified: error.verified === true,
      paymentCaptured: error.paymentCaptured === true,
      saveCause: error.saveCause || undefined,
      saved: false
    });
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

function createWorkshopOrder_(data, requestedAmount, paymentProof) {
  const registration = validateRegistration_(data);
  const amount = paymentAmountPaise_(requestedAmount);
  const proofUrl = paymentProof ? uploadWorkshopProof_(paymentProof) : "";
  if (proofUrl) registration.paymentScreenshot = proofUrl;

  // Save the registration FIRST. Checkout must never open unless this row
  // has been written to and read back from Google Sheets successfully.
  const saved = appendPendingRegistration_(registration, amount);
  if (proofUrl && String(getExistingResponseSheet_().getRange(saved.row, CONFIG.PAYMENT_SCREENSHOT_COL).getValue()) !== proofUrl) {
    throw backendError_("REGISTRATION_SAVE_FAILED", "The payment proof link could not be confirmed in your registration. Checkout was not opened.");
  }

  // Keep Razorpay Checkout enabled, but do not verify or capture payments here.
  // If order creation fails, the Pending registration remains in the Sheet.
  const credentials = razorpayCredentials_();
  const order = razorpayRequest_("/orders", "post", {
    amount: amount,
    currency: CONFIG.CURRENCY,
    receipt: "ws_" + Date.now() + "_" + Utilities.getUuid().substring(0, 8),
    notes: {
      type: "workshop_advance",
      backend: CONFIG.BACKEND_VERSION,
      course: registration.course,
      registration_hash: registrationHash_(registration)
    }
  });

  if (!/^order_[A-Za-z0-9]+$/.test(order.id || "") ||
      order.amount !== amount ||
      order.currency !== CONFIG.CURRENCY) {
    throw backendError_("ORDER_FAILED", "The payment service returned an invalid order. Your registration is saved as Pending; contact SK Bridal Studio before retrying.");
  }

  // Add the Razorpay order ID to the SAME Pending row.
  const sheet = getResponseSheet_();
  sheet.getRange(saved.row, CONFIG.ORDER_ID_COL).setNumberFormat("@");
  sheet.getRange(saved.row, CONFIG.ORDER_ID_COL).setValue(order.id);
  SpreadsheetApp.flush();

  if (String(sheet.getRange(saved.row, CONFIG.ORDER_ID_COL).getDisplayValue()).trim() !== order.id) {
    throw backendError_("SHEET_WRITE_ERROR", "Your registration was saved as Pending, but the order reference could not be confirmed. Contact SK Bridal Studio.");
  }

  return {
    ok: true,
    registrationSaved: true,
    paymentProofSaved: Boolean(proofUrl),
    saved: true,
    row: saved.row,
    keyId: credentials.keyId,
    orderId: order.id,
    amount: order.amount,
    currency: CONFIG.CURRENCY,
    paymentVerification: "AUTOMATIC"
  };
}

// Run once as the owner to authorize Drive and create/select the proof folder.
// Uploads inherit this folder's existing access; no public sharing is enabled.
function setupWorkshopProofUploads() {
  const properties = PropertiesService.getScriptProperties();
  const folderId = properties.getProperty("WORKSHOP_PROOF_FOLDER_ID");
  const folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.createFolder("SK Bridal Studio - Workshop Payment Proofs");
  properties.setProperty("WORKSHOP_PROOF_FOLDER_ID", folder.getId());
  const report = { ready: true, folderId: folder.getId(), folderUrl: folder.getUrl() };
  console.log(JSON.stringify(report));
  return report;
}

function uploadWorkshopProof_(proof) {
  const maxBytes = 5 * 1024 * 1024;
  const types = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" };
  const invalid = function(message) { return backendError_("VALIDATION_ERROR", message, { paymentScreenshot: message }); };
  if (!proof || typeof proof !== "object" || !Object.prototype.hasOwnProperty.call(types, proof.mimeType)) throw invalid("Choose a JPG, PNG, WEBP image or a PDF.");
  const data = proof.base64;
  if (typeof data !== "string" || !data.length || data.length > 4 * Math.ceil(maxBytes / 3) || data.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) throw invalid("Choose a valid payment proof file up to 5 MB.");
  let bytes;
  try { bytes = Utilities.base64Decode(data); } catch (_) { throw invalid("The payment proof could not be read. Please choose it again."); }
  if (!bytes.length || bytes.length > maxBytes) throw invalid("Choose a payment proof file up to 5 MB.");
  const starts = function(offset, expected) { return expected.every(function(value, index) { return (bytes[offset + index] & 255) === value; }); };
  const valid = proof.mimeType === "image/jpeg" ? starts(0, [255, 216, 255])
    : proof.mimeType === "image/png" ? starts(0, [137, 80, 78, 71, 13, 10, 26, 10])
    : proof.mimeType === "image/webp" ? starts(0, [82, 73, 70, 70]) && starts(8, [87, 69, 66, 80])
    : starts(0, [37, 80, 68, 70, 45]);
  if (!valid) throw invalid("The file content does not match the selected image or PDF type.");
  const folderId = PropertiesService.getScriptProperties().getProperty("WORKSHOP_PROOF_FOLDER_ID");
  if (!folderId) throw backendError_("PROOF_UPLOAD_NOT_CONFIGURED", "Payment proof uploads are unavailable. Contact SK Bridal Studio or remove the selected file to continue with Razorpay.");
  try {
    const filename = "payment-proof_" + Utilities.getUuid().replace(/-/g, "") + "." + types[proof.mimeType];
    const file = DriveApp.getFolderById(folderId).createFile(Utilities.newBlob(bytes, proof.mimeType, filename));
    return file.getUrl();
  } catch (_) {
    throw backendError_("PROOF_UPLOAD_FAILED", "Your payment proof could not be uploaded. Please try again or contact SK Bridal Studio. Checkout was not opened.");
  }
}

/**
 * Find the first completely empty row in A:R, starting below the headers.
 * A row is considered empty only when every cell in A:R has no displayed
 * value and no formula. If no gap exists, return the next row after lastRow.
 */
function findFirstEmptyDataRow_(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), CONFIG.FIRST_DATA_ROW - 1);
  if (lastRow < CONFIG.FIRST_DATA_ROW) return CONFIG.FIRST_DATA_ROW;

  const rowCount = lastRow - CONFIG.FIRST_DATA_ROW + 1;
  const range = sheet.getRange(CONFIG.FIRST_DATA_ROW, 1, rowCount, 18);
  const values = range.getDisplayValues();
  const formulas = range.getFormulas();

  for (let i = 0; i < values.length; i++) {
    let isEmpty = true;
    for (let j = 0; j < 18; j++) {
      if (String(values[i][j] || "").trim() !== "" || formulas[i][j]) {
        isEmpty = false;
        break;
      }
    }
    if (isEmpty) return CONFIG.FIRST_DATA_ROW + i;
  }

  return lastRow + 1;
}

/**
 * Append one Pending registration row to the existing Form Responses 1 tab.
 * A-K are populated with registration details; L-R are website automation fields.
 * Existing Google Forms rows and headers are not modified.
 */
function appendPendingRegistration_(registration, amountPaise) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const sheet = getResponseSheet_();
    const details = validateRegistration_(registration);

    // Reuse the first completely empty row after the header instead of
    // always appending after getLastRow(). This preserves existing responses
    // while filling any genuine gaps in the response table.
    const targetRow = findFirstEmptyDataRow_(sheet);
    const amountInRupees = amountPaise / 100;

    // Preserve phone numbers as text so the leading country code is retained.
    sheet.getRange(targetRow, CONFIG.PHONE_COL).setNumberFormat("@");

    const rowValues = [[
      new Date(),                                      // A Timestamp
      cleanValue(details.name, 100),                  // B Full Name
      details.phone,                                  // C Contact/WhatsApp
      cleanValue(details.gender, 50),                 // D Gender
      cleanValue(details.goal, 500),                  // E Main Goal
      cleanValue(details.question, 1000),             // F Comments
      cleanValue(details.experience, 150),            // G Experience
      cleanValue(details.email, 150),                 // H Email
      cleanValue(details.city, 100),                  // I City
      "",                                             // J Score
      cleanValue(details.paymentScreenshot || "", 1000), // K Screenshot URL
      "Pending",                                      // L Payment Status
      "No",                                           // M Confirmation Sent
      "",                                             // N WhatsApp Link
      cleanValue(details.course, 150),                // O Course
      "",                                             // P Razorpay Payment ID
      "",                                             // Q Razorpay Order ID (filled after order creation)
      amountInRupees                                  // R Advance Paid (INR)
    ]];

    sheet.getRange(targetRow, 1, 1, 18).setValues(rowValues);
    SpreadsheetApp.flush();

    // Read back the saved data to verify the row before allowing Checkout.
    const savedValues = sheet.getRange(targetRow, 1, 1, 18).getValues()[0];
    const savedName = String(savedValues[1] || "").trim();
    const savedPhone = String(savedValues[2] || "").replace(/^'/, "").trim();
    const savedEmail = String(savedValues[7] || "").trim().toLowerCase();
    const savedStatus = String(savedValues[11] || "").trim();

    if (savedName !== details.name ||
        savedPhone !== details.phone ||
        savedEmail !== details.email ||
        savedStatus !== "Pending" ||
        Number(savedValues[17]) !== amountInRupees) {
      throw backendError_("REGISTRATION_SAVE_FAILED", "The Pending registration could not be confirmed in Google Sheets. Checkout was not opened.");
    }

    return { row: targetRow };
  } catch (error) {
    if (error && error.code) throw error;
    console.error("Pending registration save failed: " + String(error.message || error));
    throw backendError_("REGISTRATION_SAVE_FAILED", "Could not save your registration to Google Sheets. Checkout was not opened.");
  } finally {
    lock.releaseLock();
  }
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
  const text = String(value === undefined ? 500 : value).trim();
  const parts = text.split('.');
  const amount = Number(parts[0]) * 100 + Number((parts[1] || '').padEnd(2, '0'));
  if (!/^\d+(?:\.\d{1,2})?$/.test(text) || !Number.isSafeInteger(amount) || amount < 100) throw backendError_("VALIDATION_ERROR", "Enter an amount of at least INR 1 with up to two decimal places.", { amount: "Enter an amount of at least INR 1 with up to two decimal places." });
  return amount;
}

function paymentMatchesOrder_(payment, orderId, amount) {
  return payment && payment.order_id === orderId && payment.amount === amount && payment.currency === CONFIG.CURRENCY;
}

function pendingRegistration_(record) {
  const raw = record.registration;
  const registration = validateRegistration_(Object.assign({}, raw, { goal: raw.goal || raw.mainGoal }));
  const hashes = [registrationHash_(registration)];
  // Recover an INR 500 order created by the former Firebase bridge when its
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

/**
 * Find the existing Pending registration by its Razorpay Order ID.
 * This never creates a second registration row.
 */
function findRegistrationRowByOrderId_(sheet, orderId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < CONFIG.FIRST_DATA_ROW) return null;

  const orderValues = sheet.getRange(
    CONFIG.FIRST_DATA_ROW,
    CONFIG.ORDER_ID_COL,
    lastRow - CONFIG.FIRST_DATA_ROW + 1,
    1
  ).getDisplayValues();

  let found = null;
  for (let i = 0; i < orderValues.length; i++) {
    const savedOrderId = String(orderValues[i][0] || "").replace(/^'/, "").trim();
    if (savedOrderId === orderId) {
      if (found !== null) throw backendError_("SHEET_ROW_CONFLICT", "Multiple registrations match this order ID.");
      found = CONFIG.FIRST_DATA_ROW + i;
    }
  }
  return found;
}

/** Rebuild the normalized registration from the saved Sheet row. */
function registrationFromSheetRow_(sheet, row) {
  const values = sheet.getRange(row, 1, 1, 18).getValues()[0];
  return validateRegistration_({
    name: values[1],
    phone: values[2],
    gender: values[3],
    goal: values[4],
    question: values[5],
    experience: values[6],
    email: values[7],
    city: values[8],
    course: values[14],
    paymentScreenshot: values[10]
  }, true);
}

/**
 * Verify Razorpay Checkout signature, confirm the payment with Razorpay,
 * capture an authorized payment if necessary, then update the SAME Pending row.
 */
function verifyWorkshopPayment_(request) {
  const orderId = request.orderId || request.razorpay_order_id;
  const paymentId = request.paymentId || request.razorpay_payment_id;
  const signature = request.signature || request.razorpay_signature;

  if (typeof orderId !== "string" || !/^order_[A-Za-z0-9]+$/.test(orderId) ||
      typeof paymentId !== "string" || !/^pay_[A-Za-z0-9]+$/.test(paymentId) ||
      typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)) {
    throw backendError_("PAYMENT_VERIFICATION_FAILED", "Payment verification details are invalid.");
  }

  verifySignature_(orderId, paymentId, signature);

  const sheet = getResponseSheet_();
  const initialRow = findRegistrationRowByOrderId_(sheet, orderId);
  if (!initialRow) {
    throw backendError_("ORDER_NOT_FOUND", "The Pending registration for this Razorpay order could not be found. Contact SK Bridal Studio with your payment ID.");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const row = findRegistrationRowByOrderId_(sheet, orderId);
    if (!row) throw backendError_("ORDER_NOT_FOUND", "The registration row could not be found.");

    const rowValues = sheet.getRange(row, 1, 1, 18).getValues()[0];
    const currentStatus = String(rowValues[11] || "").trim().toLowerCase();
    const existingPaymentId = String(rowValues[15] || "").replace(/^'/, "").trim();
    const registration = registrationFromSheetRow_(sheet, row);
    const expectedAmountPaise = Math.round(Number(rowValues[17]) * 100);

    if (!Number.isSafeInteger(expectedAmountPaise) || expectedAmountPaise < 100) {
      throw backendError_("SHEET_ROW_CONFLICT", "The saved advance amount is invalid. Please contact SK Bridal Studio.");
    }

    // Idempotent retry: a previously verified row is accepted only for the same payment.
    if (currentStatus === "verified") {
      if (existingPaymentId !== paymentId) {
        throw backendError_("PAYMENT_ALREADY_USED", "This order is already linked to a different payment ID.");
      }
      // Recheck the payment with Razorpay on retries before confirming success.
    }

    if (currentStatus !== "pending" && currentStatus !== "verified") {
      throw backendError_("SHEET_ROW_CONFLICT", "This registration is not Pending and needs review.");
    }

    const order = razorpayRequest_("/orders/" + encodeURIComponent(orderId));
    if (order.id !== orderId ||
        order.currency !== CONFIG.CURRENCY ||
        order.amount !== expectedAmountPaise ||
        !order.notes ||
        order.notes.type !== "workshop_advance" ||
        order.notes.course !== registration.course ||
        order.notes.registration_hash !== registrationHash_(registration)) {
      throw backendError_("PAYMENT_VERIFICATION_FAILED", "The Razorpay order does not match the saved registration or advance amount.");
    }

    const paymentPath = "/payments/" + encodeURIComponent(paymentId);
    let payment = razorpayRequest_(paymentPath);

    if (!payment || payment.id !== paymentId ||
        !paymentMatchesOrder_(payment, orderId, expectedAmountPaise)) {
      throw backendError_("PAYMENT_VERIFICATION_FAILED", "Payment ID, order, amount or currency does not match.");
    }

    // If auto-capture is enabled, payment is already captured and this is skipped.
    if (payment.status === "authorized") {
      try {
        razorpayRequest_(paymentPath + "/capture", "post", {
          amount: expectedAmountPaise,
          currency: CONFIG.CURRENCY
        });
      } catch (captureError) {
        console.warn("Capture request returned an error; checking payment status again.");
      }
      payment = razorpayRequest_(paymentPath);
    }

    if (payment.status !== "captured" || payment.captured !== true ||
        !paymentMatchesOrder_(payment, orderId, expectedAmountPaise)) {
      throw backendError_("PAYMENT_NOT_CAPTURED", "Payment is not captured yet. If you were charged, do not pay again; contact SK Bridal Studio.");
    }

    try {
      return saveVerifiedRegistration_(row, registration, orderId, paymentId, expectedAmountPaise);
    } catch (error) {
      const failure = backendError_("REGISTRATION_SAVE_FAILED", "Your payment was captured, but the registration update could not be confirmed. Contact SK Bridal Studio with your payment ID. Do not pay again; retry only verification.");
      failure.verified = true;
      failure.paymentCaptured = true;
      failure.saveCause = error.code || "SHEET_WRITE_ERROR";
      throw failure;
    }
  } finally {
    lock.releaseLock();
  }
}

/** Update the existing Pending row; never append a duplicate registration. */
function saveVerifiedRegistration_(row, registration, orderId, paymentId, amountPaise) {
  const sheet = getResponseSheet_();
  validateRegistration_(registration, true);
  // Re-resolve the order after network calls; row numbers can move.
  row = findRegistrationRowByOrderId_(sheet, orderId);
  if (!row) throw backendError_("ORDER_NOT_FOUND", "The Pending registration for this order is missing.");
  const values = sheet.getRange(row, 1, 1, 18).getValues()[0];
  const status = String(values[11] || "").trim().toLowerCase();
  const existingPaymentId = String(values[15] || "").replace(/^'/, "").trim();
  if ((status !== "pending" && status !== "verified") || (existingPaymentId && existingPaymentId !== paymentId) || (status === "verified" && existingPaymentId !== paymentId)) throw backendError_("SHEET_ROW_CONFLICT", "The registration payment state needs review.");
  if (Math.round(Number(values[17]) * 100) !== amountPaise) throw backendError_("SHEET_ROW_CONFLICT", "The registration amount changed during verification.");
  if (registrationHash_(registrationFromSheetRow_(sheet, row)) !== registrationHash_(registration)) throw backendError_("SHEET_ROW_CONFLICT", "The registration details changed during verification.");
  const paymentRows = sheet.getRange(CONFIG.FIRST_DATA_ROW, CONFIG.PAYMENT_ID_COL, sheet.getLastRow() - CONFIG.FIRST_DATA_ROW + 1, 1).getValues();
  paymentRows.forEach(function(value, index) {
    if (String(value[0] || "").replace(/^'/, "").trim() === paymentId && CONFIG.FIRST_DATA_ROW + index !== row) throw backendError_("PAYMENT_ALREADY_USED", "This payment is already linked to another registration.");
  });
  const duplicate = status === "verified";
  const previousConfirmation = String(values[12] || "").trim();
  const confirmation = duplicate && /^(yes|sent|confirmation sent)$/i.test(previousConfirmation) ? previousConfirmation : "Ready to Send";
  const whatsapp = "https://wa.me/" + registration.phone + "?text=" + encodeURIComponent(buildConfirmationMessage_(registration.name, amountPaise / 100));
  // Only L-R change. Keep A-K and the existing first-empty-row saver intact.
  // IDs are already text; do not require typed-column number-format changes.
  sheet.getRange(row, CONFIG.PAYMENT_COL, 1, 7).setValues([["Verified", confirmation, whatsapp, registration.course, paymentId, orderId, amountPaise / 100]]);
  SpreadsheetApp.flush();
  const saved = sheet.getRange(row, 1, 1, 18).getValues()[0];
  if (String(saved[11]).toLowerCase() !== "verified" || !saved[13] || String(saved[15]) !== paymentId || String(saved[16]) !== orderId || Math.round(Number(saved[17]) * 100) !== amountPaise) throw backendError_("REGISTRATION_SAVE_FAILED", "The verified row could not be read back.");
  // A plain, valid URL is already saved; keep the existing rich-link workflow.
  if (confirmation === "Ready to Send") {
    try { createWhatsAppLink_(sheet, row); SpreadsheetApp.flush(); }
    catch (_) { console.warn("Registration saved; the plain WhatsApp link remains available."); }
  }
  return { ok: true, verified: true, saved: true, duplicate: duplicate, row: row,
    paymentId: paymentId, orderId: orderId, amount: amountPaise, currency: CONFIG.CURRENCY };
}

function doGet() {
  const properties = PropertiesService.getScriptProperties();
  let sheetAccessible = false;
  let sheetError = null;
  try {
    getResponseSheet_();
    SpreadsheetApp.flush();
    sheetAccessible = true;
  } catch (error) {
    sheetError = String(error.message || error);
  }
  const credentialsConfigured = Boolean(
    properties.getProperty("RAZORPAY_KEY_ID") &&
    properties.getProperty("RAZORPAY_KEY_SECRET")
  );
  return jsonResponse({
    ok: sheetAccessible && credentialsConfigured,
    backend: "google-apps-script",
    version: CONFIG.BACKEND_VERSION,
    sheet: CONFIG.SHEET_NAME,
    sheetAccessible: sheetAccessible,
    sheetError: sheetError,
    credentialsConfigured: credentialsConfigured,
    defaultAmount: CONFIG.PAYMENT_AMOUNT / 100,
    minimumAmount: 1,
    currency: CONFIG.CURRENCY
  });
}

function testWorkshopSheetConnection() {
  const sheet = getResponseSheet_();
  SpreadsheetApp.flush();
  const result = {
    spreadsheetName: sheet.getParent().getName(),
    sheetName: sheet.getName(),
    lastRow: sheet.getLastRow(),
    maxColumns: sheet.getMaxColumns(),
    headersLtoR: sheet.getRange(1, 12, 1, 7).getDisplayValues()[0]
  };
  Logger.log(JSON.stringify(result));
  return result;
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
    "https://wa.me/" +
    phone +
    "?text=" +
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
    "https://wa.me/918668038093?text=" +
    encoded;

  Logger.log("Test URL: " + testUrl);
}
