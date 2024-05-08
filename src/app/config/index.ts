import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  password_reset_link: process.env.PASSWORD_RESET_LINK,
  mail_sender_email: process.env.MAIL_SENDER_EMAIL,
  mail_sender_pass: process.env.MAIL_SENDER_PASSWORD,
  user_default_pass: process.env.USER_DEFAULT_PASS,
  jwt: {
    jwt_access_secret: process.env.JWT_SECRET,
    jwt_access_expiresin: process.env.JWT_EXPIRES_IN,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    refresh_token_expiresin: process.env.REFRESH_TOKEN_EXPIRES_IN,
    reset_pass_token_secret: process.env.RESET_PASS_TOKEN_SECRET,
    reset_pass_token_expiresin: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
  },
  ssl: {
    storeId: process.env.STORE_ID,
    storePass: process.env.STORE_PASS,
    successUrl: process.env.SUCCESS_URL,
    failUrl: process.env.FAIL_URL,
    cancelUrl: process.env.CANCEL_URL,
    ipnUrl: process.env.IPN_URL,
    paymentApi: process.env.PAYMENT_API,
    validationUrl: process.env.VALIDATION_URL,
  },
  cloudinary: {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  },
};
