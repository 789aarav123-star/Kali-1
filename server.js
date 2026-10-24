'use strict';

/**
 * Kali Hotel & Restaurant — Express server.
 *
 * Routes
 *   GET  /                 Marketing page (EJS)
 *   POST /api/reservations Reservation & event inquiry endpoint (sanitised, rate limited, JSON)
 *   GET  /api/menu         Menu data as JSON (useful for future kiosk / app screens)
 *   GET  /health           Liveness probe
 *   GET  /robots.txt       Crawler policy
 *   GET  /sitemap.xml      Single-page sitemap
 */

const path = require('path');
const express = require('express');
const helmet = require('helmet');

const site = require('./lib/site-data');
const { validateReservation } = require('./lib/validate');
const { saveReservation, listReservations } = require('./lib/store');
const { createRateLimiter } = require('./lib/rate-limit');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (process.env.TRUST_PROXY) {
  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : process.env.TRUST_PROXY);
}

/* ------------------------------------------------------------------ *
 * Security headers
 * ------------------------------------------------------------------ */
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        frameSrc: ['https://www.google.com', 'https://maps.google.com'],
        formAction: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
        manifestSrc: ["'self'"],
        upgradeInsecureRequests: IS_PRODUCTION ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

app.disable('x-powered-by');

/* ------------------------------------------------------------------ *
 * Core middleware
 * ------------------------------------------------------------------ */
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

app.use(
  express.static(path.join(__dirname, 'public'), {
    extensions: ['html'],
    maxAge: IS_PRODUCTION ? '7d' : 0,
    etag: true,
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

/* ------------------------------------------------------------------ *
 * View engine
 * ------------------------------------------------------------------ */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.site = site;
app.locals.currentYear = new Date().getFullYear();
app.locals.homeUrl = '/';

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */
const inquiryLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });

function clientIp(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

/**
 * Reject cross-origin form posts so the public endpoint cannot be used as a
 * third-party form relay. Requests without an Origin header (curl, native
 * apps) are allowed through.
 */
function isSameOriginRequest(req) {
  const origin = req.get('origin');
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    return !originHost || originHost === req.get('host');
  } catch {
    return false;
  }
}

function sendJson(res, status, payload) {
  res.status(status);
  res.set('Cache-Control', 'no-store');
  res.json(payload);
}

/* ------------------------------------------------------------------ *
 * Routes
 * ------------------------------------------------------------------ */
app.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.render('index', {
    pageTitle: `${site.name} — ${site.tagline}`,
    metaDescription: site.shortDescription,
    ogImage: `${baseUrl}/images/counter.jpg`,
    canonicalUrl: `${baseUrl}/`,
    baseUrl,
    jsonLd: buildJsonLd(baseUrl),
  });
});

app.get('/privacy', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.render('privacy', {
    pageTitle: `Privacy Policy — ${site.name}`,
    metaDescription:
      'Learn what information Kali Hotel & Restaurant handles, how our website uses third-party services, and how to contact us about your privacy.',
    canonicalUrl: `${baseUrl}/privacy`,
  });
});

app.get('/api/menu', (req, res) => {
  sendJson(res, 200, {
    success: true,
    restaurant: site.name,
    priceRange: site.priceRange,
    categories: site.menuCategories,
    items: site.menu,
  });
});

app.post('/api/reservations', async (req, res, next) => {
  const ip = clientIp(req);

  if (!isSameOriginRequest(req)) {
    return sendJson(res, 403, {
      success: false,
      message: 'This request was rejected because it came from another website.',
    });
  }

  const limit = inquiryLimiter.check(ip);
  res.set('X-RateLimit-Remaining', String(limit.remaining));
  if (!limit.allowed) {
    res.set('Retry-After', String(limit.retryAfterSeconds));
    return sendJson(res, 429, {
      success: false,
      message: `Too many requests. Please try again in ${limit.retryAfterSeconds} seconds or call us on ${site.phone}.`,
    });
  }

  const result = validateReservation(req.body);
  if (!result.ok) {
    return sendJson(res, 400, {
      success: false,
      message: 'Some details need fixing before we can confirm your booking.',
      errors: result.errors,
    });
  }

  try {
    const record = await saveReservation(result.value, {
      source: 'website',
      ip,
      userAgent: req.get('user-agent') || '',
    });

    console.log(
      `[reservation] ${record.id} | ${record.eventType} | ${record.date} ${record.time || '--'} | ` +
        `${record.guests} guests | ${record.name} | ${record.phone}`
    );

    return sendJson(res, 201, {
      success: true,
      message:
        result.value.eventType === 'table'
          ? 'Thank you! Your table request is received. We will call you shortly to confirm.'
          : 'Thank you! Your event request is received. Our team will call you to finalise the decorations and cabin.',
      reference: record.id,
      receivedAt: record.receivedAt,
    });
  } catch (error) {
    return next(error);
  }
});

