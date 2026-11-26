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
  BACKEND_VERSION: "workshop-auto-verify-v8-bridal-advances",

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

const COURSE_FEES = {
  "2-Day Online Live Demo Workshop": 3999,
  "15-Day Bridal Makeup Masterclass": 29999,
  "30-Day Professional Bridal Makeup Masterclass": 49999
};
const COURSE_ADVANCES = {
  "2-Day Online Live Demo Workshop": 500,
  "15-Day Bridal Makeup Masterclass": 5000,
  "30-Day Professional Bridal Makeup Masterclass": 10000
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

    if (action === "bridal_payment_link_status") return jsonResponse(bridalPaymentLinkStatus_());
    if (action === "create_bridal_checkout") return jsonResponse(createBridalCheckout_(request));
    if (action === "verify_bridal_checkout") return jsonResponse(verifyBridalCheckout_(request));
    if (action === "create_bridal_payment_link") return jsonResponse(createBridalPaymentLink_(request));
    if (action === "check_bridal_availability") return jsonResponse(checkBridalAvailability_(request));
    if (action === "create_bridal_order") return jsonResponse(createBridalOrder_(request));
    if (action === "verify_bridal_payment") return jsonResponse(verifyBridalPayment_(request));

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

const BRIDAL_AVAILABILITY_CONFIG = {
  SPREADSHEET_ID: "1m5sE85VjltmUIaVyYMleLZ8Ai1UeFD3Gr4zZ33G0fwA",
  SHEET_ID: 0, // Confirmed gid from the booking spreadsheet URL; independent of tab name.
  SHEET_NAME: "Customer Booking Details",
  OCCASIONS: ["Muhurtham", "Reception", "Engagement", "Baby Shower", "Puberty Ceremony"],
  SESSIONS: ["Morning", "Evening", "Full Day"]
};

function checkBridalAvailability_(parameters) {
  const date = String(parameters.date || "").trim();
  const normalizedDate = bridalNormalizeAvailabilityDate_(date);
  const occasion = String(parameters.occasion || "").trim();
  const session = String(parameters.session || "").trim();
  if (!normalizedDate) return bridalAvailabilityError_(date, session, "Enter a valid date in DD/MM/YYYY or YYYY-MM-DD format.");
  if (BRIDAL_AVAILABILITY_CONFIG.OCCASIONS.indexOf(occasion) === -1) return bridalAvailabilityError_(date, session, "Choose a valid occasion.");
  if (BRIDAL_AVAILABILITY_CONFIG.SESSIONS.indexOf(session) === -1) return bridalAvailabilityError_(date, session, "Choose Morning, Evening or Full Day.");

  const lock = LockService.getScriptLock();
  let locked = false;
  const diagnostics = {
    phase: "lock",
    spreadsheetOpened: false,
    sheetFound: false,
    requiredColumnsAccessible: false
  };
  try {
    lock.waitLock(20000);
    locked = true;
    diagnostics.phase = "spreadsheet_open";
    const spreadsheet = SpreadsheetApp.openById(BRIDAL_AVAILABILITY_CONFIG.SPREADSHEET_ID);
    diagnostics.spreadsheetOpened = true;
    diagnostics.phase = "sheet_lookup";
    const sheet = spreadsheet.getSheetById(BRIDAL_AVAILABILITY_CONFIG.SHEET_ID);
    if (!sheet) throw new Error("Booking tab with gid=" + BRIDAL_AVAILABILITY_CONFIG.SHEET_ID + " not found.");
    diagnostics.sheetFound = true;
    diagnostics.phase = "required_column_access";
    if (sheet.getMaxColumns() < 17) throw new Error("Required bridal availability columns C-D, N, and P-Q are not present.");
    const rowCount = sheet.getLastRow() - 1;
    let booked = false;

    if (rowCount > 0) {
      const dateAndYear = sheet.getRange(2, 3, rowCount, 2).getValues();
      const confirmations = sheet.getRange(2, 14, rowCount, 1).getValues();
      const sessionAndStatus = sheet.getRange(2, 16, rowCount, 2).getValues();
      diagnostics.requiredColumnsAccessible = true;
      const timezone = spreadsheet.getSpreadsheetTimeZone();

      for (let index = 0; index < rowCount; index += 1) {
        const status = String(sessionAndStatus[index][1] || confirmations[index][0] || "").trim().toUpperCase();
        if (bridalSheetDate_(dateAndYear[index][0], dateAndYear[index][1], timezone) !== normalizedDate) continue;
        if (status === "CANCELLED" || status === "CANCELED") continue;

        const bookedSession = String(sessionAndStatus[index][0] || "").trim();
        if (!bookedSession || BRIDAL_AVAILABILITY_CONFIG.SESSIONS.indexOf(bookedSession) === -1) {
          booked = true;
          break;
        }
        if (session !== "Full Day" && bookedSession !== "Full Day" && bookedSession !== session) continue;
        booked = true;
        break;
      }
    } else {
      sheet.getRange(1, 3, 1, 2).getValues();
      sheet.getRange(1, 14, 1, 1).getValues();
      sheet.getRange(1, 16, 1, 2).getValues();
      diagnostics.requiredColumnsAccessible = true;
    }

    return {
      ok: true,
      available: !booked,
      status: booked ? "BOOKED" : "AVAILABLE",
      date: date,
      session: session
    };
  } catch (error) {
    console.error("Bridal availability lookup failed: " + JSON.stringify({
      message: String(error && error.message || error || "Unknown error"),
      stack: String(error && error.stack || "Stack trace unavailable."),
      phase: diagnostics.phase,
      spreadsheetId: BRIDAL_AVAILABILITY_CONFIG.SPREADSHEET_ID,
      sheetName: BRIDAL_AVAILABILITY_CONFIG.SHEET_NAME,
      sheetId: BRIDAL_AVAILABILITY_CONFIG.SHEET_ID,
      spreadsheetOpened: diagnostics.spreadsheetOpened,
      sheetFound: diagnostics.sheetFound,
      requiredColumnsAccessible: diagnostics.requiredColumnsAccessible
    }));
    return bridalAvailabilityError_(date, session, "Unable to check availability right now. Please try again.");
  } finally {
    if (locked) lock.releaseLock();
  }
}

function bridalAvailabilityError_(date, session, message) {
  return { ok: false, available: false, date: date, session: session, status: "ERROR", message: message };
}

function bridalIsIsoDate_(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parts = value.split("-").map(Number);
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return date.getUTCFullYear() === parts[0] && date.getUTCMonth() === parts[1] - 1 && date.getUTCDate() === parts[2];
}

function bridalNormalizeAvailabilityDate_(value) {
  if (bridalIsIsoDate_(value)) return value;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return "";
  const normalized = match[3] + "-" + match[2] + "-" + match[1];
  return bridalIsIsoDate_(normalized) ? normalized : "";
}

function bridalSheetDate_(dateValue, yearValue, timezone) {
  let year;
  let month;
  let day;

  if (Object.prototype.toString.call(dateValue) === "[object Date]" && !isNaN(dateValue.getTime())) {
    const formatted = Utilities.formatDate(dateValue, timezone, "yyyy-MM-dd");
    const parts = formatted.split("-").map(Number);
    year = parts[0]; month = parts[1]; day = parts[2];
  } else {
    const text = String(dateValue == null ? "" : dateValue).trim();
    let match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
    if (match) {
      year = Number(match[1]); month = Number(match[2]); day = Number(match[3]);
    } else {
      match = /^(\d{1,2})[/\.\-](\d{1,2})[/\.\-](\d{4})$/.exec(text);
      if (match) {
        const first = Number(match[1]);
        const second = Number(match[2]);
        month = first > 12 ? second : second > 12 ? first : second;
        day = first > 12 ? first : second > 12 ? second : first;
        year = Number(match[3]);
      } else {
        match = /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/.exec(text);
        if (match) {
          const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
          const monthName = match[1].toLowerCase();
          month = monthNames.findIndex(function(name) { return name === monthName || name.slice(0, 3) === monthName; }) + 1;
          day = Number(match[2]); year = Number(match[3]);
          if (!month) return "";
        } else {
          const parsed = new Date(text);
          if (isNaN(parsed.getTime())) return "";
          year = parsed.getFullYear(); month = parsed.getMonth() + 1; day = parsed.getDate();
        }
      }
    }
  }

  const registerYear = Number(yearValue);
  if (Number.isInteger(registerYear) && registerYear >= 1000 && registerYear <= 9999) year = registerYear;
  const normalized = String(year).padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
  return bridalIsIsoDate_(normalized) ? normalized : "";
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
  const amount = paymentAmountPaise_(requestedAmount, registration.course);

  // Save the registration FIRST. Checkout must never open unless this row
  // has been written to and read back from Google Sheets successfully.
  const saved = appendPendingRegistration_(registration, amount, paymentProof);
  const proofUrl = saved.paymentProofUrl;
  if (proofUrl) registration.paymentScreenshot = proofUrl;
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
function appendPendingRegistration_(registration, amountPaise, paymentProof) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const sheet = getResponseSheet_();
    const details = validateRegistration_(registration);
    // Check and reserve contacts under the same lock, including Pending and
    // older Google Form rows, so simultaneous requests cannot reuse them.
    assertUnusedRegistrationContacts_(sheet, details);
    const proofUrl = paymentProof ? uploadWorkshopProof_(paymentProof) : "";
    if (proofUrl) details.paymentScreenshot = proofUrl;

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

    return { row: targetRow, paymentProofUrl: proofUrl };
  } catch (error) {
    if (error && error.code) throw error;
    console.error("Pending registration save failed: " + String(error.message || error));
    throw backendError_("REGISTRATION_SAVE_FAILED", "Could not save your registration to Google Sheets. Checkout was not opened.");
  } finally {
    lock.releaseLock();
  }
}

