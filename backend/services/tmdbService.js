/**
 * TMDB Service for optional external movie data enrichment.
 * If TMDB_API_KEY is not configured or fails, smoothly falls back to local database data.
 */
export const fetchTmdbTrendingMovies = async () => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.results || null;
  } catch (error) {
    console.warn('[TMDB Service] Fetch failed, falling back to local MongoDB:', error.message);
    return null;
  }
};

export const fetchTmdbMovieDetails = async (tmdbId) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey || !tmdbId) return null;

  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&append_to_response=videos,credits`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn('[TMDB Service] Movie details fetch failed:', error.message);
    return null;
  }
};

