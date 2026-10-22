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
  groom: '1 session groom makeup — free',
  jewellery: '1 session rental full bridal jewellery set',
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