function assertUnusedRegistrationContacts_(sheet, registration) {
  const lastRow = sheet.getLastRow();
  if (lastRow < CONFIG.FIRST_DATA_ROW) return;
  const rows = sheet.getRange(CONFIG.FIRST_DATA_ROW, 1, lastRow - CONFIG.FIRST_DATA_ROW + 1, 8).getValues();
  const fields = {};
  rows.forEach(function(row) {
    let phone = String(row[CONFIG.PHONE_COL - 1] || "").replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;
    else if (phone.length === 11 && phone.charAt(0) === "0") phone = "91" + phone.substring(1);
    else if (phone.length === 14 && phone.substring(0, 4) === "0091") phone = phone.substring(2);
    const email = String(row[CONFIG.EMAIL_COL - 1] || "").trim().replace(/^'/, "").toLowerCase();
    if (phone === registration.phone) fields.phone = "WhatsApp number already registered.";
    if (email === registration.email) fields.email = "Email already registered.";
  });
  if (Object.keys(fields).length) throw backendError_("DUPLICATE_REGISTRATION", "This phone number or email address has already been registered.", fields);
}

function verifySignature_(orderId, paymentId, signature) {
  const bytes = Utilities.computeHmacSha256Signature(orderId + "|" + paymentId, razorpayCredentials_().secret, Utilities.Charset.UTF_8);
  const expected = bytes.map(function(byte) { return (byte & 255).toString(16).padStart(2, "0"); }).join("");
  let difference = 0;
  const received = signature.toLowerCase();
  for (let index = 0; index < expected.length; index++) difference |= expected.charCodeAt(index) ^ received.charCodeAt(index);
  if (difference !== 0) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Payment signature could not be verified.");
}

function paymentAmountPaise_(value, course) {
  const suggestedAdvance = COURSE_ADVANCES[course] || CONFIG.PAYMENT_AMOUNT / 100;
  const text = String(value === undefined || value === null || value === "" ? suggestedAdvance : value).trim();
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
  const whatsapp = buildWhatsAppLinks_(registration.phone, buildConfirmationMessage_(registration.name, amountPaise / 100, registration.course)).app;
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

// Bridal advances use the same Razorpay account but a separate worksheet.
// A customer acknowledgement records that availability was discussed; it is
// not an automatic calendar check or a replacement for studio confirmation.
const BRIDAL_HEADERS = ["Created", "Name", "Email", "Phone", "Event Date", "Session", "Advance (INR)", "Payment Status", "Order ID", "Payment ID", "Verified At", "Availability Acknowledged", "Booking Hash", "Request ID"];

function bridalSheet_() {
  const book = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = book.getSheetByName("Bridal Bookings");
  if (!sheet) {
    sheet = book.insertSheet("Bridal Bookings");
    sheet.getRange(1, 1, 1, BRIDAL_HEADERS.length).setValues([BRIDAL_HEADERS]);
    SpreadsheetApp.flush();
  }
  if (JSON.stringify(sheet.getRange(1, 1, 1, BRIDAL_HEADERS.length).getValues()[0]) !== JSON.stringify(BRIDAL_HEADERS)) throw backendError_("BRIDAL_SHEET_CONFLICT", "The Bridal Bookings worksheet needs review by SK Bridal Studio.");
  return sheet;
}

function validateBridalBooking_(raw) {
  raw = raw && typeof raw === "object" ? raw : {};
  const booking = {};
  ["name", "email", "phone", "eventDate", "session"].forEach(function(key) { booking[key] = String(raw[key] || "").trim(); });
  booking.email = booking.email.toLowerCase();
  booking.phone = booking.phone.replace(/\D/g, "");
  if (booking.phone.length === 10) booking.phone = "91" + booking.phone;
  const date = new Date(booking.eventDate + "T12:00:00Z");
  if (!booking.name || booking.name.length > 100 || booking.email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email) || !/^91[6-9][0-9]{9}$/.test(booking.phone) || !/^\d{4}-\d{2}-\d{2}$/.test(booking.eventDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== booking.eventDate || ["Muhurtham", "Reception", "Engagement", "Other bridal session"].indexOf(booking.session) === -1) {
    throw backendError_("VALIDATION_ERROR", "Enter your name, valid email, Indian mobile number, event date and session.");
  }
  return booking;
}

function createBridalOrder_(request) {
  const booking = validateBridalBooking_(request.booking);
  if (request.availabilityConfirmed !== true) throw backendError_("AVAILABILITY_REQUIRED", "Contact SK Bridal Studio and confirm availability before paying.");
  const requestId = String(request.requestId || "");
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(requestId)) throw backendError_("INVALID_REQUEST", "The booking reference is invalid. Refresh and try again.");
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = bridalSheet_();
    const hash = registrationHash_(booking);
    const values = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues() : [];
    let row = 0;
    let existing;
    values.forEach(function(value, index) {
      if (String(value[13]) === requestId || (String(value[3]) === booking.phone && String(value[4]) === booking.eventDate && String(value[5]) === booking.session)) {
        if (row) throw backendError_("BRIDAL_SHEET_CONFLICT", "Multiple bridal bookings match these details. Contact SK Bridal Studio before paying.");
        row = index + 2; existing = value;
      }
    });
    const credentials = razorpayCredentials_();
    if (existing) {
      if (String(existing[12]) !== hash) throw backendError_("BOOKING_EXISTS", "A booking already exists for this phone, date and session. Contact SK Bridal Studio before changing the details.");
      if (String(existing[7]) === "Verified") throw backendError_("BOOKING_ALREADY_PAID", "Your advance is already verified. Contact SK Bridal Studio for your booking confirmation; do not pay again.");
      if (String(existing[7]) !== "Pending" || Number(existing[6]) !== 2000 || String(existing[11]) !== "Yes") throw backendError_("BRIDAL_SHEET_CONFLICT", "Your existing booking needs review. Contact SK Bridal Studio before paying.");
      if (existing[8]) return { ok: true, bookingSaved: true, orderId: String(existing[8]), keyId: credentials.keyId, amount: 200000, currency: "INR" };
    } else {
      row = sheet.getLastRow() + 1;
      sheet.getRange(row, 1, 1, 14).setNumberFormat("@");
      sheet.getRange(row, 1, 1, 14).setValues([[new Date(), cleanValue(booking.name,100), cleanValue(booking.email,150), booking.phone, booking.eventDate, booking.session, 2000, "Pending", "", "", "", "Yes", hash, requestId]]);
      SpreadsheetApp.flush();
      const saved = sheet.getRange(row, 1, 1, 14).getValues()[0];
      if (String(saved[12]) !== hash || String(saved[13]) !== requestId || String(saved[7]) !== "Pending") throw backendError_("REGISTRATION_SAVE_FAILED", "Your bridal booking details could not be confirmed. Checkout was not opened.");
    }
    const order = razorpayRequest_("/orders", "post", { amount: 200000, currency: "INR", receipt: "bridal_" + requestId.slice(0, 28), notes: { type: "bridal_advance", booking_hash: hash, event_date: booking.eventDate, session: booking.session } });
    if (!/^order_[A-Za-z0-9]+$/.test(order.id || "") || order.amount !== 200000 || order.currency !== "INR") throw backendError_("ORDER_FAILED", "The bridal payment order could not be confirmed. Contact SK Bridal Studio before paying.");
    sheet.getRange(row, 9).setValue(order.id);
    SpreadsheetApp.flush();
    if (String(sheet.getRange(row, 9).getValue()) !== order.id) throw backendError_("REGISTRATION_SAVE_FAILED", "The bridal payment reference could not be saved. Checkout was not opened.");
    return { ok: true, bookingSaved: true, orderId: order.id, keyId: credentials.keyId, amount: 200000, currency: "INR" };
  } finally { lock.releaseLock(); }
}

