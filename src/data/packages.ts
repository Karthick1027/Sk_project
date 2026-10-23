export interface BridalPackage {
  id: number;
  finish: string;
  /** Second line of the title, shown in italics. */
  finishAccent: string;
  price: number;
  description: string;
  /** The featured package gets the "Signature" badge and is the dark card when none is hovered. */
  featured?: boolean;
  includes: string[];
  /** Complimentary when both Muhurtham & Reception are booked. */
  comboPerks: string[];
}

const sharedIncludes = [
  'Traditional / Advanced Hairstyle',
  'Saree Drape × 1',
  'Coloured Contact Lens',
  'Natural Human Hair Lashes',
  'Hair Extensions',
  'Javuri & Kunjalam (if required)',
  'Hair Accessories — U-pins, hair pins, safety pins & rubber bands',
  'Travel Within Chennai',
];

const perks = {
  travel: 'Complimentary travel within Tamil Nadu',
  groom: '1 Session groom makeup',
  jewellery: '1 Session rental full bridal jewellery set',
  touchUp: 'Touch-up kit provided',
};

export const bridalPackages: BridalPackage[] = [
  {
    id: 1,
    finish: 'Airbrush',
    finishAccent: 'Skin-Finish Makeup',
    price: 20000,
    description:
      'Featherlight airbrushed coverage that melts into the skin for a flawless, natural finish that photographs beautifully.',
    featured: true,
    includes: ['Airbrush Skin-Finish Makeup', ...sharedIncludes],
    comboPerks: [perks.travel, perks.groom, perks.jewellery, perks.touchUp],
  },
  {
    id: 2,
    finish: 'Glossy',
    finishAccent: 'or Waterproof',
    price: 15000,
    description:
      'Choose a dewy, luminous glow or a waterproof finish made to stay put through long ceremonies and happy tears.',
    includes: ['Glossy (or) Waterproof Makeup', ...sharedIncludes],
    comboPerks: [perks.travel, perks.groom, perks.jewellery],
  },
  {
    id: 3,
    finish: 'HD',
    finishAccent: 'or Matte',
    price: 12000,
    description:
      'Camera-ready HD or a soft, velvety matte finish with smooth, even coverage for a classic bridal look.',
    includes: ['HD or Matte Finish Makeup', ...sharedIncludes],
    comboPerks: [perks.travel, perks.jewellery],
  },
];

export const packageAddOns = [
  { label: 'Extra Drape', value: '₹500 per saree' },
  { label: 'Pre-pleating', value: '₹800 per saree' },
  { label: 'Outstation Travel', value: 'Charged additionally' },
];

// Booking procedure: first come, first served
export const bookingAdvance = 2000;

export const bookingSteps = [
  { title: 'Contact me', text: 'Call or WhatsApp +91 86680 38093 before paying the advance.' },
  { title: 'Pay the advance', text: 'Required for each makeup session, across all packages.' },
  { title: 'Date confirmed', text: 'Your date is confirmed once the advance is received.' },
];

export const bookingNotes = [
  'All prices are exclusive of GST. 5% GST is added to the total service amount.',
  'Travel charges are excluded from GST.',
  'A proper bill will be provided.',
  'Date changes are subject to availability at the time of request.',
  'Prices are fixed and non-negotiable.',
];

export const paymentMethods = ['Google Pay', 'PhonePe', 'Paytm', 'UPI', 'Net banking', 'Cash'];
