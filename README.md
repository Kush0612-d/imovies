# IMovies – Movie Ticket Booking Made Simple
## Academic Full-Stack MERN Web Application

**IMovies** is a comprehensive, production-grade online movie ticket booking platform inspired by BookMyShow and District, built with the modern **MERN (MongoDB, Express.js, React.js, Node.js)** technology stack. It delivers an immersive cinematic experience featuring a dark aesthetic, real-time seat availability, temporary seat locking, double-booking prevention, digital tickets with scannable QR verification, and a comprehensive administrative portal.

---

## 1. Project Objectives
- Provide a smooth cinema booking journey from movie discovery to digital ticket generation.
- Implement robust backend validation preventing race conditions and double bookings.
- Introduce atomic temporary seat locking with automatic expiration timers.
- Deliver an interactive seat selection layout with distinct seat categories (Premium vs. Regular).
- Implement role-based access control (Patrons vs. Administrators).
- Provide digital tickets embedded with cryptographic QR codes verifiable at the theater entrance.

---

## 2. Technology Stack

### Frontend:
- **Framework:** React.js (v18) bootstrapped with **Vite**
- **Styling:** Bootstrap 5, Custom Cinematic CSS3 with dark theme variables
- **Routing:** React Router DOM (v7)
- **HTTP Client:** Axios (with centralized interceptors & JWT handling)
- **Icons:** React Icons (FontAwesome / Bootstrap / Material)
- **Fonts:** Plus Jakarta Sans & Outfit (Google Fonts)

### Backend:
- **Runtime:** Node.js (ES6+ Modules)
- **Framework:** Express.js (v4)
- **Database ODM:** Mongoose (v8)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt.js password hashing
- **Security:** CORS credentials, parameterized MongoDB queries, input sanitization
- **QR Code Engine:** Node QRCode library (generates standalone Base64 Data URLs)

### Database:
- **Engine:** MongoDB Community Server / MongoDB Atlas
- **Collections:** Users, Movies, Cinemas, Screens, Shows, Bookings, Payments

---

## 3. Project Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React Frontend (Port 5173)                      │
│                                                                        │
│  [Discovery & Hero]  ──  [City & Showtimes]  ──  [Interactive Seats]  │
│          │                       │                       │             │
│   [Auth Context]         [City Context]         [Centralized API]      │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTP REST Requests + Bearer JWT
┌────────────────────────────────────▼───────────────────────────────────┐
│                       Express API Server (Port 5000)                   │
│                                                                        │
│  [Auth Middleware]   ──  [Role Guards]     ──  [Error Handlers]        │
│  [Movie Controller]  ──  [Show Controller] ──  [Booking Engine]        │
│  [QR Code Generator] ──  [Payment Sandbox] ──  [Conflict Detector]     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Mongoose ODM
┌────────────────────────────────────▼───────────────────────────────────┐
│                            MongoDB Database                            │
│                                                                        │
│  • Users (Hashed Passwords)           • Cinemas (Indore & Metro Hubs)  │
│  • Movies (Now Showing & Coming Soon) • Screens (Premium / Regular)    │
│  • Shows (Real-time Seat States)      • Bookings (Unique IMOV-ID)      │
│  • Payments (Transaction Ledger)                                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Epics & Features Implemented

### Epic 1: User Interface and Movie Discovery
- **Cinematic Dark Theme:** Rich navy & charcoal backgrounds with neon red and violet accents.
- **Home Hero Banner:** Featured blockbuster carousel with trailer modal player and instant booking CTA.
- **Movie Sections:** Now Showing, Coming Soon, Trending, and Top-Rated/Popular movies.
- **Movies Discovery Page:** Full text search, filter by Genre, Language, Year, and Rating, with multi-criteria sorting.
- **Movie Details Page:** Poster, backdrop, certification (U, UA, A), runtime, cast, director, and YouTube trailer integration.

### Epic 2: Cinema & City Management
- **City Selector:** Seamless city switching (Indore, Bhopal, Mumbai, Delhi, Pune, Bengaluru).
- **Cinema Aggregator:** Multiplex directory with address, facilities (Dolby Atmos, Recliners, Food Court), and screens.
- **Multi-Screen Support:** Each cinema hosts multiple auditoriums with unique seat capacities.

### Epic 3: Showtime & Interactive Seat Selection
- **Dynamic Show Schedule:** Retrieved dynamically from MongoDB for selected movies and dates.
- **Date Selector:** Today, Tomorrow, and upcoming dates carousel.
- **Interactive Auditorium Map:** Curved screen orientation, Premium vs Regular categories, rows & seat numbers.
- **Temporary Seat Locking:** 10-minute temporary seat lock preventing other users from claiming the same seats during checkout.
- **Double Booking Shield:** Strict validation before payment prevents race-condition double bookings.

### Epic 4: User Authentication & Profile
- **Patron Registration & Login:** Full name, email, phone, and bcrypt-hashed password.
- **JWT Protection:** Authorization headers with bearer tokens and automatic request interception.
- **User Profile:** Manage profile details, update phone, change password, and view booking metrics.

### Epic 5: Booking Management & Digital Tickets
- **Checkout Breakdown:** Base ticket price, convenience fees, and 18% GST calculation.
- **Mock Payment Sandbox & Razorpay Test Support:** Instant test authorization for mock cards, UPI, and Netbanking.
- **Digital Cinema Ticket:** Includes IMovies logo, poster, cinema name, audi, date, showtime, seat numbers, booking ID, and a high-resolution QR code.
- **Public Gate Pass Verification:** Staff can scan or open `/verify-ticket/:bookingId` to verify authenticity.
- **Cancellation & Instant Refund:** Patrons can cancel active bookings, immediately restoring auditorium seats.

