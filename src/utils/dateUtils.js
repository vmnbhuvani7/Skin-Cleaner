/**
 * Calculates age based on a given birthdate
 * @param {string|Date} birthdate - The birthdate to calculate age from
 * @returns {number|string} - The calculated age or an empty string if birthdate is invalid
 */
export const calculateAge = (birthdate) => {
  if (!birthdate) return '';
  
  const birthDate = new Date(birthdate);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 0 ? age : 0;
};
