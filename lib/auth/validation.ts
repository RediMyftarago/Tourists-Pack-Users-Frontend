export const NAME_PATTERN = /^\p{L}+$/u;

export const passwordRules = [
  { key: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { key: "number", label: "At least one number", test: (value: string) => /\d/.test(value) },
  { key: "special", label: "At least one special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
  { key: "uppercase", label: "At least one uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
];

export function isInvalidName(value: string) {
  return value.length > 0 && !NAME_PATTERN.test(value);
}

export function isValidPassword(value: string) {
  return passwordRules.every((rule) => rule.test(value));
}
