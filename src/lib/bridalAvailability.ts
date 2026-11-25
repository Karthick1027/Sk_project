import { postWorkshopAction } from './workshopPayment';

// Availability runs in the studio's booking automation deployment.
// Workshop order creation and verification keep their existing endpoint.
export const BRIDAL_AVAILABILITY_API_URL = 'https://script.google.com/macros/s/AKfycbzj1dDVfYQt-zOTTdkV8fTegusSdISJZHUr4RuzHPc5gwWnUCcE77NToadNgrWsNYgQlw/exec';

export const BRIDAL_AVAILABILITY_OCCASIONS = ['Muhurtham', 'Reception', 'Engagement', 'Baby Shower', 'Puberty Ceremony'] as const;
export const BRIDAL_SESSIONS = ['Morning', 'Evening', 'Full Day'] as const;
export type BridalAvailabilityOccasion = typeof BRIDAL_AVAILABILITY_OCCASIONS[number];
export type BridalSession = typeof BRIDAL_SESSIONS[number];

export const bridalSessionsOverlap = (first: BridalSession, second: BridalSession) => first === second || first === 'Full Day' || second === 'Full Day';

export interface BridalAvailabilityResult {
  ok: true;
  available: boolean;
  date: string;
  session: BridalSession;
  status: 'AVAILABLE' | 'BOOKED';
}

export async function checkBridalAvailability(date: string, occasion: BridalAvailabilityOccasion, session: BridalSession): Promise<BridalAvailabilityResult> {
  // Check both existing slots so Full Day also works with the current deployment.
  if (session === 'Full Day') {
    const slots = await Promise.all([checkBridalAvailability(date, occasion, 'Morning'), checkBridalAvailability(date, occasion, 'Evening')]);
    const available = slots.every(slot => slot.available);
    return { ok: true, available, date, session, status: available ? 'AVAILABLE' : 'BOOKED' };
  }
  const response = await postWorkshopAction({ action: 'check_bridal_availability', date, occasion, session }, BRIDAL_AVAILABILITY_API_URL);
  const expectedStatus = response.available === true ? 'AVAILABLE' : response.available === false ? 'BOOKED' : '';
  if (
    response.ok !== true ||
    typeof response.available !== 'boolean' ||
    response.status !== expectedStatus ||
    response.date !== date ||
    response.session !== session
  ) {
    throw new Error('The availability server did not confirm this session. Please try again.');
  }
  return response as unknown as BridalAvailabilityResult;
}