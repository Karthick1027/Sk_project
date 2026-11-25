// Add this as a separate script file in the SAME Apps Script project.
// Run testBridalAvailabilityConnection from the editor; no deployment is needed.
// Read-only: no spreadsheet updates, triggers, messages, or payment requests.
function testBridalAvailabilityConnection() {
  let phase = "configuration";
  try {
    const config = BRIDAL_AVAILABILITY_CONFIG;
    phase = "spreadsheet_open";
    const spreadsheet = SpreadsheetApp.openById(config.SPREADSHEET_ID);
    phase = "sheet_lookup";
    const sheet = spreadsheet.getSheetById(config.SHEET_ID);
    if (!sheet) throw new Error("Booking tab not found: gid=" + config.SHEET_ID + ".");

    phase = "required_column_access";
    const columns = sheet.getMaxColumns();
    if (columns < 17) throw new Error("Booking tab has " + columns + " columns; availability requires at least 17 (through Q).");
    const rows = Math.max(0, sheet.getLastRow() - 1);
    const firstRow = rows > 0 ? 2 : 1;
    const count = Math.max(1, rows);
    phase = "date_columns_C_D";
    const dates = sheet.getRange(firstRow, 3, count, 2).getValues();
    phase = "confirmation_column_N";
    sheet.getRange(firstRow, 14, count, 1).getValues();
    phase = "session_status_columns_P_Q";
    sheet.getRange(firstRow, 16, count, 2).getValues();
    phase = "spreadsheet_timezone";
    const timezone = spreadsheet.getSpreadsheetTimeZone();
    phase = "booking_date_parsing";
    for (let index = 0; index < rows; index += 1) {
      bridalSheetDate_(dates[index][0], dates[index][1], timezone);
    }

    phase = "availability_lookup";
    const result = checkBridalAvailability_({ date: "2026-12-10", occasion: "Muhurtham", session: "Morning" });
    if (!result || result.ok !== true) throw new Error(result && result.message || "Availability handler returned an error.");
    const summary = { ok: true, sheetName: sheet.getName(), sheetId: config.SHEET_ID, columns: columns, bookingRows: rows, timezone: timezone, status: result.status };
    console.log("Bridal availability diagnostic passed: " + JSON.stringify(summary));
    return summary;
  } catch (error) {
    // Throw so the editor displays the failure even when Cloud logs are absent.
    throw new Error("BRIDAL_AVAILABILITY_DIAGNOSTIC | phase=" + phase + " | " + String(error && error.message || error));
  }
}
