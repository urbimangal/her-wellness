# Women Health App — Authentication Module

A production-ready authentication module built with Node.js, Express, MongoDB (Mongoose), JWT, and bcrypt, following MVC architecture. OTPs are delivered via Twilio, with an automatic console-log fallback when Twilio credentials are not configured (ideal for local development).

## Project Structure

```
women-health-auth/
├── config/
│   ├── db.js               # MongoDB connection
│   └── env.js               # Centralized, validated env config
├── controllers/
│   ├── authController.js    # register, verify-otp, resend-otp, login
│   └── profileController.js # getProfile, updateProfile
├── middleware/
│   ├── authMiddleware.js    # JWT "protect" middleware
│   └── errorMiddleware.js   # 404 + centralized error handler
├── models/
│   ├── User.js               # User schema
│   └── Otp.js                 # OTP schema (TTL auto-expiry)
├── routes/
│   ├── authRoutes.js
│   └── profileRoutes.js
├── utils/
│   ├── ApiError.js
│   ├── asyncHandler.js
│   ├── generateOtp.js
│   ├── generateToken.js
│   ├── sendSms.js            # Twilio + console fallback
│   └── validators.js
├── app.js                     # Express app setup
├── server.js                  # Entry point
├── .env.example
├── .gitignore
└── package.json
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   - `MONGO_URI` — your MongoDB connection string
   - `JWT_SECRET` — a long, random secret string
   - `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` — optional. Leave blank to use the console OTP fallback (OTPs will be printed to the server logs instead of sent via SMS).

3. **Run MongoDB** locally, or point `MONGO_URI` at a hosted instance (e.g. MongoDB Atlas).

4. **Start the server**
   ```bash
   npm run dev    # with nodemon (auto-restart)
   # or
   npm start
   ```

The server starts on `http://localhost:5000` by default (configurable via `PORT`).

## API Reference

All responses follow the shape:
```json
{ "success": true|false, "message": "...", "data": { ... }, "errors": [ ... ] }
```

### 1. Register
`POST /api/auth/register`
```json
{
  "fullName": "Jane Doe",
  "phone": "+919876543210",
  "password": "Passw0rd!",
  "confirmPassword": "Passw0rd!"
}
```
- Password requires: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.
- On success (`201`): creates the user (`isVerified: false`, `profileCompleted: false`), generates a 6-digit OTP (5 min expiry, configurable via `OTP_EXPIRY_MINUTES`), stores it in the `Otp` collection, and sends it via Twilio or logs it to the console.

### 2. Verify OTP
`POST /api/auth/verify-otp`
```json
{ "phone": "+919876543210", "otp": "123456" }
```
- Validates the OTP and expiry, deletes the OTP record, marks the user `isVerified: true`, and returns a JWT + user object (`200`).

### 3. Resend OTP
`POST /api/auth/resend-otp`
```json
{ "phone": "+919876543210" }
```
- Generates a new OTP, replaces the existing OTP document, resets the expiry, and resends it (`200`).

### 4. Login
`POST /api/auth/login`
```json
{ "phone": "+919876543210", "password": "Passw0rd!" }
```
- Only allows verified users (`403` if unverified). Returns a JWT + user object on success (`200`).

### 5. Get Profile (Protected)
`GET /api/profile`
Header: `Authorization: Bearer <token>`
- Returns the authenticated user's full profile (`200`).

### 6. Update Profile (Protected)
`PUT /api/profile`
Header: `Authorization: Bearer <token>`
```json
{
  "age": 28,
  "height": 165,
  "weight": 58,
  "bloodGroup": "O+",
  "emergencyContactMother": { "name": "Mary Doe", "phone": "+919876500000" },
  "emergencyContactFather": { "name": "John Doe", "phone": "+919876500001" },
  "emergencyContactGuardian": { "name": "Aunt Sue", "phone": "+919876500002" },
  "medicalConditions": ["PCOS"],
  "allergies": ["Penicillin"]
}
```
- Updates only the fields provided, sets `profileCompleted: true`, and returns the updated user (`200`).

## Error Handling & Status Codes

| Code | Meaning                                    |
|------|---------------------------------------------|
| 200  | Success                                     |
| 201  | Resource created (registration)             |
| 400  | Validation error / bad request              |
| 401  | Invalid credentials / invalid or missing JWT|
| 403  | Forbidden (e.g. unverified account on login)|
| 404  | Resource not found                          |
| 409  | Conflict (e.g. duplicate phone number)      |
| 500  | Internal server error                       |

All errors return `{ success: false, message, errors: [{ field, message }] }`.

## Security Notes

- Passwords hashed with `bcryptjs` (12 salt rounds), never returned in API responses (`select: false` on the schema plus a `toSafeObject()` helper).
- JWTs signed with `JWT_SECRET`, expiry configurable via `JWT_EXPIRES_IN`.
- OTPs stored in a separate collection with a MongoDB TTL index for automatic cleanup, in addition to explicit expiry checks in code.
- Only one active OTP per user at a time (upserted, not accumulated).