/** Internal-only listing, protected by a shared token so inquiries are never public. */
app.get('/api/reservations', async (req, res, next) => {
  const token = process.env.INQUIRY_TOKEN;
  if (!token) {
    return sendJson(res, 404, { success: false, message: 'Not found.' });
  }
  if (req.get('x-inquiry-token') !== token) {
    return sendJson(res, 401, { success: false, message: 'Unauthorized.' });
  }
  try {
    const inquiries = await listReservations(100);
    return sendJson(res, 200, { success: true, count: inquiries.length, inquiries });
  } catch (error) {
    return next(error);
  }
});

app.get('/health', (req, res) => {
  sendJson(res, 200, { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(
    ['User-agent: *', 'Allow: /', 'Disallow: /api/', '', `Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`, ''].join('\n')
  );
});

app.get('/sitemap.xml', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `  <url><loc>${baseUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n` +
      `  <url><loc>${baseUrl}/privacy</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>\n` +
      `</urlset>\n`
  );
});

/* ------------------------------------------------------------------ *
 * 404 + error handling
 * ------------------------------------------------------------------ */
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return sendJson(res, 404, { success: false, message: 'Endpoint not found.' });
  }
  res.status(404).render('404', {
    pageTitle: `Page not found — ${site.name}`,
    metaDescription: 'The page you were looking for could not be found.',
    canonicalUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
  });
});

app.use((error, req, res, next) => {
  console.error('[error]', error);
  if (res.headersSent) return next(error);
  if (req.path.startsWith('/api/')) {
    return sendJson(res, 500, {
      success: false,
      message: 'Something went wrong on our side. Please call us on ' + site.phone + '.',
    });
  }
  res.status(500).render('500', {
    pageTitle: `Something went wrong — ${site.name}`,
    metaDescription: 'An unexpected error occurred.',
    canonicalUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
  });
});

/* ------------------------------------------------------------------ *
 * Schema.org structured data
 * ------------------------------------------------------------------ */
function buildJsonLd(baseUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${baseUrl}/#restaurant`,
    name: site.name,
    description: site.description,
    url: baseUrl,
    telephone: site.phoneE164,
    priceRange: site.priceRange,
    servesCuisine: site.cuisines,
    currenciesAccepted: 'NPR',
    paymentAccepted: 'Cash, Cards, Mobile Payment',
    image: [
      `${baseUrl}/images/counter.jpg`,
      `${baseUrl}/images/bday_example.jpg`,
      `${baseUrl}/images/chi_biryani-1.jpg`,
    ],
    logo: `${baseUrl}/images/logo_kali.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.address.geo.latitude,
      longitude: site.address.geo.longitude,
    },
    hasMap: site.mapsUrl,
    sameAs: [site.facebook],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '10:00',
        closes: '22:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Friday', 'Saturday'],
        opens: '10:00',
        closes: '23:30',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: site.rating.value,
      reviewCount: site.rating.count,
      bestRating: site.rating.bestRating,
      worstRating: 1,
    },
    review: site.reviews.map((review) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.author },
      reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5 },
      reviewBody: review.text,
    })),
    acceptsReservations: 'True',
    hasMenu: `${baseUrl}/#menu`,
  };
}

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */
if (require.main === module) {
  let server;

  const shutdown = (signal) => () => {
    if (!server) {
      process.exit(0);
      return;
    }

    console.log(`\n${signal} received, closing server.`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  };

  process.on('SIGINT', shutdown('SIGINT'));
  process.on('SIGTERM', shutdown('SIGTERM'));

  function startServer(port) {
    const candidate = app.listen(port, HOST, () => {
      server = candidate;
      console.log(`\n  ${site.name}`);
      console.log(`  → http://localhost:${port}`);
      console.log(`  → POST http://localhost:${port}/api/reservations\n`);
    });

    candidate.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        const fallbackPort = port + 1;
        console.warn(`Port ${port} is already in use. Retrying on port ${fallbackPort}...`);
        candidate.close(() => startServer(fallbackPort));
        return;
      }

      throw error;
    });
  }

  startServer(PORT);
}

module.exports = app;
