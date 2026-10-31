import { sampleMovies, sampleCinemas, sampleUsers } from '../seed/seedData.js';

class MemoryStore {
  constructor() {
    this.movies = [...sampleMovies];
    this.cinemas = [...sampleCinemas];
    this.screens = [];
    this.shows = [];
    this.bookings = [];
    this.users = [...sampleUsers];
    this.init();
  }

  init() {
    // Generate screens for cinemas
    let screenCounter = 1;
    this.cinemas.forEach((cinema) => {
      const s1 = {
        _id: `screen_mem_${screenCounter++}`,
        cinemaId: cinema._id,
        screenName: 'Audi 1 - Dolby Atmos 4K',
        totalSeats: 60,
        rowsCount: 6,
        seatsPerRow: 10,
        seatCategories: [
          { name: 'Premium', price: 350, rows: ['A', 'B'] },
          { name: 'Regular', price: 220, rows: ['C', 'D', 'E', 'F'] }
        ]
      };
      const s2 = {
        _id: `screen_mem_${screenCounter++}`,
        cinemaId: cinema._id,
        screenName: 'Audi 2 - Laser 7.1',
        totalSeats: 50,
        rowsCount: 5,
        seatsPerRow: 10,
        seatCategories: [
          { name: 'Premium', price: 300, rows: ['A', 'B'] },
          { name: 'Regular', price: 180, rows: ['C', 'D', 'E'] }
        ]
      };
      cinema.screens = [s1._id, s2._id];
      this.screens.push(s1, s2);
    });

    // Generate shows
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const nowShowingMovies = this.movies.filter(m => m.status === 'now-showing');
    let showId = 1;

    for (const cinema of this.cinemas) {
      const cinemaScreens = this.screens.filter(s => s.cinemaId === cinema._id);
      for (const showDate of dates) {
        cinemaScreens.forEach((screen, screenIdx) => {
          const selectedMovies = [
            nowShowingMovies[screenIdx % nowShowingMovies.length],
            nowShowingMovies[(screenIdx + 2) % nowShowingMovies.length],
            nowShowingMovies[(screenIdx + 4) % nowShowingMovies.length]
          ];
          const times = screenIdx === 0 ? ['10:00 AM', '02:00 PM', '06:30 PM', '09:45 PM'] : ['11:30 AM', '03:30 PM', '07:30 PM', '10:30 PM'];

          times.forEach((time, tIdx) => {
            const movie = selectedMovies[tIdx % selectedMovies.length];
            const seats = [];
            const rows = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, screen.rowsCount);
            rows.forEach((rowName) => {
              const isPremium = ['A', 'B'].includes(rowName);
              for (let c = 1; c <= 10; c++) {
                seats.push({
                  seatNumber: `${rowName}${c}`,
                  row: rowName,
                  col: c,
                  category: isPremium ? 'Premium' : 'Regular',
                  price: isPremium ? 350 : 220,
                  status: 'available',
                  lockedUntil: null,
                  lockedBy: null
                });
              }
            });

            this.shows.push({
              _id: `show_mem_${showId++}`,
              movieId: movie,
              cinemaId: cinema,
              screenId: screen,
              showDate,
              startTime: time,
              ticketPrice: { premium: 350, regular: 220 },
              seats,
              status: 'active'
            });
          });
        });
      }
    }
  }
}

export const memoryStore = new MemoryStore();
