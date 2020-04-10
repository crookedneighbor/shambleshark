// tiny wrapper with default env vars
module.exports = {
  BROWSER: process.env.BROWSER || "GOOGLE_CHROME",
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
};
