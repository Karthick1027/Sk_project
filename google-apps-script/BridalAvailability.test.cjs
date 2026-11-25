const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

const spreadsheetId = '1m5sE85VjltmUIaVyYMleLZ8Ai1UeFD3Gr4zZ33G0fwA';

function backend(rows = [], options = {}) {
  const reads = [];
  const sheetIds = [];
  const logs = [];
  const lockStats = { acquired: 0, released: 0 };
  const sheet = {
    getName: () => options.sheetName || 'Customer Booking Details',
    getLastRow: () => rows.length + 1,
    getMaxColumns: () => options.maxColumns === undefined ? 17 : options.maxColumns,
    getRange(row, column, count, width) {
      reads.push({ row, column, count, width });
      if (options.rangeError) throw new Error(options.rangeError);
      return { getValues: () => rows.slice(row - 2, row - 2 + count).map(values => values.slice(column - 1, column - 1 + width)) };
    },
  };
  const context = {
    console: { error: message => logs.push(String(message)), log() {}, warn() {} },
    LockService: { getScriptLock: () => ({ waitLock: () => { lockStats.acquired += 1; }, releaseLock: () => { lockStats.released += 1; } }) },
    ContentService: {
      MimeType: { JSON: 'application/json', JAVASCRIPT: 'application/javascript' },
      createTextOutput: content => ({ content, mimeType: '', setMimeType(mimeType) { this.mimeType = mimeType; return this; } }),
    },
    SpreadsheetApp: {
      openById(id) {
        assert.equal(id, spreadsheetId);
        if (options.openError) throw new Error(options.openError);
        return {
          getSheetById: id => { sheetIds.push(id); assert.equal(id, 0); return options.sheetMissing ? null : sheet; },
          getSheetByName: name => options.sheetMissing || name !== 'Customer Booking Details' ? null : sheet,
          getSpreadsheetTimeZone: () => 'Asia/Kolkata',
        };
      },
    },
    Utilities: { formatDate: date => date.toISOString().slice(0, 10) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => '' }) },
  };
  vm.createContext(context);
  vm.runInContext(readFileSync(__dirname + '/WorkshopRegistrations.gs', 'utf8'), context);
  return { context, reads, sheetIds, logs, lockStats, post: parameters => context.doPost({ postData: { contents: JSON.stringify(parameters) } }) };
}

function booking({ date = '2027-01-20', year = 2027, confirmation = 'CONFIRMED', session = 'Morning', status = '' } = {}) {
  return [null, null, date, year, null, 'Muhurtham', null, null, null, null, null, null, null, confirmation, null, session, status];
}

const request = (date = '2027-01-20', session = 'Morning', occasion = 'Muhurtham') => ({ action: 'check_bridal_availability', date, occasion, session });

test('confirmed booking matches date objects and month-name text without returning customer fields', () => {
  for (const date of [new Date('2027-01-20T00:00:00Z'), 'Jan 20, 2027']) {
    const api = backend([booking({ date })]);
    const result = api.post(request());
    const body = JSON.parse(result.content);
    assert.equal(body.ok, true);
    assert.equal(body.available, false);
    assert.equal(body.status, 'BOOKED');
    assert.deepEqual(api.reads.map(read => read.column), [3, 14, 16]);
    assert.equal(JSON.stringify(body).includes('Name'), false);
    assert.deepEqual(api.lockStats, { acquired: 1, released: 1 });
  }
});

test('availability accepts the displayed DD/MM/YYYY date format', () => {
  const api = backend([booking({ date: '2026-12-18', year: 2026 })]);
  const result = JSON.parse(api.post(request('18/12/2026')).content);
  assert.equal(result.ok, true);
  assert.equal(result.available, false);
  assert.equal(result.date, '18/12/2026');
  assert.deepEqual(api.reads.map(read => read.column), [3, 14, 16]);
});

