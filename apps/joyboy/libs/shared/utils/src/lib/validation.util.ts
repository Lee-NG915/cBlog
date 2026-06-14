import { postcodeValidator, postcodeValidatorExistsForCountry } from 'postcode-validator';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { EcEnv } from '@castlery/config';

// ─── Phone ───────────────────────────────────────────────────────────────────

/**
 * Country-specific phone number format regex.
 * Used for a quick format pre-check before full libphonenumber validation.
 */
export const PhoneFormatRegexMapping = {
  SG: /^(\+?65(\s|-)?)?\d{4}(\s|-)?\d{4}$/,
  AU: /^(?:\+?61|0)[ -]?[2-478](?:[ -]?\d){8}$/,
  US: /^(\+1\s?)?(\(?[23456789]{1}[0-9]{2}\)?)[\s-]?\d{3}[\s-]?\d{4}$/,
  CA: /^(\+1\s?)?(\(?[23456789]{1}[0-9]{2}\)?)[\s-]?\d{3}[\s-]?\d{4}$/,
  UK: /^(?:\+44[\s-]?|0)(?:\d[\s-]?){9,10}$/,
} as const;

/**
 * Validates a phone number against the current market's format regex,
 * then performs full libphonenumber validation.
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  try {
    const countryKey = EcEnv.NEXT_PUBLIC_COUNTRY.toUpperCase() as keyof typeof PhoneFormatRegexMapping;
    const phoneFormatRegex = PhoneFormatRegexMapping[countryKey];
    if (phoneFormatRegex && !phoneFormatRegex.test(phoneNumber)) {
      return false;
    }
    // libphonenumber uses 'GB' for UK
    const countryCode = countryKey === 'UK' ? 'GB' : countryKey;
    const phoneUtil = PhoneNumberUtil.getInstance();
    const parsed = phoneUtil.parse(phoneNumber, countryCode);
    return phoneUtil.isValidNumber(parsed);
  } catch {
    return false;
  }
};

/**
 * Country-specific phone number display formatters.
 *
 * - US / CA : (xxx) xxx-xxxx
 * - AU / SG : no transformation (pass-through)
 * - UK      : normalise to +44 prefix
 */
export const phoneNumberFormattingUtils = {
  SG: (value: string) => value,
  AU: (value: string) => value,
  US: (value: string) => {
    if (!value) return '';
    const match = value.match(/^(\d{3})(\d{3})(\d{4})$/);
    return match ? `(${match[1]}) ${match[2]}-${match[3]}` : value;
  },
  CA: (value: string) => {
    if (!value) return '';
    const match = value.match(/^(\d{3})(\d{3})(\d{4})$/);
    return match ? `(${match[1]}) ${match[2]}-${match[3]}` : value;
  },
  UK: (value: string) => {
    if (!value) return '';
    if (value.startsWith('+') || value.startsWith('0') || value.length < 10) return value;
    const digits = value.replace(/\D/g, '');
    const str = digits.startsWith('44') ? digits.replace('44', '+44 ') : digits;
    // Auto-prepend +44 if not already prefixed with + or 0
    return /^(?![+0])/.test(str) ? `+44 ${str}` : str;
  },
} as const;

// ─── Zipcode / Postcode ───────────────────────────────────────────────────────

/**
 * Validates a postcode/zipcode for the current market using the
 * `postcode-validator` library. Returns true for unsupported countries.
 */
export const validatePostcode = (postcode: string): boolean => {
  const countryCode = EcEnv.NEXT_PUBLIC_COUNTRY.toUpperCase();
  if (postcodeValidatorExistsForCountry(countryCode)) {
    return postcodeValidator(postcode, countryCode);
  }
  return true;
};

// ─── Email ────────────────────────────────────────────────────────────────────

/**
 * RFC 5321 / 5322 compliant email regex.
 * Enforces max 254 total chars and max 64 chars before @.
 */
export const EMAIL_STRICT =
  /^(?=.{1,254}$)(?=.{1,64}@)[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+(?:[A-Za-z]{2,}|xn--[A-Za-z0-9-]{2,})$/;

/** Returns true if the email passes strict RFC format validation. */
export const validateEmail = (email: string): boolean => EMAIL_STRICT.test(email);
