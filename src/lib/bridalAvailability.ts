import { postWorkshopAction } from './workshopPayment';

export const BRIDAL_AVAILABILITY_OCCASIONS = ['Muhurtham', 'Reception', 'Engagement', 'Baby Shower', 'Puberty Ceremony'] as const;
export const BRIDAL_SESSIONS = ['Morning', 'Evening'] as const;
export type BridalAvailabilityOccasion = typeof BRIDAL_AVAILABILITY_OCCASIONS[number];
export type BridalSession = typeof BRIDAL_SESSIONS[number];

export interface BridalAvailabilityResult {
  ok: true;
  available: boolean;
  date: string;
  session: BridalSession;
  status: 'AVAILABLE' | 'BOOKED';
}

export async function checkBridalAvailability(date: string, occasion: BridalAvailabilityOccasion, session: BridalSession): Promise<BridalAvailabilityResult> {
  const response = await postWorkshopAction({ action: 'check_bridal_availability', date, occasion, session });
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