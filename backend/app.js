const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');

const app = express();

// Collect allowed origins, supporting comma-separated values in multiple env vars
const parseOrigins = value => (value || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8081'];
const allowedOrigins = Array.from(new Set([
  ...parseOrigins(process.env.CORS_ORIGIN),
  ...parseOrigins(process.env.USER_CORS_ORIGIN),
  ...parseOrigins(process.env.CORS_ORIGINS),
  // Fall back to local defaults when no explicit origin is provided
  ...(!process.env.CORS_ORIGIN && !process.env.USER_CORS_ORIGIN ? defaultOrigins : []),
].filter(Boolean)));

if (!allowedOrigins.length) {
  allowedOrigins.push(...defaultOrigins);
}

const isTrustedLocalhost = origin => {
  try {
    const { hostname } = new URL(origin);
    return ['localhost', '127.0.0.1'].includes(hostname);
  } catch (err) {
    return false;
  }
};
console.log('Allowed CORS origins:', allowedOrigins);

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      console.log('Request origin:', origin);
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || isTrustedLocalhost(origin)) {
        return callback(null, true);
      }
      console.error(`CORS error: Origin ${origin} not allowed`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-frontend'],
    methods: ['GET', 'POST','PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Debug: Log response headers
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log('Response headers:', res.getHeaders());
  });
  next();
});

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Routers
const userRouter = require('./routes/userRoutes');
const eventRouter = require('./routes/eventRoutes');
const galleryRouter = require('./routes/galeryRoutes');
const committeeRouter = require('./routes/committeeRoutes');
const branchRouter = require('./routes/branchRoutes');
const carouselRouter = require('./routes/carouselRoutes');


app.use('/api/v1/user', userRouter);
app.use('/api/v1/event', eventRouter);
app.use('/api/v1/gallery', galleryRouter);
app.use('/api/v1/committee-members', committeeRouter);
app.use('/api/v1/branches', branchRouter);
app.use('/api/v1/carousel', carouselRouter);


// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  console.error('Error in request:', err);
  res.status(statusCode).json({ success: false, message, statusCode });
});

module.exports = app;
