# BYNEMSTEDDY

Full-stack B2C soft-toy storefront built with React, Tailwind CSS, Express and MongoDB.

## Local development

### Storefront

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

### API

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

The storefront runs at `http://localhost:5173` and expects the API at
`http://localhost:5000/api`.

## Environment

Keep actual MongoDB, Cloudinary, Razorpay, NimbusPost and JWT credentials only
in `server/.env`. Never commit that file. Public frontend configuration belongs
in `client/.env`.

### Authentication setup

- Verification emails are sent through the Brevo HTTP API. Set `BREVO_API_KEY`,
  `BREVO_SENDER_EMAIL`, and `BREVO_SENDER_NAME`. The sender email must be
  verified in the Brevo dashboard.
- Create a Google OAuth 2.0 **Web application** client and add
  `http://localhost:5173` as an authorized JavaScript origin.
- Put the same Google client ID in `server/.env` as `GOOGLE_CLIENT_ID` and in
  `client/.env.local` as `VITE_GOOGLE_CLIENT_ID`. A Google client secret is not
  needed for the Google Identity Services ID-token flow used here.
- Restart both development servers after changing environment variables.

### Logging

The API emits readable structured logs in development and JSON logs in
production. Set `LOG_LEVEL=debug` to include sanitized request and response
payloads. Passwords, tokens, signatures, credentials, contact details and
addresses are always redacted or masked.

## Production checklist

- Replace demonstration product photography and seed content with the final catalogue.
- Add final contact, social, legal, shipping and return information.
- Set production CORS and cookie domains.
- Register Razorpay and NimbusPost webhook URLs.
- Test online payment, cancellation, refund and shipment flows in sandbox accounts.
