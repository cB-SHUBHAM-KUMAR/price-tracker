/**
 * @fileoverview Reusable form validation helpers.
 */

export const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isRequired = (value) => value !== null && value !== undefined && value.toString().trim().length > 0;

export const minLength = (value, min) => value.length >= min;

export const maxLength = (value, max) => value.length <= max;

/**
 * Validates a form fields object against a rules map.
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export const validateForm = (fields, rules) => {
  const errors = {};
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const error = rule(fields[field]);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};