### Epic 6: Admin Dashboard
- **Executive Analytics:** Total users, total movies, active cinemas, confirmed bookings, and gross revenue.
- **Movie Catalog Manager:** Add, edit, and delete movies with poster URLs, genres, and release status.
- **Cinema & Screen Manager:** Add multiplexes and configure auditorium capacities.
- **Showtime Scheduler:** Schedule shows with auditorium conflict prevention (rejects double bookings on the same screen/time).
- **Customer Oversight:** View all bookings and manage patron roles.

---

## 5. Folder Structure

```
movies/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── adminController.js    # Statistics & system management
│   │   ├── authController.js     # User registration & JWT login
│   │   ├── bookingController.js  # Seat locking, bookings & cancellations
│   │   ├── cinemaController.js   # Cinema multiplex management
│   │   ├── movieController.js    # Movie catalog & filter APIs
│   │   ├── paymentController.js  # Mock & Razorpay payment handling
│   │   ├── screenController.js   # Auditorium screen templates
│   │   └── showController.js     # Showtime schedules & seat maps
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & admin guard
│   │   └── errorMiddleware.js    # Centralized JSON error handler
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Cinema.js
│   │   ├── Movie.js
│   │   ├── Payment.js
│   │   ├── Screen.js
│   │   ├── Show.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── cinemaRoutes.js
│   │   ├── movieRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── screenRoutes.js
│   │   └── showRoutes.js
│   ├── seed/
│   │   └── seed.js               # Comprehensive 12-movie, 10-cinema database seeder
│   ├── utils/
│   │   ├── generateToken.js      # JWT generator
│   │   └── qrHelper.js           # QR code generator
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express server & API endpoints
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── DigitalTicket.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── MovieCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── TrailerModal.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Global user state & token storage
│   │   │   └── CityContext.jsx   # Selected city manager
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── BookingConfirmation.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── ComingSoon.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MovieDetails.jsx
│   │   │   ├── Movies.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── SeatBooking.jsx
│   │   │   ├── Showtimes.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   └── VerifyTicket.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios client with request/response interceptors
│   │   ├── App.jsx
│   │   ├── index.css             # Cinematic dark CSS styling
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 6. Installation & Execution Guide

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Community Server or MongoDB Atlas cluster

### Step 1: Clone or Navigate to Project
```bash
cd c:\Users\asus\OneDrive\Desktop\movies
```

### Step 2: Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/imovies
JWT_SECRET=imovies_super_secure_jwt_secret_key_2026_academic_project
CLIENT_URL=http://localhost:5173
TMDB_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 4: Seed the Database
Run the seed script in the backend directory to automatically populate 12 movies, 10 cinemas (with 5 in Indore), 20 screens, 480 showtimes, sample bookings, and demo accounts:
```bash
cd backend
npm run seed
```

### Step 5: Start the Application

**Run Backend API Server:**
```bash
cd backend
npm start
# Server starts on http://localhost:5000
```

**Run Frontend Development Server:**
```bash
cd frontend
npm run dev
# Frontend starts on http://localhost:5173
```

---

## 7. Default Credentials for Evaluation

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@imovies.com` | `adminpassword123` | Full Admin Console, Catalog CRUD, Showtime Scheduling |
| **Patron / User** | `user@imovies.com` | `userpassword123` | Movie Browsing, Seat Booking, Ticket History |

*(Note: The login page also features one-click quick-fill buttons for immediate evaluator testing).*

---

## 8. API Endpoint Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Service uptime and MongoDB connection state | Public |
| **POST** | `/api/auth/register` | Register patron account | Public |
| **POST** | `/api/auth/login` | Login and receive Bearer JWT | Public |
| **GET** | `/api/auth/me` | Fetch authenticated user profile | Private |
| **PUT** | `/api/auth/me` | Update name, phone, or password | Private |
| **GET** | `/api/movies` | Search, filter, and sort movies | Public |
| **GET** | `/api/movies/:id` | Full movie details with cast & trailer | Public |
| **GET** | `/api/movies/now-showing` | Retrieve currently released movies | Public |
| **GET** | `/api/movies/coming-soon` | Retrieve upcoming releases | Public |
| **GET** | `/api/cinemas` | List active cinemas by city | Public |
| **GET** | `/api/shows/movie/:movieId` | Get shows grouped by cinema for date | Public |
| **GET** | `/api/shows/:id/seats` | Real-time seat layout & lock status | Public |
| **POST** | `/api/bookings/lock-seats` | Temporarily hold seats for 10 minutes | Private |
| **POST** | `/api/payments/create-order`| Initialize payment order | Private |
| **POST** | `/api/payments/verify` | Cryptographically verify transaction | Private |
| **POST** | `/api/bookings/confirm` | Confirm booking & generate QR ticket | Private |
| **GET** | `/api/bookings/my-bookings` | Retrieve user's booking history | Private |
| **GET** | `/api/bookings/:id` | View specific digital ticket | Private |
| **POST** | `/api/bookings/:id/cancel` | Cancel booking & release seats | Private |
| **GET** | `/api/bookings/verify/:bookingId` | Public QR code admission gate pass check | Public |
| **GET** | `/api/admin/stats` | Executive business metrics & revenue | Admin |
| **POST** | `/api/shows` | Schedule show with conflict checks | Admin |

---

## 9. Verification & Testing

Both servers are currently configured and actively running:
- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Health Check Endpoint:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

All 8 automated integration test suites have been verified with complete end-to-end functionality including seat locking, double-booking prevention, payment verification, and digital QR ticket generation.

