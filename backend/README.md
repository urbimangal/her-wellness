# HerWellness Backend — My Modules

Backend (Node.js + Express + MongoDB/Mongoose) for the 5 modules I own:
Emergency SOS, Nearby Services, Community, Dashboard, and Reminder System.

## Setup

```bash
cd herwellness-backend
npm install
cp .env.example .env   # then fill in your MONGO_URI
npm run dev            # requires nodemon, or: npm start
```

## ⚠️ Important — Auth is a stub right now

`middleware/auth.js` is a **temporary placeholder**. It reads a `x-user-id`
header instead of verifying a real JWT, so I could build and test these
modules without waiting on the Auth/Login-Signup teammate. Every protected
route needs this header while testing in Postman:

```
x-user-id: 64f1a2b3c4d5e6f7a8b9c0d1
```

Once the real auth module is merged, replace the body of `protect()` with
actual JWT verification — the rest of the code (`req.user.id`) will keep
working unchanged.

## Folder structure

```
herwellness-backend/
├── server.js                  # entry point, mounts all routes
├── config/db.js               # MongoDB connection
├── middleware/auth.js         # temporary auth stub (see above)
├── jobs/reminderCron.js       # cron job → auto-notifies due medicine/appointments
├── models/
│   ├── EmergencyContact.js, SOSAlert.js, LiveLocation.js        (SOS)
│   ├── Hospital.js, MedicalShop.js, HomeCare.js, BloodBank.js   (Nearby Services)
│   ├── Post.js, Comment.js, Like.js, ExpertQuery.js             (Community)
│   ├── HealthScore.js, Notification.js, Activity.js             (Dashboard)
│   └── MedicineReminder.js, AppointmentReminder.js               (Reminders)
├── controllers/
│   ├── sosController.js
│   ├── nearbyServicesController.js
│   ├── communityController.js
│   ├── dashboardController.js
│   └── reminderController.js
└── routes/
    ├── sosRoutes.js            → /api/sos
    ├── nearbyRoutes.js         → /api/nearby
    ├── communityRoutes.js      → /api/community
    ├── dashboardRoutes.js      → /api/dashboard
    └── reminderRoutes.js       → /api/reminders
```

## API Reference

### 1. Emergency SOS — `/api/sos`
| Method | Route | Description |
|---|---|---|
| POST | `/trigger` | Trigger SOS with lat/lng, notify saved contacts |
| PUT | `/:id/resolve` | Mark an SOS alert resolved |
| PUT | `/:id/cancel` | Cancel an SOS alert |
| GET | `/history` | Get user's past SOS alerts |
| POST | `/contacts` | Add emergency contact |
| GET | `/contacts` | List emergency contacts |
| PUT | `/contacts/:id` | Update a contact |
| DELETE | `/contacts/:id` | Delete a contact |
| POST | `/location` | Upsert live location (called periodically by app) |
| GET | `/location` | Get current live location |
| PUT | `/location/stop` | Stop sharing live location |
| GET | `/ambulances/nearby` | Dummy nearby ambulance data (swap for real provider later) |
| POST | `/ambulances/book` | "Book" a dummy ambulance |

### 2. Nearby Services — `/api/nearby`
| Method | Route | Description |
|---|---|---|
| GET | `/hospitals?lat=&lng=&radius=` | List hospitals sorted by distance |
| POST/PUT/DELETE | `/hospitals` | Manage hospital records |
| GET | `/medical-shops?medicine=` | Find shops, optionally filter by medicine in stock |
| POST | `/medical-shops` | Add a shop |
| PUT | `/medical-shops/:id/stock` | Update stock list |
| DELETE | `/medical-shops/:id` | Remove a shop |
| GET | `/home-care?type=nurse` | List available caretakers/nurses |
| POST | `/home-care` | Add a provider |
| POST | `/home-care/book` | Book a home-care provider |
| GET | `/home-care/bookings/mine` | My bookings |
| PUT | `/home-care/bookings/:id/cancel` | Cancel a booking |
| GET | `/blood-banks?group=O+` | Find blood banks with a given group in stock |
| POST | `/blood-banks` | Add a blood bank |
| PUT | `/blood-banks/:id/inventory` | Update unit inventory |

