// Helper functions for the app

/**
 * Generates a simple ID without using UUID
 * @returns a random string ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}; 