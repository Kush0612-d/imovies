import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Cinema from '../models/Cinema.js';
import Screen from '../models/Screen.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import { generateTicketQR } from '../utils/qrHelper.js';
import { generateSeatMap } from '../controllers/showController.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies');
    console.log(`[Seed DB] Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Seed DB] Error: ${error.message}`);
    process.exit(1);
  }
};

const sampleUsers = [
  {
    name: 'Administrator',
    email: 'admin@imovies.com',
    phone: '9876543210',
    password: 'adminpassword123',
    role: 'admin'
  },
  {
    name: 'Rahul Sharma',
    email: 'user@imovies.com',
    phone: '9823456789',
    password: 'userpassword123',
    role: 'user'
  },
  {
    name: 'Ananya Verma',
    email: 'ananya@imovies.com',
    phone: '9812345678',
    password: 'password123',
    role: 'user'
  }
];

const sampleMovies = [
  {
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/rAiYTsqBkRefT471oU7x2P7gdrG.jpg',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    language: 'English',
    duration: 169,
    releaseDate: new Date('2024-10-15'),
    certification: 'UA',
    rating: 8.7,
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    director: 'Christopher Nolan',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    status: 'now-showing',
    isTrending: true,
    isPopular: true,
    bookingCount: 420
  },
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe.',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520QIq.jpg',
    genre: ['Sci-Fi', 'Action', 'Adventure'],
    language: 'English',
    duration: 166,
    releaseDate: new Date('2024-11-01'),
    certification: 'UA 16+',
    rating: 8.6,
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
    director: 'Denis Villeneuve',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    status: 'now-showing',
    isTrending: true,
    isPopular: true,
    bookingCount: 380
  },
  {
    title: 'Kalki 2898 AD',
    description: 'A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to the earth to protect the world from evil forces in a futuristic dystopian world.',
    poster: 'https://image.tmdb.org/t/p/w500/z0GZqT944Yqg5Qy955vK9Qz3fJz.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/9l105mRwyUVR0P4rB2gKjYk4xX3.jpg',
    genre: ['Action', 'Sci-Fi', 'Mythology'],
    language: 'Hindi',
    duration: 181,
    releaseDate: new Date('2024-09-20'),
    certification: 'UA',
    rating: 8.1,
    cast: ['Prabhas', 'Amitabh Bachchan', 'Deepika Padukone', 'Kamal Haasan'],
    director: 'Nag Ashwin',
    trailerUrl: 'https://www.youtube.com/watch?v=y1-w1pUAmSE',
    status: 'now-showing',
    isTrending: true,
    isPopular: true,
    bookingCount: 510
  },
  {
    title: 'Stree 2: Sarkate Ka Aatank',
    description: 'After the events of Stree, the town of Chanderi is being haunted again. This time, women are mysteriously abducted by a headless entity named Sarkata.',
    poster: 'https://image.tmdb.org/t/p/w500/hU1DkY9HqUjH7k2NqF3X5Z8qP.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/8h5E6k2kY7m3r1p6pQ5Z8qP.jpg',
    genre: ['Comedy', 'Horror'],
    language: 'Hindi',
    duration: 147,
    releaseDate: new Date('2024-08-15'),
    certification: 'UA',
    rating: 7.9,
    cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi', 'Abhishek Banerjee'],
    director: 'Amar Kaushik',
    trailerUrl: 'https://www.youtube.com/watch?v=KVnhe34X3tg',
    status: 'now-showing',
    isTrending: true,
    isPopular: true,
    bookingCount: 460
  },
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveGHfvITxyARZf.jpg',
    genre: ['Biography', 'Drama', 'History'],
    language: 'English',
    duration: 180,
    releaseDate: new Date('2024-07-21'),
    certification: 'A',
    rating: 8.9,
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    director: 'Christopher Nolan',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    status: 'now-showing',
    isTrending: false,
    isPopular: true,
    bookingCount: 395
  },
  {
    title: 'Deadpool & Wolverine',
    description: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary Deadpool behind him. But when his homeworld faces an existential threat, Wade must team up with Wolverine.',
    poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1jv8vEU.jpg',
    genre: ['Action', 'Comedy', 'Sci-Fi'],
    language: 'English',
    duration: 128,
    releaseDate: new Date('2024-07-26'),
    certification: 'A',
    rating: 8.2,
    cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Matthew Macfadyen'],
    director: 'Shawn Levy',
    trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    status: 'now-showing',
    isTrending: true,
    isPopular: true,
    bookingCount: 340
  },
  {
    title: 'Gladiator II',
    description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
    poster: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/euYIwmwkmz95mnExloguf0MqqDC.jpg',
    genre: ['Action', 'Adventure', 'Drama'],
    language: 'English',
    duration: 148,
    releaseDate: new Date('2024-11-15'),
    certification: 'UA 16+',
    rating: 8.0,
    cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
    director: 'Ridley Scott',
    trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
    status: 'now-showing',
    isTrending: true,
    isPopular: false,
    bookingCount: 210
  },
  {
    title: 'Singham Again',
    description: 'Bajirao Singham is back with his heroic cop squad confronting a high-stakes menace that threatens cross-border security and mythology-inspired vengeance.',
    poster: 'https://image.tmdb.org/t/p/w500/uU3r78lC2T0p8k2U8o3oU0q2N.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/b82q93mP7r1e0k2q7k1n8o.jpg',
    genre: ['Action', 'Drama'],
    language: 'Hindi',
    duration: 144,
    releaseDate: new Date('2024-11-01'),
    certification: 'UA',
    rating: 7.4,
    cast: ['Ajay Devgn', 'Kareena Kapoor Khan', 'Ranveer Singh', 'Akshay Kumar', 'Deepika Padukone'],
    director: 'Rohit Shetty',
    trailerUrl: 'https://www.youtube.com/watch?v=r0f8b8_sB5c',
    status: 'now-showing',
    isTrending: false,
    isPopular: true,
    bookingCount: 290
  },
  {
    title: 'Avatar: Fire and Ash',
    description: 'Jake Sully and Neytiri encounter a new, aggressive volcanic clan of Na\'vi known as the Ash People on Pandora.',
    poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/o07FWaqU198x6B4Z0p8k2U8o3o.jpg',
    genre: ['Sci-Fi', 'Action', 'Adventure'],
    language: 'English',
    duration: 190,
    releaseDate: new Date('2025-12-19'),
    certification: 'UA',
    rating: 0,
    cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Oona Chaplin'],
    director: 'James Cameron',
    trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    status: 'coming-soon',
    isTrending: true,
    isPopular: false,
    bookingCount: 0
  },
  {
    title: 'Ramayana: Part 1',
    description: 'An epic cinematic adaptation of the timeless Indian epic Ramayana, recounting the righteousness of Lord Rama and his triumph over evil.',
    poster: 'https://image.tmdb.org/t/p/w500/mK9k2bJ9vQe3R1k8o7P5Z8qP.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/pP5Z8qPmK9k2bJ9vQe3R1k8o7.jpg',
    genre: ['Action', 'Drama', 'Mythology'],
    language: 'Hindi',
    duration: 175,
    releaseDate: new Date('2025-11-05'),
    certification: 'U',
    rating: 0,
    cast: ['Ranbir Kapoor', 'Sai Pallavi', 'Yash', 'Sunny Deol'],
    director: 'Nitesh Tiwari',
    trailerUrl: 'https://www.youtube.com/watch?v=y1-w1pUAmSE',
    status: 'coming-soon',
    isTrending: true,
    isPopular: false,
    bookingCount: 0
  },
  {
    title: 'Mission: Impossible – The Final Reckoning',
    description: 'Ethan Hunt and his IMF team embark on their most dangerous mission yet: to track down a terrifying new weapon that threatens all of humanity before it falls into the wrong hands.',
    poster: 'https://image.tmdb.org/t/p/w500/z53D2VjM3n1b2c4D5E6F7G8H9I.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/k8rF1t2e3m4n5o6p7q8r9s0t1u.jpg',
    genre: ['Action', 'Thriller', 'Adventure'],
    language: 'English',
    duration: 160,
    releaseDate: new Date('2025-05-23'),
    certification: 'UA 16+',
    rating: 0,
    cast: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames', 'Simon Pegg'],
    director: 'Christopher McQuarrie',
    trailerUrl: 'https://www.youtube.com/watch?v=NOhDy4mRyo8',
    status: 'coming-soon',
    isTrending: false,
    isPopular: false,
    bookingCount: 0
  },
  {
    title: 'Pushpa 2: The Rule',
    description: 'Pushpa Raj commands his red sandalwood smuggling empire while facing relentless challenges from SP Bhanwar Singh Shekhawat in an explosive confrontation.',
    poster: 'https://image.tmdb.org/t/p/w500/bAH00z1U3s5o7P5Z8qPmK9k2bJ9.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/yT4mK9k2bJ9vQe3R1k8o7P5Z8q.jpg',
    genre: ['Action', 'Thriller', 'Crime'],
    language: 'Hindi',
    duration: 200,
    releaseDate: new Date('2024-12-05'),
    certification: 'A',
    rating: 8.3,
    cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    director: 'Sukumar',
    trailerUrl: 'https://www.youtube.com/watch?v=g3JUbgJB0dU',
    status: 'now-showing',
    isTrending: true,
    isPopular: true,
    bookingCount: 490
  }
];

