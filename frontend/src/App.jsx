import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Movies from './pages/Movies';
import ComingSoon from './pages/ComingSoon';
import MovieDetails from './pages/MovieDetails';
import Showtimes from './pages/Showtimes';
import SeatBooking from './pages/SeatBooking';
import Checkout from './pages/Checkout';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import UserProfile from './pages/UserProfile';
import VerifyTicket from './pages/VerifyTicket';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// Route guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/showtimes/:movieId" element={<Showtimes />} />
          <Route path="/seat-selection/:showId" element={<SeatBooking />} />
          
          {/* Protected routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-confirmation/:id"
            element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Ticket Verification (Public/Staff) */}
          <Route path="/verify-ticket/:bookingId" element={<VerifyTicket />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;

