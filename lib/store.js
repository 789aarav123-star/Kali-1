'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'reservations.ndjson');

/** Human-friendly booking reference, e.g. KH-7F3Q2. */
function createReference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = crypto.randomBytes(5);
  for (const byte of bytes) {
    code += alphabet[byte % alphabet.length];
  }
  return `KH-${code}`;
}

/**
 * Persist a validated reservation / event inquiry.
 * Appends one JSON object per line so the file stays readable and easy to export.
 * @throws {Error} when the inquiry cannot be written (the caller must then report failure).
 */
async function saveReservation(inquiry, meta = {}) {
  const record = {
    id: createReference(),
    receivedAt: new Date().toISOString(),
    ...inquiry,
    source: meta.source || 'website',
    ip: meta.ip || null,
    userAgent: meta.userAgent || null,
  };

  await fs.promises.mkdir(DATA_DIR, { recursive: true });
  await fs.promises.appendFile(STORE_FILE, `${JSON.stringify(record)}\n`, 'utf8');

  return record;
}

/** Read stored inquiries (newest first). Used by the ops endpoint and for verification. */
async function listReservations(limit = 50) {
  try {
    const raw = await fs.promises.readFile(STORE_FILE, 'utf8');
    const lines = raw.split('\n').filter(Boolean);
    return lines
      .slice(-limit)
      .reverse()
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

module.exports = { saveReservation, listReservations, createReference, STORE_FILE };