function verifyBridalPayment_(request) {
  const orderId = request.orderId, paymentId = request.paymentId, signature = request.signature;
  if (typeof orderId !== "string" || !/^order_[A-Za-z0-9]+$/.test(orderId) || typeof paymentId !== "string" || !/^pay_[A-Za-z0-9]+$/.test(paymentId) || typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Payment verification details are invalid.");
  verifySignature_(orderId, paymentId, signature);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = bridalSheet_();
    const rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues() : [];
    let row = 0, saved;
    rows.forEach(function(value, index) {
      if (String(value[9]) === paymentId && String(value[8]) !== orderId) throw backendError_("PAYMENT_ALREADY_USED", "This payment is linked to another booking.");
      if (String(value[8]) === orderId) {
        if (row) throw backendError_("BRIDAL_SHEET_CONFLICT", "Multiple bridal bookings match this order.");
        row = index + 2; saved = value;
      }
    });
    if (!row) throw backendError_("ORDER_NOT_FOUND", "No bridal booking matches this payment order.");
    if ((String(saved[7]) !== "Pending" && String(saved[7]) !== "Verified") || (saved[9] && String(saved[9]) !== paymentId) || Number(saved[6]) !== 2000) throw backendError_("BRIDAL_SHEET_CONFLICT", "This booking payment needs studio review. Do not pay again.");
    const booking = validateBridalBooking_({ name: String(saved[1]).replace(/^'/,""), email: String(saved[2]).replace(/^'/,""), phone: saved[3], eventDate: saved[4], session: saved[5] });
    if (registrationHash_(booking) !== String(saved[12]) || String(saved[11]) !== "Yes") throw backendError_("BRIDAL_SHEET_CONFLICT", "The saved bridal booking details changed. Contact SK Bridal Studio.");
    const order = razorpayRequest_("/orders/" + encodeURIComponent(orderId));
    if (order.id !== orderId || order.amount !== 200000 || order.currency !== "INR" || !order.notes || order.notes.type !== "bridal_advance" || order.notes.booking_hash !== String(saved[12])) throw backendError_("PAYMENT_VERIFICATION_FAILED", "The payment order does not match the bridal booking.");
    const path = "/payments/" + encodeURIComponent(paymentId);
    let payment = razorpayRequest_(path);
    if (payment.id !== paymentId || !paymentMatchesOrder_(payment,orderId,200000)) throw backendError_("PAYMENT_VERIFICATION_FAILED", "The payment does not match this booking.");
    if (payment.status === "authorized") {
      try { razorpayRequest_(path + "/capture", "post", { amount: 200000, currency: "INR" }); } catch (_) { console.warn("Checking bridal payment capture status."); }
      payment = razorpayRequest_(path);
    }
    if (payment.id !== paymentId || payment.status !== "captured" || payment.captured !== true || !paymentMatchesOrder_(payment,orderId,200000)) throw backendError_("PAYMENT_NOT_CAPTURED", "Payment is not confirmed yet. If charged, do not pay again; retry verification.");
    try {
      // Sheet rows may be sorted manually while Razorpay requests are in flight.
      const current = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();
      const matches = [];
      current.forEach(function(value, index) { if (String(value[8]) === orderId) matches.push({ row: index + 2, value: value }); });
      if (matches.length !== 1) throw new Error("Booking row changed during verification");
      row = matches[0].row;
      const latest = matches[0].value;
      if ([1,2,3,4,5,6,11,12].some(function(index) { return String(latest[index]) !== String(saved[index]); }) || (latest[9] && String(latest[9]) !== paymentId) || (String(latest[7]) !== "Pending" && String(latest[7]) !== "Verified")) throw new Error("Booking details changed during verification");
      sheet.getRange(row, 8, 1, 4).setValues([["Verified", orderId, paymentId, saved[10] || new Date()]]);
      SpreadsheetApp.flush();
      const confirmed = sheet.getRange(row, 8, 1, 4).getValues()[0];
      if (String(confirmed[0]) !== "Verified" || String(confirmed[1]) !== orderId || String(confirmed[2]) !== paymentId) throw new Error("Read-back failed");
    } catch (_) {
      const error = backendError_("REGISTRATION_SAVE_FAILED", "Your bridal advance was captured but its saved status is not confirmed. Do not pay again. Retry verification or contact SK Bridal Studio.");
      error.verified = true; error.paymentCaptured = true; throw error;
    }
    return { ok: true, verified: true, saved: true, orderId: orderId, paymentId: paymentId, amount: 200000, currency: "INR" };
  } finally { lock.releaseLock(); }
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
    courseFees: COURSE_FEES,
    courseAdvances: COURSE_ADVANCES,
    bridalPayments: true,
    bridalAdvance: 2000,
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
  const course = String(sheet.getRange(row, CONFIG.COURSE_COL).getDisplayValue()).trim();
  const message = buildConfirmationMessage_(name, advance, course);

  const links = buildWhatsAppLinks_(phone, message);
  // Open Web directly on a computer; use App on a phone. Both links carry
  // the same UTF-8 message without passing through the wa.me short link.
  const webLabel = "WhatsApp Web";
  const appLabel = "WhatsApp App";
  const label = webLabel + " | " + appLabel;
  const richText = SpreadsheetApp.newRichTextValue()
    .setText(label)
    .setLinkUrl(0, webLabel.length, links.web)
    .setLinkUrl(webLabel.length + 3, label.length, links.app)
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

function buildWhatsAppLinks_(phone, message) {
  // Encode the complete Unicode string once; never encode individual UTF-16
  // halves of emoji or encode an already encoded message a second time.
  const encoded = encodeURIComponent(message);
  if (decodeURIComponent(encoded) !== message || /%EF%BF%BD/i.test(encoded)) {
    throw new Error("WhatsApp message contains damaged text. Check the saved student details and rebuild the link.");
  }
  const query = "?phone=" + encodeURIComponent(phone) + "&text=" + encoded;
  return {
    web: "https://web.whatsapp.com/send" + query,
    app: "https://api.whatsapp.com/send" + query
  };
}

function buildConfirmationMessage_(name, advance, course) {
  // Build emojis from Unicode code points at runtime to avoid source-file
  // encoding corruption when copied into the Apps Script editor.
  const emoji = function() {
    return Array.prototype.map.call(arguments, function(point) {
      return String.fromCodePoint(point);
    }).join("");
  };

  const studentName = String(name || "Student").trim();
  const selectedCourse = String(course || "").trim();
  const totalFee = COURSE_FEES[selectedCourse];
  // Legacy saved courses may not have a configured total fee.
  const paidValue = Number(advance);
  const paid = Number.isFinite(paidValue) && paidValue >= 0 ? paidValue : 500;
  const remaining = totalFee ? Math.max(0, totalFee - paid) : null;
  const money = function(value) {
    return String.fromCodePoint(0x20B9) + Number(value).toLocaleString("en-IN");
  };

  const party = emoji(0x1F389);
  const heart = emoji(0x1F496);
  const check = emoji(0x2705);
  const makeup = emoji(0x1F484);
  const sparkles = emoji(0x2728);
  const books = emoji(0x1F4DA);
  const calendar = emoji(0x1F4C5);
  const globe = emoji(0x1F310);
  const speaking = emoji(0x1F5E3, 0xFE0F);
  const moneyBag = emoji(0x1F4B0);
  const pin = emoji(0x1F4CC);
  const redHeart = emoji(0x2764, 0xFE0F);

  return [
    party + " REGISTRATION CONFIRMED! " + party,
    "",
    "Hi " + studentName + "! " + heart,
    "",
    "Congratulations! Your advance payment of " + money(paid) + " has been successfully verified. " + check,
    "",
    "Your seat for the following SK BRIDAL STUDIO course is confirmed: " + makeup + sparkles,
    selectedCourse,
    "",
    books + " COURSE DETAILS:",
    "",
    calendar + " Schedule: Details will be shared separately",
    globe + " Mode: Online Live",
    speaking + " Language: Tamil + English",
    "",
    moneyBag + " PAYMENT DETAILS:",
    "",
    "Advance Paid: " + money(paid),
    "Remaining Balance: " + (remaining === null ? "Please contact SK Bridal Studio" : money(remaining)),
    "Please pay the remaining balance as per the payment schedule shared by SK Bridal Studio.",
    "",
    pin + " The session details and joining instructions will be shared with you before the course.",
    "",
    "Thank you for choosing SK Bridal Studio! " + redHeart,
    "",
    "We're excited to be part of your makeup learning journey!",
    "",
    "Warm regards,",
    "SK BRIDAL STUDIO " + heart
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

function testWhatsAppEmojiEncoding() {
  const message = buildConfirmationMessage_("Emoji Test", 500, "2-Day Online Live Demo Workshop");
  const encoded = encodeURIComponent(message);
  const replacementCharacterFound = message.indexOf(String.fromCharCode(0xFFFD)) !== -1;
  const encodedEmojiFound = /%F0%9F/i.test(encoded);
  const courseNameFound = message.indexOf("2-Day Online Live Demo Workshop") !== -1;
  const links = buildWhatsAppLinks_("919876543210", message);
  const linksPreserveMessage = [links.web, links.app].every(function(url) {
    return decodeURIComponent(url.split("&text=")[1]) === message;
  });

  console.log("Generated message: " + message);
  console.log("Encoded WhatsApp text: " + encoded);
  console.log("Replacement character found: " + replacementCharacterFound);
  console.log("Emoji UTF-8 encoding found: " + encodedEmojiFound);

  if (replacementCharacterFound || !encodedEmojiFound || !courseNameFound || !linksPreserveMessage) {
    throw new Error("Emoji generation or URL encoding failed.");
  }

  return {
    ok: true,
    replacementCharacterFound: false,
    encodedEmojiFound: true,
    courseNameFound: courseNameFound,
    linksPreserveMessage: linksPreserveMessage,
    webTestUrl: links.web,
    appTestUrl: links.app
  };
}


function testWhatsAppEmojiLink() { return testWhatsAppEmojiEncoding(); }

// Server-only Razorpay Payment Links. Included here so a single-file deployment is complete.
// Credentials stay in Script Properties; this action never sends notifications.
function bridalPaymentLinkStatus_() {
  const properties = PropertiesService.getScriptProperties();
  const key = properties.getProperty("RAZORPAY_KEY_ID") || "";
  return { ok: true, api: "bridal-payment-links-v1", checkoutProfile: "standard-checkout-v1", ready: Boolean(key && properties.getProperty("RAZORPAY_KEY_SECRET")), mode: key.indexOf("rzp_live_") === 0 ? "live" : key.indexOf("rzp_test_") === 0 ? "test" : "unconfigured" };
}

// Multi-day advances use the same Standard Checkout SDK as workshop payments.
function createBridalCheckout_(request) {
  if (request.availabilityConfirmed !== true || request.detailsSent !== true) throw backendError_("AVAILABILITY_REQUIRED", "Confirm availability and send your booking details before paying.");
  const booking = validateBridalLinkBooking_(request.booking);
  const amount = ({ 1: 200000, 2: 300000, 3: 400000 })[booking.days.length];
  const hash = registrationHash_(booking), receipt = "brdc_" + hash.slice(0, 32);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    // Do not create a second payable route for a booking with a hosted link.
    const legacy = razorpayRequest_("/payment_links?reference_id=" + encodeURIComponent("brd_" + hash.slice(0, 32)), "get");
    if (!Array.isArray(legacy.payment_links)) throw backendError_("PAYMENT_LINK_INVALID", "Existing booking payment status could not be checked. Please retry.");
    legacy.payment_links.filter(function(link) { return link.reference_id === "brd_" + hash.slice(0, 32); }).forEach(function(link) {
      if (link.status === "paid" || Number(link.amount_paid) > 0) throw backendError_("BOOKING_ALREADY_PAID", "A payment is already recorded for this booking. Contact SK Bridal Studio with your receipt; do not pay again.");
      if (link.status !== "cancelled" && link.status !== "expired") throw backendError_("EXISTING_PAYMENT_LINK", "This booking already has a payment link. Contact SK Bridal Studio to review that link before switching to checkout; do not pay twice.");
    });
    const findOrder = function() {
      const result = razorpayRequest_("/orders?receipt=" + encodeURIComponent(receipt), "get");
      if (!Array.isArray(result.items)) throw backendError_("ORDER_FAILED", "Existing payment order could not be checked. Please retry.");
      const matches = result.items.filter(function(order) { return order.receipt === receipt; });
      if (matches.length > 1) throw backendError_("ORDER_CONFLICT", "Multiple payment orders match this booking. Contact SK Bridal Studio before paying.");
      return matches[0] || null;
    };
    let order = findOrder();
    if (!order) {
      try {
        order = razorpayRequest_("/orders", "post", { amount: amount, currency: "INR", receipt: receipt, partial_payment: false, notes: { type: "bridal_checkout", booking_hash: hash, days: String(booking.days.length), event_dates: booking.days.map(function(day) { return day.eventDate; }).join(", "), sessions: booking.days.map(function(day) { return day.session; }).join(", ") } });
      } catch (error) {
        order = findOrder();
        if (!order) throw error;
      }
    }
    if (order.status === "paid" || Number(order.amount_paid) > 0) throw backendError_("BOOKING_ALREADY_PAID", "A payment is already recorded for this booking. Do not pay again; contact SK Bridal Studio with your receipt.");
    if (!/^order_[A-Za-z0-9]+$/.test(order.id || "") || order.receipt !== receipt || order.amount !== amount || order.currency !== "INR" || ["created", "attempted"].indexOf(order.status) === -1 || !order.notes || order.notes.type !== "bridal_checkout" || order.notes.booking_hash !== hash || Number(order.notes.days) !== booking.days.length) throw backendError_("ORDER_FAILED", "The bridal payment order could not be confirmed. Contact SK Bridal Studio before paying.");
    return { ok: true, orderId: order.id, keyId: razorpayCredentials_().keyId, amount: amount, currency: "INR" };
  } finally { lock.releaseLock(); }
}

function verifyBridalCheckout_(request) {
  const orderId = request.orderId, paymentId = request.paymentId, signature = request.signature;
  if (typeof orderId !== "string" || !/^order_[A-Za-z0-9]+$/.test(orderId) || typeof paymentId !== "string" || !/^pay_[A-Za-z0-9]+$/.test(paymentId) || typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)) throw backendError_("PAYMENT_VERIFICATION_FAILED", "Invalid payment verification details.");
  verifySignature_(orderId, paymentId, signature);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const order = razorpayRequest_("/orders/" + encodeURIComponent(orderId));
    const notes = order.notes || {}, amount = ({ 1: 200000, 2: 300000, 3: 400000 })[notes.days];
    if (order.id !== orderId || notes.type !== "bridal_checkout" || !/^[a-f0-9]{64}$/.test(notes.booking_hash || "") || order.receipt !== "brdc_" + notes.booking_hash.slice(0, 32) || !amount || order.amount !== amount || order.currency !== "INR") throw backendError_("PAYMENT_VERIFICATION_FAILED", "The order does not match a bridal booking advance.");
    const path = "/payments/" + encodeURIComponent(paymentId);
    let payment = razorpayRequest_(path);
    if (payment.id !== paymentId || !paymentMatchesOrder_(payment, orderId, amount)) throw backendError_("PAYMENT_VERIFICATION_FAILED", "The payment does not match this booking.");
    if (payment.status === "authorized") {
      try { razorpayRequest_(path + "/capture", "post", { amount: amount, currency: "INR" }); } catch (_) { console.warn("Checking bridal checkout capture status."); }
      payment = razorpayRequest_(path);
    }
    if (payment.id !== paymentId || !paymentMatchesOrder_(payment, orderId, amount) || payment.status !== "captured" || payment.captured !== true) throw backendError_("PAYMENT_NOT_CAPTURED", "Payment is not confirmed yet. If charged, do not pay again; retry verification.");
    return { ok: true, verified: true, orderId: orderId, paymentId: paymentId, amount: amount, currency: "INR" };
  } finally { lock.releaseLock(); }
}

