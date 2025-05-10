// Navigation utility functions

/**
 * Helper function to safely navigate to event details
 * @param eventId The ID of the event to navigate to
 * @returns A route object that can be passed to router.push()
 */
export const getEventDetailsRoute = (eventId: string) => {
  return {
    pathname: 'event-details/[id]',
    params: { id: eventId }
  };
}; 