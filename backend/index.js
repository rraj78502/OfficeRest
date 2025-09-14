// Load the correct .env file based on NODE_ENV
const path = require('path');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';
// Try env-specific file first, then fall back to .env
const envPath = path.resolve(__dirname, `.env.${env}`);
const loaded = dotenv.config({ path: envPath });
if (loaded.error) {
  // Fallback to default .env
  dotenv.config({ path: path.resolve(__dirname, `.env`) });
}

const connectDB = require("./db/db");
const app = require("./app");

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running in ${env} mode on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error(`MongoDB connection failed: ${err}`);
  });
