import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  FaChartLine,
  FaFilm,
  FaCity,
  FaTv,
  FaCalendarAlt,
  FaTicketAlt,
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCheck,
  FaTimes,
  FaRupeeSign,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  // Data states for admin modules
  const [moviesList, setMoviesList] = useState([]);
  const [cinemasList, setCinemasList] = useState([]);
  const [screensList, setScreensList] = useState([]);
  const [showsList, setShowsList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Modals & form states
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    poster: '',
    backdrop: '',
    genre: 'Action, Sci-Fi',
    language: 'Hindi',
    duration: 150,
    releaseDate: new Date().toISOString().slice(0, 10),
    certification: 'UA',
    rating: 8.0,
    director: '',
    cast: 'Actor 1, Actor 2',
    trailerUrl: '',
    status: 'now-showing'
  });

  const [showCinemaModal, setShowCinemaModal] = useState(false);
  const [cinemaForm, setCinemaForm] = useState({
    name: '',
    address: '',
    city: 'Indore',
    facilities: 'Dolby Atmos, Recliner Seats, Parking'
  });

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    movieId: '',
    cinemaId: '',
    screenId: '',
    showDate: new Date().toISOString().slice(0, 10),
    startTime: '06:30 PM',
    premiumPrice: 350,
    regularPrice: 220
  });

  const [bookingSearch, setBookingSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Fetch initial summary stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/stats');
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch data when switching tabs
  useEffect(() => {
    if (activeTab === 'movies') fetchMovies();
    if (activeTab === 'cinemas') fetchCinemas();
    if (activeTab === 'screens') fetchScreens();
    if (activeTab === 'shows') fetchShows();
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const showNotification = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: '', text: '' }), 4000);
  };

  // --- Module A: Movies ---
  const fetchMovies = async () => {
    try {
      const { data } = await API.get('/movies');
      setMoviesList(data.movies || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...movieForm,
        genre: typeof movieForm.genre === 'string' ? movieForm.genre.split(',').map(s => s.trim()) : movieForm.genre,
        cast: typeof movieForm.cast === 'string' ? movieForm.cast.split(',').map(s => s.trim()) : movieForm.cast
      };

      if (editingMovie) {
        await API.put(`/movies/${editingMovie._id}`, payload);
        showNotification('success', 'Movie updated successfully');
      } else {
        await API.post('/movies', payload);
        showNotification('success', 'Movie created successfully');
      }
      setShowMovieModal(false);
      setEditingMovie(null);
      fetchMovies();
      fetchStats();
    } catch (err) {
      showNotification('danger', err.response?.data?.message || 'Failed to save movie');
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      await API.delete(`/movies/${id}`);
      showNotification('success', 'Movie deleted successfully');
      fetchMovies();
      fetchStats();
    } catch (err) {
      showNotification('danger', 'Failed to delete movie');
    }
  };

  // --- Module B: Cinemas ---
  const fetchCinemas = async () => {
    try {
      const { data } = await API.get('/cinemas');
      setCinemasList(data.cinemas || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCinema = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...cinemaForm,
        facilities: cinemaForm.facilities.split(',').map(s => s.trim())
      };
      await API.post('/cinemas', payload);
      showNotification('success', 'Cinema created successfully');
      setShowCinemaModal(false);
      fetchCinemas();
      fetchStats();
    } catch (err) {
      showNotification('danger', err.response?.data?.message || 'Failed to create cinema');
    }
  };

  const handleDeleteCinema = async (id) => {
    if (!window.confirm('Delete cinema and associated screens?')) return;
    try {
      await API.delete(`/cinemas/${id}`);
      showNotification('success', 'Cinema deleted');
      fetchCinemas();
      fetchStats();
    } catch (err) {
      showNotification('danger', 'Failed to delete cinema');
    }
  };

  // --- Module C: Screens ---
  const fetchScreens = async () => {
    try {
      const cinRes = await API.get('/cinemas');
      setCinemasList(cinRes.data.cinemas || []);
      if (cinRes.data.cinemas?.length > 0) {
        const scRes = await API.get(`/screens/cinema/${cinRes.data.cinemas[0]._id}`);
        setScreensList(scRes.data.screens || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Module D: Shows ---
  const fetchShows = async () => {
    try {
      const [shRes, mRes, cRes] = await Promise.all([
        API.get('/shows'),
        API.get('/movies'),
        API.get('/cinemas')
      ]);
      setShowsList(shRes.data.shows || []);
      setMoviesList(mRes.data.movies || []);
      setCinemasList(cRes.data.cinemas || []);

      if (mRes.data.movies?.length > 0 && cRes.data.cinemas?.length > 0) {
        const firstCinema = cRes.data.cinemas[0];
        const scRes = await API.get(`/screens/cinema/${firstCinema._id}`);
        setScreensList(scRes.data.screens || []);
        setScheduleForm(prev => ({
          ...prev,
          movieId: mRes.data.movies[0]._id,
          cinemaId: firstCinema._id,
          screenId: scRes.data.screens[0]?._id || ''
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCinemaChangeForSchedule = async (cinemaId) => {
    setScheduleForm(prev => ({ ...prev, cinemaId }));
    try {
      const { data } = await API.get(`/screens/cinema/${cinemaId}`);
      setScreensList(data.screens || []);
      if (data.screens?.length > 0) {
        setScheduleForm(prev => ({ ...prev, screenId: data.screens[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleShow = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        movieId: scheduleForm.movieId,
        cinemaId: scheduleForm.cinemaId,
        screenId: scheduleForm.screenId,
        showDate: scheduleForm.showDate,
        startTime: scheduleForm.startTime,
        ticketPrice: {
          premium: Number(scheduleForm.premiumPrice),
          regular: Number(scheduleForm.regularPrice)
        }
      };

      await API.post('/shows', payload);
      showNotification('success', 'Showtime scheduled successfully!');
      setShowScheduleModal(false);
      fetchShows();
      fetchStats();
    } catch (err) {
      showNotification('danger', err.response?.data?.message || 'Conflict detected! Showtime scheduling failed.');
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Delete scheduled show?')) return;
    try {
      await API.delete(`/shows/${id}`);
      showNotification('success', 'Show deleted');
      fetchShows();
      fetchStats();
    } catch (err) {
      showNotification('danger', 'Failed to delete show');
    }
  };

  // --- Module E: Bookings ---
  const fetchBookings = async () => {
    try {
      const { data } = await API.get('/admin/bookings', {
        params: { search: bookingSearch }
      });
      setBookingsList(data.bookings || []);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Module F: Users ---
  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/admin/users', {
        params: { search: userSearch }
      });
      setUsersList(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUserRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await API.put(`/admin/users/${user._id}/role`, { role: newRole });
      showNotification('success', `User role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      showNotification('danger', 'Failed to update user role');
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <span className="badge bg-warning text-dark p-2">ADMIN</span>
            <span>Management Console</span>
          </h2>
          <p className="text-muted small mb-0">
            System administration, movie releases, cinema schedules, bookings, and customer oversight.
          </p>
        </div>
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} mb-4`}>
          {alertMsg.text}
        </div>
      )}

      {/* Admin Module Navigation Tabs */}
      <div className="glass-panel p-2 mb-4 d-flex gap-2 overflow-x-auto">
        <button
          className={`btn btn-sm ${activeTab === 'stats' ? 'btn-cinema-primary' : 'btn-cinema-secondary'}`}
          onClick={() => setActiveTab('stats')}
        >
          <FaChartLine className="me-1" /> Dashboard Overview
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'movies' ? 'btn-cinema-primary' : 'btn-cinema-secondary'}`}
          onClick={() => setActiveTab('movies')}
        >
          <FaFilm className="me-1" /> Movies ({moviesList.length || '...'})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'cinemas' ? 'btn-cinema-primary' : 'btn-cinema-secondary'}`}
          onClick={() => setActiveTab('cinemas')}
        >
          <FaCity className="me-1" /> Cinemas
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'shows' ? 'btn-cinema-primary' : 'btn-cinema-secondary'}`}
          onClick={() => setActiveTab('shows')}
        >
          <FaCalendarAlt className="me-1" /> Showtimes & Schedules
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'bookings' ? 'btn-cinema-primary' : 'btn-cinema-secondary'}`}
          onClick={() => setActiveTab('bookings')}
        >
          <FaTicketAlt className="me-1" /> All Bookings
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'users' ? 'btn-cinema-primary' : 'btn-cinema-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers className="me-1" /> Patrons & Users
        </button>
      </div>

      {/* TAB 1: OVERVIEW STATS */}
      {activeTab === 'stats' && (
        <div>
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-danger"></div>
            </div>
          ) : stats ? (
            <div>
              {/* Statistics Cards */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-4 col-lg-2">
                  <div className="glass-panel p-3 text-center">
                    <div className="text-muted small">Total Users</div>
                    <div className="fs-3 fw-bold text-white mt-1">{stats.totalUsers}</div>
                  </div>
                </div>
                <div className="col-6 col-md-4 col-lg-2">
                  <div className="glass-panel p-3 text-center">
                    <div className="text-muted small">Total Movies</div>
                    <div className="fs-3 fw-bold text-white mt-1">{stats.totalMovies}</div>
                  </div>
                </div>
                <div className="col-6 col-md-4 col-lg-2">
                  <div className="glass-panel p-3 text-center">
                    <div className="text-muted small">Cinemas</div>
                    <div className="fs-3 fw-bold text-white mt-1">{stats.totalCinemas}</div>
                  </div>
                </div>
                <div className="col-6 col-md-4 col-lg-2">
                  <div className="glass-panel p-3 text-center">
                    <div className="text-muted small">Confirmed Bookings</div>
                    <div className="fs-3 fw-bold text-success mt-1">{stats.totalBookings}</div>
                  </div>
                </div>
                <div className="col-6 col-md-4 col-lg-2">
                  <div className="glass-panel p-3 text-center">
                    <div className="text-muted small">Active Shows</div>
                    <div className="fs-3 fw-bold text-primary mt-1">{stats.upcomingShows}</div>
                  </div>
                </div>
                <div className="col-6 col-md-4 col-lg-2">
                  <div className="glass-panel p-3 text-center">
                    <div className="text-muted small">Gross Revenue</div>
                    <div className="fs-3 fw-bold text-warning mt-1">₹{stats.totalRevenue}</div>
                  </div>
                </div>
              </div>

              {/* Quick Admin Actions */}
              <div className="glass-panel p-4 mb-4">
                <h5 className="fw-bold text-white mb-3">Quick Actions</h5>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-cinema-primary btn-sm d-flex align-items-center gap-1"
                    onClick={() => {
                      setEditingMovie(null);
                      setShowMovieModal(true);
                    }}
                  >
                    <FaPlus /> Add New Movie
                  </button>
                  <button
                    className="btn btn-cinema-secondary btn-sm d-flex align-items-center gap-1"
                    onClick={() => setShowCinemaModal(true)}
                  >
                    <FaPlus /> Add Cinema Multiplex
                  </button>
                  <button
                    className="btn btn-cinema-secondary btn-sm d-flex align-items-center gap-1"
                    onClick={() => {
                      fetchShows();
                      setShowScheduleModal(true);
                    }}
                  >
                    <FaCalendarAlt /> Schedule Movie Showtime
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 2: MOVIES MANAGEMENT */}
      {activeTab === 'movies' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-white mb-0">Movie Catalog ({moviesList.length})</h5>
            <button
              className="btn btn-cinema-primary btn-sm d-flex align-items-center gap-1"
              onClick={() => {
                setEditingMovie(null);
                setMovieForm({
                  title: '',
                  description: '',
                  poster: '',
                  backdrop: '',
                  genre: 'Action, Sci-Fi',
                  language: 'Hindi',
                  duration: 150,
                  releaseDate: new Date().toISOString().slice(0, 10),
                  certification: 'UA',
                  rating: 8.0,
                  director: '',
                  cast: 'Actor 1, Actor 2',
                  trailerUrl: '',
                  status: 'now-showing'
                });
                setShowMovieModal(true);
              }}
            >
              <FaPlus /> Add Movie
            </button>
          </div>

          <div className="table-responsive glass-panel p-3">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead>
                <tr className="text-muted small">
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Language / Cert</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Bookings</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {moviesList.map(m => (
                  <tr key={m._id}>
                    <td style={{ width: '60px' }}>
                      <img src={m.poster} alt={m.title} style={{ width: '40px', height: '55px', objectFit: 'cover' }} className="rounded" />
                    </td>
                    <td>
                      <div className="fw-bold text-white">{m.title}</div>
                      <small className="text-muted">{m.genre?.join(', ')}</small>
                    </td>
                    <td>{m.language} <span className="badge bg-secondary">{m.certification}</span></td>
                    <td>
                      <span className={`badge ${m.status === 'now-showing' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td>★ {m.rating || 'N/A'}</td>
                    <td>{m.bookingCount || 0}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          setEditingMovie(m);
                          setMovieForm({
                            ...m,
                            genre: m.genre?.join(', '),
                            cast: m.cast?.join(', '),
                            releaseDate: m.releaseDate ? new Date(m.releaseDate).toISOString().slice(0, 10) : ''
                          });
                          setShowMovieModal(true);
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteMovie(m._id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CINEMAS */}
      {activeTab === 'cinemas' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-white mb-0">Cinemas ({cinemasList.length})</h5>
            <button className="btn btn-cinema-primary btn-sm d-flex align-items-center gap-1" onClick={() => setShowCinemaModal(true)}>
              <FaPlus /> Add Cinema
            </button>
          </div>

          <div className="row g-3">
            {cinemasList.map(c => (
              <div key={c._id} className="col-md-6">
                <div className="glass-panel p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="fw-bold text-white mb-0">{c.name}</h5>
                      <span className="badge bg-danger">{c.city}</span>
                    </div>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCinema(c._id)}>
                      <FaTrash />
                    </button>
                  </div>
                  <p className="text-muted small mb-2">{c.address}</p>
                  <div className="d-flex flex-wrap gap-1">
                    {c.facilities?.map((f, i) => (
                      <span key={i} className="badge bg-dark border border-secondary text-muted small">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SHOWS */}
      {activeTab === 'shows' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-white mb-0">Scheduled Shows ({showsList.length})</h5>
            <button
              className="btn btn-cinema-primary btn-sm d-flex align-items-center gap-1"
              onClick={() => {
                fetchShows();
                setShowScheduleModal(true);
              }}
            >
              <FaPlus /> Schedule New Show
            </button>
          </div>

          <div className="table-responsive glass-panel p-3">
            <table className="table table-dark table-hover mb-0 align-middle small">
              <thead>
                <tr className="text-muted">
                  <th>Movie</th>
                  <th>Cinema</th>
                  <th>Screen</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Ticket Price</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {showsList.slice(0, 30).map(s => (
                  <tr key={s._id}>
                    <td className="fw-bold text-white">{s.movieId?.title || 'Movie'}</td>
                    <td>{s.cinemaId?.name} ({s.cinemaId?.city})</td>
                    <td>{s.screenId?.screenName || 'Audi 1'}</td>
                    <td>{s.showDate}</td>
                    <td className="text-success fw-bold">{s.startTime}</td>
                    <td>P: ₹{s.ticketPrice?.premium} | R: ₹{s.ticketPrice?.regular}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => handleDeleteShow(s._id)}>
                        <FaTrash size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-white mb-0">All Bookings ({bookingsList.length})</h5>
            <div className="input-group" style={{ maxWidth: '300px' }}>
              <input
                type="text"
                className="form-control form-control-cinema form-control-sm"
                placeholder="Search Booking ID..."
                value={bookingSearch}
                onChange={e => setBookingSearch(e.target.value)}
              />
              <button className="btn btn-cinema-primary btn-sm" onClick={fetchBookings}>
                <FaSearch />
              </button>
            </div>
          </div>

          <div className="table-responsive glass-panel p-3">
            <table className="table table-dark table-hover mb-0 align-middle small">
              <thead>
                <tr className="text-muted">
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Movie</th>
                  <th>Cinema</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookingsList.map(b => (
                  <tr key={b._id}>
                    <td className="font-monospace text-warning fw-bold">{b.bookingId}</td>
                    <td>
                      <div className="fw-semibold text-white">{b.userId?.name || 'Customer'}</div>
                      <small className="text-muted">{b.userId?.email}</small>
                    </td>
                    <td>{b.movieId?.title}</td>
                    <td>{b.cinemaId?.name}</td>
                    <td>{b.seats?.map(s => s.seatNumber).join(', ')}</td>
                    <td className="fw-bold text-white">₹{b.totalAmount}</td>
                    <td>
                      <span className={`badge ${b.bookingStatus === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: USERS */}
      {activeTab === 'users' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-white mb-0">Registered Users ({usersList.length})</h5>
            <div className="input-group" style={{ maxWidth: '300px' }}>
              <input
                type="text"
                className="form-control form-control-cinema form-control-sm"
                placeholder="Search name or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
              <button className="btn btn-cinema-primary btn-sm" onClick={fetchUsers}>
                <FaSearch />
              </button>
            </div>
          </div>

          <div className="table-responsive glass-panel p-3">
            <table className="table table-dark table-hover mb-0 align-middle small">
              <thead>
                <tr className="text-muted">
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u._id}>
                    <td className="fw-bold text-white">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{u.createdAt?.slice(0, 10)}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-info py-0 px-2"
                        onClick={() => toggleUserRole(u)}
                      >
                        {u.role === 'admin' ? 'Demote to User' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MOVIE MODAL */}
      {showMovieModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark text-light border border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold text-white">
                  {editingMovie ? 'Edit Movie Details' : 'Add New Movie Release'}
                </h5>
                <button type="button" className="btn btn-sm text-light p-0 border-0" onClick={() => setShowMovieModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSaveMovie}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label small text-muted">Movie Title</label>
                      <input
                        type="text"
                        className="form-control form-control-cinema"
                        value={movieForm.title}
                        onChange={e => setMovieForm({ ...movieForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small text-muted">Status</label>
                      <select
                        className="form-select form-control-cinema"
                        value={movieForm.status}
                        onChange={e => setMovieForm({ ...movieForm, status: e.target.value })}
                      >
                        <option value="now-showing">Now Showing</option>
                        <option value="coming-soon">Coming Soon</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-muted">Description / Synopsis</label>
                      <textarea
                        rows="3"
                        className="form-control form-control-cinema"
                        value={movieForm.description}
                        onChange={e => setMovieForm({ ...movieForm, description: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small text-muted">Poster URL</label>
                      <input
                        type="url"
                        className="form-control form-control-cinema"
                        value={movieForm.poster}
                        onChange={e => setMovieForm({ ...movieForm, poster: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-muted">Backdrop Image URL</label>
                      <input
                        type="url"
                        className="form-control form-control-cinema"
                        value={movieForm.backdrop}
                        onChange={e => setMovieForm({ ...movieForm, backdrop: e.target.value })}
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="form-label small text-muted">Genre (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control form-control-cinema"
                        value={movieForm.genre}
                        onChange={e => setMovieForm({ ...movieForm, genre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="form-label small text-muted">Language</label>
                      <input
                        type="text"
                        className="form-control form-control-cinema"
                        value={movieForm.language}
                        onChange={e => setMovieForm({ ...movieForm, language: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="form-label small text-muted">Duration (Mins)</label>
                      <input
                        type="number"
                        className="form-control form-control-cinema"
                        value={movieForm.duration}
                        onChange={e => setMovieForm({ ...movieForm, duration: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="form-label small text-muted">Certification</label>
                      <select
                        className="form-select form-control-cinema"
                        value={movieForm.certification}
                        onChange={e => setMovieForm({ ...movieForm, certification: e.target.value })}
                      >
                        <option value="U">U</option>
                        <option value="UA">UA</option>
                        <option value="UA 13+">UA 13+</option>
                        <option value="UA 16+">UA 16+</option>
                        <option value="A">A</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small text-muted">Director</label>
                      <input
                        type="text"
                        className="form-control form-control-cinema"
                        value={movieForm.director}
                        onChange={e => setMovieForm({ ...movieForm, director: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-muted">Trailer YouTube Link</label>
                      <input
                        type="url"
                        className="form-control form-control-cinema"
                        value={movieForm.trailerUrl}
                        onChange={e => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-cinema-secondary btn-sm" onClick={() => setShowMovieModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema-primary btn-sm">
                    Save Movie
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ADD CINEMA MODAL */}
      {showCinemaModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-light border border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold text-white">Add Cinema Multiplex</h5>
                <button type="button" className="btn btn-sm text-light p-0 border-0" onClick={() => setShowCinemaModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSaveCinema}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-muted">Cinema Name</label>
                    <input
                      type="text"
                      className="form-control form-control-cinema"
                      placeholder="e.g. Cinepolis: Velocity Mall"
                      value={cinemaForm.name}
                      onChange={e => setCinemaForm({ ...cinemaForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-muted">City</label>
                    <select
                      className="form-select form-control-cinema"
                      value={cinemaForm.city}
                      onChange={e => setCinemaForm({ ...cinemaForm, city: e.target.value })}
                    >
                      <option value="Indore">Indore</option>
                      <option value="Bhopal">Bhopal</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Pune">Pune</option>
                      <option value="Bengaluru">Bengaluru</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-muted">Address</label>
                    <input
                      type="text"
                      className="form-control form-control-cinema"
                      placeholder="Street, Mall, Area"
                      value={cinemaForm.address}
                      onChange={e => setCinemaForm({ ...cinemaForm, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-muted">Facilities (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control form-control-cinema"
                      value={cinemaForm.facilities}
                      onChange={e => setCinemaForm({ ...cinemaForm, facilities: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-cinema-secondary btn-sm" onClick={() => setShowCinemaModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema-primary btn-sm">
                    Create Cinema
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE SHOW MODAL (With Screen Conflict Checking) */}
      {showScheduleModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-light border border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold text-white">Schedule Movie Showtime</h5>
                <button type="button" className="btn btn-sm text-light p-0 border-0" onClick={() => setShowScheduleModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleScheduleShow}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-muted">Select Movie</label>
                    <select
                      className="form-select form-control-cinema"
                      value={scheduleForm.movieId}
                      onChange={e => setScheduleForm({ ...scheduleForm, movieId: e.target.value })}
                      required
                    >
                      {moviesList.map(m => (
                        <option key={m._id} value={m._id}>{m.title} ({m.language})</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Select Cinema</label>
                    <select
                      className="form-select form-control-cinema"
                      value={scheduleForm.cinemaId}
                      onChange={e => handleCinemaChangeForSchedule(e.target.value)}
                      required
                    >
                      {cinemasList.map(c => (
                        <option key={c._id} value={c._id}>{c.name} ({c.city})</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Auditorium / Screen</label>
                    <select
                      className="form-select form-control-cinema"
                      value={scheduleForm.screenId}
                      onChange={e => setScheduleForm({ ...scheduleForm, screenId: e.target.value })}
                      required
                    >
                      {screensList.map(sc => (
                        <option key={sc._id} value={sc._id}>{sc.screenName} ({sc.totalSeats} seats)</option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-muted">Show Date</label>
                      <input
                        type="date"
                        className="form-control form-control-cinema"
                        value={scheduleForm.showDate}
                        onChange={e => setScheduleForm({ ...scheduleForm, showDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">Start Time</label>
                      <input
                        type="text"
                        className="form-control form-control-cinema"
                        placeholder="e.g. 06:30 PM"
                        value={scheduleForm.startTime}
                        onChange={e => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small text-muted">Premium Price (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-cinema"
                        value={scheduleForm.premiumPrice}
                        onChange={e => setScheduleForm({ ...scheduleForm, premiumPrice: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">Regular Price (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-cinema"
                        value={scheduleForm.regularPrice}
                        onChange={e => setScheduleForm({ ...scheduleForm, regularPrice: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-cinema-secondary btn-sm" onClick={() => setShowScheduleModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema-primary btn-sm">
                    Schedule Show
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

