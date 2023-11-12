import { JWT } from "google-auth-library";

// init google service account auth
const serviceAccountAuth = new JWT({
  // env var values here are copied from service account credentials generated by google
  // see "Authentication" section in docs for more info
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, "\n"), // need to do this for proper newline handling from .env files
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export default serviceAccountAuth;