test('morning and evening are independent and both can be booked separately', () => {
  const morning = backend([booking({ session: 'Morning' })]);
  assert.equal(JSON.parse(morning.post(request('2027-01-20', 'Morning')).content).status, 'BOOKED');
  assert.equal(JSON.parse(morning.post(request('2027-01-20', 'Evening')).content).status, 'AVAILABLE');
  const evening = backend([booking({ session: 'Evening' })]);
  assert.equal(JSON.parse(evening.post(request('2027-01-20', 'Evening')).content).status, 'BOOKED');
  assert.equal(JSON.parse(evening.post(request('2027-01-20', 'Morning')).content).status, 'AVAILABLE');
  const both = backend([booking({ session: 'Morning' }), booking({ session: 'Evening', confirmation: '', status: 'PENDING' })]);
  assert.equal(JSON.parse(both.post(request('2027-01-20', 'Morning')).content).status, 'BOOKED');
  assert.equal(JSON.parse(both.post(request('2027-01-20', 'Evening', 'Reception')).content).status, 'BOOKED');
});

test('cancelled bookings are free and missing session conservatively blocks both slots', () => {
  const cancelled = backend([booking({ confirmation: '', status: 'CANCELLED' })]);
  assert.equal(JSON.parse(cancelled.post(request('2027-01-20', 'Morning')).content).status, 'AVAILABLE');
  const missingSession = backend([booking({ session: '', confirmation: '', status: '' })]);
  assert.equal(JSON.parse(missingSession.post(request('2027-01-20', 'Morning')).content).status, 'BOOKED');
  assert.equal(JSON.parse(missingSession.post(request('2027-01-20', 'Evening')).content).status, 'BOOKED');
});

test('completed bookings remain unavailable for their recorded session', () => {
  const api = backend([booking({ confirmation: '', status: 'COMPLETED', session: 'Evening' })]);
  assert.equal(JSON.parse(api.post(request('2027-01-20', 'Evening')).content).status, 'BOOKED');
  assert.equal(JSON.parse(api.post(request('2027-01-20', 'Morning')).content).status, 'AVAILABLE');
  const unknownStatus = backend([booking({ confirmation: '', status: '', session: 'Evening' })]);
  assert.equal(JSON.parse(unknownStatus.post(request('2027-01-20', 'Evening')).content).status, 'BOOKED');
});

test('invalid inputs return safe errors and the existing GET health route remains intact', () => {
  const api = backend();
  for (const parameters of [
    request('2027-02-30'), request('2027-01-20', 'Dawn'), request('2027-01-20', 'Morning', 'Other'),
  ]) assert.equal(JSON.parse(api.post(parameters).content).status, 'ERROR');

  const health = JSON.parse(api.context.doGet().content);
  assert.equal(health.backend, 'google-apps-script');
  assert.equal(health.sheet, 'Form Responses 1');
});

test('spreadsheet failures log diagnostic phase and access flags without customer data', () => {
  const cases = [
    { options: { openError: 'Spreadsheet permission denied.' }, phase: 'spreadsheet_open', spreadsheetOpened: false, sheetFound: false, requiredColumnsAccessible: false },
    { options: { sheetMissing: true }, phase: 'sheet_lookup', spreadsheetOpened: true, sheetFound: false, requiredColumnsAccessible: false },
    { options: { rangeError: 'Column range unavailable.' }, phase: 'required_column_access', spreadsheetOpened: true, sheetFound: true, requiredColumnsAccessible: false },
    { options: { maxColumns: 16 }, phase: 'required_column_access', spreadsheetOpened: true, sheetFound: true, requiredColumnsAccessible: false },
  ];

  for (const entry of cases) {
    const api = backend([booking()], entry.options);
    const result = JSON.parse(api.post(request()).content);
    assert.equal(result.status, 'ERROR');
    assert.equal(result.message, 'Unable to check availability right now. Please try again.');
    assert.equal(api.logs.length, 1);
    const diagnostic = JSON.parse(api.logs[0].slice(api.logs[0].indexOf('{')));
    assert.equal(diagnostic.phase, entry.phase);
    assert.equal(diagnostic.spreadsheetId, spreadsheetId);
    assert.equal(diagnostic.sheetName, 'Customer Booking Details');
    assert.equal(diagnostic.spreadsheetOpened, entry.spreadsheetOpened);
    assert.equal(diagnostic.sheetFound, entry.sheetFound);
    assert.equal(diagnostic.requiredColumnsAccessible, entry.requiredColumnsAccessible);
    assert.match(diagnostic.message, /.+/);
    assert.match(diagnostic.stack, /Error/);
    assert.equal(api.logs[0].includes('Bride'), false);
    assert.equal(api.logs[0].includes('9876543210'), false);
    assert.equal(api.logs[0].includes('2027-01-20'), false);
  }
});

