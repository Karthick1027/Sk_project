
// =====================================================
// SK BRIDAL STUDIO - WORKSHOP REGISTRATION SYSTEM
// Google Sheets + WhatsApp Payment Confirmation
// =====================================================

const CONFIG = {
  SPREADSHEET_ID: "1TdrQD7sq_uRgLkPoKwubH23QJY-reCejaNTVgvr3ows",
  SHEET_NAME: "Form Responses 1",
  FIRST_DATA_ROW: 2,

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

function getResponseSheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }

  // Initialize or refresh header labels only.
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setValues([HEADERS]);

  return sheet;
}

function savePaymentProof_(proof) {
  if (!proof) return '';

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (
    allowedTypes.indexOf(proof.mimeType) === -1 ||
    typeof proof.dataBase64 !== "string" ||
    proof.dataBase64.length > 5600000
  ) {
    throw new Error("Payment proof file is invalid or too large.");
  }

  const safeName = String(proof.name || "payment-proof")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .substring(0, 100);
  const bytes = Utilities.base64Decode(proof.dataBase64);
  const blob = Utilities.newBlob(bytes, proof.mimeType, safeName);
  return DriveApp.createFile(blob).getUrl();
}


// =====================================================
// 2. WEBSITE REGISTRATION API
// =====================================================

function doPost(event) {
  const lock = LockService.getScriptLock();

  try {
    if (!event || !event.postData || !event.postData.contents) {
      throw new Error("Registration data is missing.");
    }

    const registration = JSON.parse(event.postData.contents);
    const expectedToken = PropertiesService.getScriptProperties()
      .getProperty("WORKSHOP_API_TOKEN");

    if (!expectedToken || registration.apiToken !== expectedToken) {
      throw new Error("Registration request is not authorized.");
    }

    const name = cleanValue(registration.name, 100);
    const email = cleanValue(registration.email, 150);
    const phone = cleanValue(registration.phone, 30);
    const course = cleanValue(registration.course, 100);
    const gender = cleanValue(registration.gender, 100);
    const mainGoal = cleanValue(registration.mainGoal, 1000);
    const experience = cleanValue(registration.experience, 500);
    const paymentId = cleanValue(registration.paymentId, 100);
    const orderId = cleanValue(registration.orderId, 100);
    const advance = Number(registration.advance);

    if (
      !name ||
      !/^[0-9]{10,15}$/.test(phone) ||
      !course ||
      !gender ||
      !mainGoal ||
      !experience ||
      !paymentId ||
      !orderId ||
      advance !== 500 ||
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      throw new Error(
        "Required registration details are missing or invalid."
      );
    }

    lock.waitLock(20000);

    const sheet = getResponseSheet_();
    const lastRow = sheet.getLastRow();

    if (lastRow >= CONFIG.FIRST_DATA_ROW) {
      const existingPayments = sheet.getRange(
        CONFIG.FIRST_DATA_ROW,
        CONFIG.PAYMENT_ID_COL,
        lastRow - CONFIG.FIRST_DATA_ROW + 1,
        2
      ).getDisplayValues();

      if (existingPayments.some(function(row) {
        return row[0] === paymentId || row[1] === orderId;
      })) {
        return jsonResponse({ ok: true, duplicate: true });
      }
    }

    const paymentProofUrl = savePaymentProof_(registration.paymentProof);

    sheet.appendRow([
      new Date(),
      name,
      phone,
      gender,
      mainGoal,
      cleanValue(registration.question, 1000),
      experience,
      email,
      cleanValue(registration.city, 100),
      "",
      paymentProofUrl || cleanValue(registration.paymentScreenshot, 500),
      "Verified",
      "Not Sent",
      "",
      course,
      paymentId,
      orderId,
      advance
    ]);

    createWhatsAppLink_(sheet, sheet.getLastRow());

    SpreadsheetApp.flush();

    return jsonResponse({
      ok: true,
      message: "Registration submitted successfully."
    });

  } catch (error) {

    return jsonResponse({
      ok: false,
      error: String(error.message || error)
    });

  } finally {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
}


// =====================================================
// 3. GET API STATUS
// =====================================================

function doGet() {
  return jsonResponse({
    ok: true,
    message: "SK Bridal Studio registration API is running."
  });
}


// =====================================================
// 4. CLEAN INPUT VALUES
// =====================================================

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

  const message = buildConfirmationMessage_(name);

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

function buildConfirmationMessage_(name) {

  return [
    "Hi " + name + "! 💖",
    "",
    "Congratulations! 🎉",
    "",
    "Your advance payment of INR 500 has been successfully verified.",
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