function validateBridalLinkBooking_(raw) {
  raw = raw && typeof raw === "object" ? raw : {};
  const booking = { name: String(raw.name || "").trim(), email: String(raw.email || "").trim().toLowerCase(), phone: String(raw.phone || "").replace(/\D/g, ""), venue: String(raw.venue || "").trim(), days: [] };
  if (/^[6-9][0-9]{9}$/.test(booking.phone)) booking.phone = "91" + booking.phone;
  if (!booking.name || booking.name.length > 100 || booking.email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email) || !/^91[6-9][0-9]{9}$/.test(booking.phone) || booking.venue.length > 200 || !Array.isArray(raw.days) || raw.days.length < 1 || raw.days.length > 3) throw backendError_("VALIDATION_ERROR", "Check your booking contact details and choose 1, 2 or 3 days.");
  const sessions = ["Muhurtham", "Reception", "Engagement", "Baby Shower", "Puberty Ceremony", "Commercial Shoot", "Other bridal session"];
  const dates = {};
  raw.days.forEach(function(entry) {
    const day = { eventDate: String(entry && entry.eventDate || "").trim(), session: String(entry && entry.session || "").trim() };
    if (!bridalIsIsoDate_(day.eventDate) || dates[day.eventDate] || sessions.indexOf(day.session) === -1) throw backendError_("VALIDATION_ERROR", "Choose a different valid date and session for each booking day.");
    dates[day.eventDate] = true;
    booking.days.push(day);
  });
  return booking;
}

