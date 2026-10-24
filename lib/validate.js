'use strict';

/**
 * Input sanitisation + validation for the reservation / event inquiry endpoint.
 *
 * Rules of the house:
 *  - Every string is normalised (control chars stripped, tags removed, whitespace collapsed, trimmed).
 *  - Every string is length-capped before it is ever stored.
 *  - Nothing that reaches a view is trusted: EJS escapes with <%= %> and we never use <%- %> for user data.
 */

const MAX = {
  name: 80,
  phone: 24,
  email: 120,
  date: 10,
  time: 5,
  guests: 2,
  eventType: 24,
  occasion: 120,
  message: 800,
};

const EVENT_TYPES = new Set([
  'table',
  'birthday',
  'anniversary',
  'corporate',
  'family',
  'other',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const NAME_RE = /^[\p{L}\p{M}\s.'-]+$/u;

/**
 * Remove every control character (C0 range plus DEL) from a string.
 * Written as an explicit code-point filter so the source file itself stays plain ASCII.
 */
function stripControlCharacters(value) {
  let out = '';
  for (const char of value) {
    const code = char.codePointAt(0);
    if (code >= 32 && code !== 127) out += char;
  }
  return out;
}

/**
 * Strip control characters, markup and collapse whitespace.
 * Returns '' for anything that is not a string.
 */
function sanitizeText(value) {
  if (typeof value !== 'string') return '';
  return stripControlCharacters(value)
    // Drop script/style blocks including their contents.
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    // Remove any other HTML/XML-ish markup entirely.
    .replace(/<[^>]*>/g, '')
    // Remove leftover angle brackets so nothing can break out of an attribute.
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Multi-line variant of sanitizeText (keeps line breaks, caps length). */
function sanitizeMultiline(value, maxLength) {
  if (typeof value !== 'string') return '';
  return stripControlCharacters(value)
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);
}

/** Normalise a phone number to digits plus an optional leading country code. */
function sanitizePhone(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.replace(/[^\d+]/g, '');
  if (trimmed.length === 0) return '';
  // Collapse a duplicated leading '+' and reject anything with a '+' in the middle.
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '').slice(0, 15);
  return hasPlus ? `+${digits}` : digits;
}

/** Escape a value for safe embedding in HTML/attribute context (defence in depth). */
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** YYYY-MM-DD, real calendar date, not in the past, within the next 2 years. */
function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return false;
  }
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (parsed.getTime() < todayUtc) return false;
  const max = todayUtc + 730 * 24 * 60 * 60 * 1000;
  return parsed.getTime() <= max;
}

/** 24-hour HH:MM within a sane restaurant window. */
function isValidTime(value) {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(':').map(Number);
  if (hours > 23 || minutes > 59) return false;
  return hours >= 9 && hours <= 23;
}

/**
 * Validate and sanitise a reservation / event inquiry payload.
 * @returns {{ok: true, value: object} | {ok: false, errors: Record<string,string>}}
 */
function validateReservation(payload) {
  const errors = {};
  const source = payload && typeof payload === 'object' ? payload : {};

  const name = sanitizeText(source.name);
  if (!name) {
    errors.name = 'Please tell us your name.';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (name.length > MAX.name) {
    errors.name = `Name must be ${MAX.name} characters or fewer.`;
  } else if (!NAME_RE.test(name)) {
    errors.name = 'Name may only contain letters, spaces, dots, dashes and apostrophes.';
  }

  const phone = sanitizePhone(source.phone);
  const phoneDigits = phone.replace(/\D/g, '');
  if (!phoneDigits) {
    errors.phone = 'A contact phone number is required.';
  } else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    errors.phone = 'Enter a valid phone number (7–15 digits).';
  } else if (phoneDigits.startsWith('977') && phoneDigits.length !== 13) {
    // Nepal country code (977) plus a 10-digit mobile number.
    errors.phone = 'Enter a valid Nepal number with or without the +977 prefix.';
  }

  const email = sanitizeText(source.email);
  if (email) {
    if (email.length > MAX.email) {
      errors.email = `Email must be ${MAX.email} characters or fewer.`;
    } else if (!EMAIL_RE.test(email)) {
      errors.email = 'Enter a valid email address.';
    }
  }

  const date = sanitizeText(source.date);
  if (!date) {
    errors.date = 'Please choose a date.';
  } else if (!isValidDate(date)) {
    errors.date = 'Choose a valid date from today onwards.';
  }

  const time = sanitizeText(source.time);
  if (time && !isValidTime(time)) {
    errors.time = 'Choose a time between 09:00 and 23:00.';
  }

  const guestsRaw = sanitizeText(source.guests);
  const guests = Number.parseInt(guestsRaw, 10);
  if (!Number.isInteger(guests) || guests < 1 || guests > 60) {
    errors.guests = 'Number of guests must be between 1 and 60.';
  }

  let eventType = sanitizeText(source.eventType).toLowerCase() || 'table';
  if (!EVENT_TYPES.has(eventType)) {
    errors.eventType = 'Please choose one of the listed event types.';
    eventType = 'other';
  }

  const occasion = sanitizeText(source.occasion);
  if (occasion.length > MAX.occasion) {
    errors.occasion = `Occasion must be ${MAX.occasion} characters or fewer.`;
  }

  const message = sanitizeMultiline(source.message, MAX.message);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      phone,
      email,
      date,
      time,
      guests,
      eventType,
      occasion,
      message,
      cabin: source.cabin === true || source.cabin === 'true' || source.cabin === 'on',
      decoration:
        source.decoration === true || source.decoration === 'true' || source.decoration === 'on',
    },
  };
}

module.exports = {
  validateReservation,
  sanitizeText,
  sanitizeMultiline,
  sanitizePhone,
  escapeHtml,
  stripControlCharacters,
  isValidDate,
  isValidTime,
  MAX,
  EVENT_TYPES,
};