// Fallback high quality poster placeholders if external images have issues
sampleMovies.forEach((m, idx) => {
  if (!m.poster || m.poster.includes('null')) {
    m.poster = `https://picsum.photos/seed/movie_${idx}/500/750`;
  }
  if (!m.backdrop) {
    m.backdrop = `https://picsum.photos/seed/backdrop_${idx}/1280/720`;
  }
});

const sampleCinemas = [
  // Minimum 5 cinemas in Indore as required
  {
    name: 'PVR INOX: Treasure Island Mall',
    address: '4th Floor, Treasure Island Mall, M.G. Road',
    city: 'Indore',
    facilities: ['Dolby Atmos', '4K Laser Projection', 'Recliner Seats', 'Gourmet Food Court', 'Valet Parking'],
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
    isActive: true
  },
  {
    name: 'Cinepolis: Phoenix Citadel Mall',
    address: 'MR-10 Road, Near Jhalaria',
    city: 'Indore',
    facilities: ['IMAX Laser', 'VIP Lounge', '4DX', 'Wheelchair Accessible', 'Dolby 7.1'],
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    isActive: true
  },
  {
    name: 'INOX: C21 Mall',
    address: 'Level 3, C21 Mall, AB Road',
    city: 'Indore',
    facilities: ['Dolby Atmos', 'Luxury Recliners', 'Cafeteria', 'Prime Parking'],
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&auto=format&fit=crop&q=80',
    isActive: true
  },
  {
    name: 'Carnival Cinemas: Malhar Mega Mall',
    address: 'AB Road, Near Vijay Nagar',
    city: 'Indore',
    facilities: ['Surround Sound', 'Concession Stand', 'Ample Parking'],
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80',
    isActive: true
  },
  {
    name: 'Velocity III Cinemas',
    address: 'Ring Road, Near Khajrana Square',
    city: 'Indore',
    facilities: ['Dolby Digital', 'Pushback Seats', 'Snack Bar', 'Air Conditioned'],
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=80',
    isActive: true
  },
  // Bhopal
  {
    name: 'Cinepolis: DB City Mall',
    address: 'Hoshangabad Road, Zone-I, Maharana Pratap Nagar',
    city: 'Bhopal',
    facilities: ['Dolby Atmos', 'VIP Recliners', 'Food Lounge', 'Parking'],
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
    isActive: true
  },
  // Mumbai
  {
    name: 'PVR P[XL]: Phoenix Palladium',
    address: 'Senapati Bapat Marg, Lower Parel',
    city: 'Mumbai',
    facilities: ['P[XL] Giant Screen', 'Dolby Atmos', 'Director\'s Cut', 'Valet Parking'],
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    isActive: true
  },
  // Delhi
  {
    name: 'PVR Directors Cut: Vasant Kunj',
    address: 'Ambience Mall, Nelson Mandela Marg, Vasant Kunj',
    city: 'Delhi',
    facilities: ['Luxury Dining', '4K Laser', 'Concierge Service', 'Recliners'],
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&auto=format&fit=crop&q=80',
    isActive: true
  },
  // Bengaluru
  {
    name: 'PVR: Forum Mall Koramangala',
    address: 'Hosur Road, Koramangala',
    city: 'Bengaluru',
    facilities: ['IMAX', 'Gold Class', 'Dolby Atmos', 'Food Court'],
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80',
    isActive: true
  },
  // Pune
  {
    name: 'INOX: Bund Garden',
    address: 'Camp, Bund Garden Road',
    city: 'Pune',
    facilities: ['Dolby Atmos', 'Recliner Seats', 'Food Court'],
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=80',
    isActive: true
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    try {
      await Movie.collection.dropIndexes();
    } catch (e) {
      // ignore if collection or index does not exist
    }
    await User.deleteMany();
    await Movie.deleteMany();
    await Cinema.deleteMany();
    await Screen.deleteMany();
    await Show.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();

    // 1. Create Users
    console.log('[Seed] Seeding Users...');
    const createdUsers = [];
    for (const u of sampleUsers) {
      // User model hashes password via pre-save hook
      const newUser = await User.create(u);
      createdUsers.push(newUser);
    }
    const adminUser = createdUsers.find(u => u.role === 'admin');
    const normalUser = createdUsers.find(u => u.role === 'user');

    console.log(`[Seed] Created ${createdUsers.length} users. Admin email: admin@imovies.com`);

    // 2. Create Movies
    console.log('[Seed] Seeding Movies...');
    const createdMovies = await Movie.insertMany(sampleMovies);
    console.log(`[Seed] Created ${createdMovies.length} movies.`);

    // 3. Create Cinemas and Screens
    console.log('[Seed] Seeding Cinemas & Screens...');
    const createdCinemas = [];
    const createdScreens = [];

    for (const cinemaData of sampleCinemas) {
      const cinema = await Cinema.create(cinemaData);
      createdCinemas.push(cinema);

      // Create at least 2 screens per cinema as required
      const screen1 = await Screen.create({
        cinemaId: cinema._id,
        screenName: 'Audi 1 - Dolby Atmos 4K',
        totalSeats: 60,
        rowsCount: 6,
        seatsPerRow: 10,
        seatCategories: [
          { name: 'Premium', price: 350, rows: ['A', 'B'] },
          { name: 'Regular', price: 220, rows: ['C', 'D', 'E', 'F'] }
        ]
      });

      const screen2 = await Screen.create({
        cinemaId: cinema._id,
        screenName: 'Audi 2 - Laser 7.1',
        totalSeats: 50,
        rowsCount: 5,
        seatsPerRow: 10,
        seatCategories: [
          { name: 'Premium', price: 300, rows: ['A', 'B'] },
          { name: 'Regular', price: 180, rows: ['C', 'D', 'E'] }
        ]
      });

      createdScreens.push(screen1, screen2);
      cinema.screens = [screen1._id, screen2._id];
      await cinema.save();
    }
    console.log(`[Seed] Created ${createdCinemas.length} cinemas with ${createdScreens.length} screens.`);

    // 4. Create Shows for Today and Upcoming Days
    console.log('[Seed] Scheduling Shows for movies...');
    const showtimes = ['09:00 AM', '12:30 PM', '03:45 PM', '06:30 PM', '09:45 PM'];

    // Generate dates: Today, Tomorrow, and next 5 days
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10)); // 'YYYY-MM-DD'
    }

    const nowShowingMovies = createdMovies.filter(m => m.status === 'now-showing');
    const createdShows = [];

    // Schedule shows for Indore cinemas and select other cinemas
    for (const cinema of createdCinemas) {
      const cinemaScreens = createdScreens.filter(s => s.cinemaId.toString() === cinema._id.toString());
      if (cinemaScreens.length === 0) continue;

      for (const showDate of dates) {
        // Schedule each screen with distinct movies and showtimes
        cinemaScreens.forEach((screen, screenIdx) => {
          // Select 2-3 movies for this screen
          const selectedMovies = [
            nowShowingMovies[(screenIdx) % nowShowingMovies.length],
            nowShowingMovies[(screenIdx + 2) % nowShowingMovies.length],
            nowShowingMovies[(screenIdx + 4) % nowShowingMovies.length]
          ];

          // Distribute showtimes across movies
          const times = screenIdx === 0 ? ['10:00 AM', '02:00 PM', '06:30 PM', '09:45 PM'] : ['11:30 AM', '03:30 PM', '07:30 PM', '10:30 PM'];

          times.forEach((time, tIdx) => {
            const movie = selectedMovies[tIdx % selectedMovies.length];
            const seats = generateSeatMap(screen);

            createdShows.push({
              movieId: movie._id,
              cinemaId: cinema._id,
              screenId: screen._id,
              showDate,
              startTime: time,
              ticketPrice: {
                premium: screen.seatCategories.find(c => c.name === 'Premium')?.price || 350,
                regular: screen.seatCategories.find(c => c.name === 'Regular')?.price || 220
              },
              seats,
              status: 'active'
            });
          });
        });
      }
    }

    const insertedShows = await Show.insertMany(createdShows);
    console.log(`[Seed] Created ${insertedShows.length} scheduled shows across cinemas and dates.`);

    // 5. Create Sample Bookings & Payments
    console.log('[Seed] Seeding sample bookings & tickets...');
    const targetShow = insertedShows[0];
    const targetMovie = createdMovies.find(m => m._id.toString() === targetShow.movieId.toString());
    const targetCinema = createdCinemas.find(c => c._id.toString() === targetShow.cinemaId.toString());
    const targetScreen = createdScreens.find(s => s._id.toString() === targetShow.screenId.toString());

    // Mark 2 seats as booked in target show
    targetShow.seats.forEach(seat => {
      if (['A4', 'A5'].includes(seat.seatNumber)) {
        seat.status = 'booked';
      }
    });
    await targetShow.save();

    const bookingId = `IMOV-${dates[0].replace(/-/g, '')}-7821`;
    const secureVerificationCode = 'B7F93E412A0D46';

    const qrDataUrl = await generateTicketQR({
      bookingId,
      movieTitle: targetMovie.title,
      cinemaName: targetCinema.name,
      showDate: targetShow.showDate,
      startTime: targetShow.startTime,
      seats: 'A4, A5',
      secureVerificationCode
    });

    const samplePayment = await Payment.create({
      userId: normalUser._id,
      amount: 780,
      paymentMethod: 'mock_upi',
      transactionId: `TXN-SEED-${Date.now()}`,
      paymentStatus: 'successful'
    });

    const sampleBooking = await Booking.create({
      bookingId,
      userId: normalUser._id,
      showId: targetShow._id,
      movieId: targetMovie._id,
      cinemaId: targetCinema._id,
      screenId: targetScreen._id,
      seats: [
        { seatNumber: 'A4', category: 'Premium', price: 350 },
        { seatNumber: 'A5', category: 'Premium', price: 350 }
      ],
      baseAmount: 700,
      convenienceFee: 50,
      taxAmount: 30,
      totalAmount: 780,
      paymentId: samplePayment._id,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      qrCodeDataUrl: qrDataUrl,
      secureVerificationCode
    });

    samplePayment.bookingId = sampleBooking._id;
    await samplePayment.save();

    console.log('[Seed] Sample booking created successfully! ID:', bookingId);
    console.log('\n=============================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Admin Account: admin@imovies.com / adminpassword123');
    console.log('Patron Account: user@imovies.com / userpassword123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Failed]:', error);
    process.exit(1);
  }
};

seedDatabase();