test('editor diagnostic exposes the exact read failure without requiring Cloud logs', () => {
  const cases = [
    { options: { openError: 'Spreadsheet permission denied.' }, phase: 'spreadsheet_open', message: 'Spreadsheet permission denied.' },
    { options: { sheetMissing: true }, phase: 'sheet_lookup', message: 'Booking tab not found' },
    { options: { maxColumns: 16 }, phase: 'required_column_access', message: 'at least 17' },
    { options: { rangeError: 'Column range unavailable.' }, phase: 'date_columns_C_D', message: 'Column range unavailable.' },
  ];
  for (const entry of cases) {
    const api = backend([booking()], entry.options);
    vm.runInContext(readFileSync(__dirname + '/BridalAvailabilityDiagnostics.gs', 'utf8'), api.context);
    assert.throws(() => api.context.testBridalAvailabilityConnection(), error => {
      assert.ok(error.message.includes('phase=' + entry.phase));
      assert.ok(error.message.includes(entry.message));
      return true;
    });
  }
});

test('editor diagnostic can complete a read-only booking lookup without returning customer data', () => {
  const api = backend([booking()]);
  vm.runInContext(readFileSync(__dirname + '/BridalAvailabilityDiagnostics.gs', 'utf8'), api.context);
  const result = api.context.testBridalAvailabilityConnection();
  assert.equal(result.ok, true);
  assert.equal(result.bookingRows, 1);
  assert.equal(result.columns, 17);
  assert.equal(result.sheetName, 'Customer Booking Details');
  assert.equal(result.status, 'AVAILABLE');
  assert.deepEqual(Object.keys(result).sort(), ['ok', 'sheetName', 'sheetId', 'columns', 'bookingRows', 'timezone', 'status'].sort());
});


test('booking tab is selected by confirmed gid even when renamed or padded with spaces', () => {
  for (const sheetName of ['Customer Booking Details ', 'Customer Booking Details\u00a0', 'Bookings 2026']) {
    const api = backend([booking()], { sheetName });
    const result = JSON.parse(api.post(request()).content);
    assert.equal(result.ok, true);
    assert.equal(result.status, 'BOOKED');
    assert.deepEqual(api.sheetIds, [0]);
    vm.runInContext(readFileSync(__dirname + '/BridalAvailabilityDiagnostics.gs', 'utf8'), api.context);
    const diagnostic = api.context.testBridalAvailabilityConnection();
    assert.equal(diagnostic.sheetName, sheetName);
    assert.equal(diagnostic.sheetId, 0);
  }
});

test('missing configured gid returns an error rather than checking a different or empty tab', () => {
  const api = backend([], { sheetMissing: true });
  const result = JSON.parse(api.post(request()).content);
  assert.equal(result.ok, false);
  assert.equal(result.status, 'ERROR');
  assert.deepEqual(api.sheetIds, [0]);
});


test('Full Day bookings block both sessions and full-day inquiries', () => {
  for (const status of ['CONFIRMED', 'PENDING', 'COMPLETED']) {
    const api = backend([booking({ session: 'Full Day', confirmation: '', status })]);
    for (const session of ['Morning', 'Evening', 'Full Day']) {
      assert.equal(JSON.parse(api.post(request('2027-01-20', session, 'Reception')).content).status, 'BOOKED');
    }
  }
});

test('Full Day requests are booked when either slot is occupied', () => {
  for (const bookedSession of ['Morning', 'Evening']) {
    const api = backend([booking({ session: bookedSession })]);
    assert.equal(JSON.parse(api.post(request('2027-01-20', 'Full Day')).content).status, 'BOOKED');
  }
});

test('cancelled full-day bookings release both sessions and an empty date is available all day', () => {
  for (const status of ['CANCELLED', 'CANCELED']) {
    const api = backend([booking({ session: 'Full Day', confirmation: '', status })]);
    for (const session of ['Morning', 'Evening', 'Full Day']) assert.equal(JSON.parse(api.post(request('2027-01-20', session)).content).status, 'AVAILABLE');
  }
  assert.equal(JSON.parse(backend().post(request('2027-01-20', 'Full Day')).content).status, 'AVAILABLE');
});