function createBridalPaymentLink_(request) {
  if (request.availabilityConfirmed !== true || request.detailsSent !== true) throw backendError_("AVAILABILITY_REQUIRED", "Confirm availability with SK Bridal Studio and send your booking details before paying.");
  const booking = validateBridalLinkBooking_(request.booking);
  // Calculate paise on the server. Ignore any client-supplied amount.
  const amount = ({ 1: 200000, 2: 300000, 3: 400000 })[booking.days.length];
  const hash = registrationHash_(booking);
  const reference = "brd_" + hash.slice(0, 32);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const findExisting = function() {
      const response = razorpayRequest_("/payment_links?reference_id=" + encodeURIComponent(reference), "get");
      if (!Array.isArray(response.payment_links)) throw backendError_("PAYMENT_LINK_INVALID", "The payment provider did not confirm your booking reference. Please retry.");
      const matches = response.payment_links.filter(function(link) { return link.reference_id === reference; });
      if (matches.length > 1) throw backendError_("PAYMENT_LINK_CONFLICT", "Multiple payment links match this booking. Contact SK Bridal Studio before paying.");
      return matches[0] || null;
    };
    let link = findExisting();
    if (!link) {
      const payload = {
        amount: amount, currency: "INR", accept_partial: false, reference_id: reference,
        description: "SK Bridal Studio booking advance - " + booking.days.length + " day(s)",
        customer: { name: booking.name, email: booking.email, contact: "+" + booking.phone },
        // Customer metadata alone does not configure Checkout's contact form.
        // Reuse the validated booking details and leave payment-method selection open.
        options: {
          checkout: {
            prefill: { name: booking.name, email: booking.email, contact: "+" + booking.phone },
            readonly: { email: true, contact: true },
            hidden: { email: true, contact: true }
          }
        },
        notify: { sms: false, email: false }, reminder_enable: false,
        notes: { type: "bridal_advance", booking_hash: hash, days: String(booking.days.length), event_dates: booking.days.map(function(day) { return day.eventDate; }).join(", "), sessions: booking.days.map(function(day) { return day.session; }).join(", "), venue: booking.venue }
      };
      try { link = razorpayRequest_("/payment_links", "post", payload); }
      catch (error) {
        // Recover a created link after a lost response, without issuing another link.
        link = findExisting();
        if (!link) throw error;
      }
    }
    if (link.status === "paid" || Number(link.amount_paid) > 0) throw backendError_("BOOKING_ALREADY_PAID", "A payment is already recorded for this booking. Contact SK Bridal Studio with your receipt; do not pay again.");
    if (link.status === "cancelled" || link.status === "expired" || (link.expire_by && Number(link.expire_by) <= Math.floor(Date.now() / 1000))) throw backendError_("PAYMENT_LINK_EXPIRED", "This payment link is no longer active. Contact SK Bridal Studio for a new link.");
    const url = String(link.short_url || "");
    if (!/^plink_[A-Za-z0-9]+$/.test(link.id || "") || link.reference_id !== reference || !link.notes || link.notes.booking_hash !== hash || link.amount !== amount || link.currency !== "INR" || link.accept_partial !== false || link.amount_paid !== 0 || link.status !== "created" || !/^https:\/\/(?:rzp\.io|rzp\.pay)\/[A-Za-z0-9/_-]+$/.test(url)) throw backendError_("PAYMENT_LINK_INVALID", "The fixed payment amount could not be confirmed. Contact SK Bridal Studio before paying.");
    return { ok: true, paymentLinkId: link.id, url: url, amount: amount, currency: "INR", status: "created", amountPreset: true };
  } finally { lock.releaseLock(); }
}