### 3. Community — `/api/community`
| Method | Route | Description |
|---|---|---|
| GET | `/posts?category=&page=&limit=` | Paginated feed |
| GET | `/posts/:id` | Single post |
| POST/PUT/DELETE | `/posts` | Create/update/delete own post |
| GET | `/posts/:postId/comments` | List comments on a post |
| POST | `/posts/:postId/comments` | Add a comment |
| DELETE | `/comments/:id` | Delete own comment |
| POST | `/like` | Toggle like on a Post or Comment |
| GET | `/like/status` | Check if current user liked a target |
| POST | `/ask-expert` | Submit a question |
| GET | `/ask-expert/mine` | My submitted questions |
| GET | `/ask-expert?status=pending` | Expert/admin queue |
| PUT | `/ask-expert/:id/answer` | Expert answers a question |

### 4. Dashboard — `/api/dashboard`
| Method | Route | Description |
|---|---|---|
| POST | `/health-score` | Compute & save today's health score from factors |
| GET | `/health-score/latest` | Latest score |
| GET | `/health-score/history?days=` | Score history |
| POST | `/notifications` | Create a notification (used internally by other modules too) |
| GET | `/notifications?unreadOnly=` | List notifications |
| PUT | `/notifications/:id/read` | Mark one read |
| PUT | `/notifications/read-all` | Mark all read |
| DELETE | `/notifications/:id` | Delete a notification |
| POST | `/activity` | Log a recent activity event |
| GET | `/activity/recent?limit=` | Recent activity feed |
| GET | `/analytics/health-trend?days=` | Health score line-chart data |
| GET | `/analytics/activity-breakdown?days=` | Pie-chart of activity types |
| GET | `/analytics/factor-trend?factor=&days=` | Trend for one score factor (sleep/mood/etc.) |

### 5. Reminder System — `/api/reminders`
| Method | Route | Description |
|---|---|---|
| POST | `/medicine` | Create medicine reminder |
| GET | `/medicine?activeOnly=` | List reminders |
| GET | `/medicine/due-today` | Reminders active today |
| PUT | `/medicine/:id` | Update reminder |
| PUT | `/medicine/:id/mark-taken` | Log a dose as taken |
| DELETE | `/medicine/:id` | Delete reminder |
| POST | `/appointments` | Create appointment reminder |
| GET | `/appointments?status=` | List appointments |
| PUT | `/appointments/:id` | Update appointment details |
| PUT | `/appointments/:id/status` | Mark completed/missed/cancelled |
| DELETE | `/appointments/:id` | Delete appointment |
| POST | `/notify/test` | Manually fire a test reminder notification |

A cron job (`jobs/reminderCron.js`) runs every minute in the background and
auto-creates notifications when a medicine dose or appointment reminder
window is hit — no need to poll manually.

## Notes for the team

- All models use `userId` referencing whatever `User` model the Auth teammate
  builds — nothing here assumes a specific User schema shape beyond `_id`.
- Ambulance data in SOS module is **dummy data** since there's no free public
  ambulance-booking API — replace `dummyAmbulances` in `sosController.js`
  once/if a real provider is integrated.
- Notifications created by the Dashboard module (`/api/dashboard/notifications`)
  and the Reminder module (`/api/reminders/notify/test`) share the same
  `Notification` model — so all "Notification APIs" across the app funnel
  into one collection, which makes a single "Notifications" screen easy to
  build on the frontend.
- Distance-based "nearby" search currently does an in-memory Haversine sort
  (fine for demo/small datasets). For production scale, switch to MongoDB's
  native `2dsphere` geospatial index + `$geoNear`.
