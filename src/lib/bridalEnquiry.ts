export const BRIDAL_PAYMENT_URL = 'https://razorpay.me/@skbridalstudio';
export const BRIDAL_WHATSAPP_NUMBER = '918668038093';
export const BRIDAL_ENQUIRY_SESSIONS = ['Muhurtham', 'Reception', 'Engagement', 'Baby Shower', 'Puberty Ceremony', 'Commercial Shoot', 'Other bridal session'];
export interface BridalDay { eventDate: string; session: string }
export interface BridalEnquiry { name: string; email: string; phone: string; days: BridalDay[]; venue: string }
export const BRIDAL_DAY_ADVANCES: Record<number, number> = { 1: 2000, 2: 3000, 3: 4000 };
export const bridalAdvanceTotal = (details: BridalEnquiry) => BRIDAL_DAY_ADVANCES[details.days.length] || 0;
export function bridalPaymentDestination(details: BridalEnquiry): { url: string; amountPreset: boolean } {
  const total = bridalAdvanceTotal(details);
  if (![2000, 3000, 4000].includes(total)) throw new Error('Choose 1, 2 or 3 booking days.');
  return { url: BRIDAL_PAYMENT_URL, amountPreset: false };
}
export const bridalDayField = (index: number, field: keyof BridalDay) => index === 0 ? field : `${field}-${index + 1}`;

export function validateBridalEnquiry(details: BridalEnquiry): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!details.name.trim() || details.name.trim().length > 100) errors.name = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim()) || details.email.trim().length > 150) errors.email = 'Enter a valid email.';
  if (!/^[6-9][0-9]{9}$/.test(details.phone)) errors.phone = 'Enter a valid 10-digit mobile number.';
  if (!Array.isArray(details.days) || details.days.length < 1 || details.days.length > 3) errors.days = 'Choose 1, 2 or 3 days.';
  const dates = new Set<string>();
  (details.days || []).forEach((day, index) => {
    const date = new Date(day.eventDate + 'T12:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day.eventDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== day.eventDate) errors[bridalDayField(index, 'eventDate')] = 'Choose your event date.';
    else if (dates.has(day.eventDate)) errors[bridalDayField(index, 'eventDate')] = 'Choose a different date for this day.';
    dates.add(day.eventDate);
    if (!BRIDAL_ENQUIRY_SESSIONS.includes(day.session)) errors[bridalDayField(index, 'session')] = 'Choose a session.';
  });
  if (details.venue.trim().length > 200) errors.venue = 'Use 200 characters or fewer.';
  return errors;
}

export function buildBridalEnquiryUrl(details: BridalEnquiry): string {
  if (Object.keys(validateBridalEnquiry(details)).length) throw new Error('Please check your booking details.');
  const schedule = details.days.flatMap((entry, index) => {
    const [year, month, day] = entry.eventDate.split('-');
    return [...(index > 0 ? [''] : []), `*Day ${index + 1}* : ${day}/${month}/${year}`, `*Session* : ${entry.session}`];
  });
  const message = [
    '*BRIDAL MAKEUP ADVANCE BOOKING:*', '',
    `*Name* : ${details.name.trim()}`,
    `*Email* : ${details.email.trim().toLowerCase()}`,
    `*WhatsApp* : +91 ${details.phone}`,
    `*Number of days* : ${details.days.length}`, '',
    ...schedule, '',
    `*Venue / City* : ${details.venue.trim() || 'To be shared'}`, '',
    'I have confirmed date and session availability with SK Bridal Studio.',
    `*Total advance* : INR ${bridalAdvanceTotal(details).toLocaleString('en-IN')}`, '',
    `I will pay ${bridalAdvanceTotal(details)} on your Razorpay page and share the payment receipt for booking confirmation.`,
  ].join('\n');
  return `https://wa.me/${BRIDAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
