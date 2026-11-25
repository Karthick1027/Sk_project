// Server-only Razorpay Payment Links. Load alongside WorkshopRegistrations.gs.
// Credentials stay in Script Properties; this action never sends notifications.
function bridalPaymentLinkStatus_() {
  const properties = PropertiesService.getScriptProperties();
  const key = properties.getProperty("RAZORPAY_KEY_ID") || "";
  return { ok: true, api: "bridal-payment-links-v1", ready: Boolean(key && properties.getProperty("RAZORPAY_KEY_SECRET")), mode: key.indexOf("rzp_live_") === 0 ? "live" : key.indexOf("rzp_test_") === 0 ? "test" : "unconfigured" };
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
