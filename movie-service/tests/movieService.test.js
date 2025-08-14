const { sequelize } = require('../src/models');
const movieService = require('../src/services/movieService');

// Set up test database
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Movie Service', () => {
  test('should create a new movie', async () => {
    const movieData = {
      title: 'Test Movie',
      overview: 'Test overview',
      releaseDate: '2023-01-01',
      runtime: 120,
    };

    const movie = await movieService.createMovie(movieData);

    expect(movie).toBeDefined();
    expect(movie.title).toBe(movieData.title);
    expect(movie.overview).toBe(movieData.overview);
    expect(movie.releaseDate).toBe(movieData.releaseDate);
    expect(movie.runtime).toBe(movieData.runtime);
  });

  test('should get a movie by ID', async () => {
    // Create a movie first
    const movieData = {
      title: 'Test Movie 2',
      overview: 'Test overview 2',
      releaseDate: '2023-01-02',
      runtime: 90,
    };

    const createdMovie = await movieService.createMovie(movieData);

    // Get the movie by ID
    const movie = await movieService.getMovieById(createdMovie.id);

    expect(movie).toBeDefined();
    expect(movie.id).toBe(createdMovie.id);
    expect(movie.title).toBe(movieData.title);
  });

  test('should update a movie', async () => {
    // Create a movie first
    const movieData = {
      title: 'Test Movie 3',
      overview: 'Test overview 3',
      releaseDate: '2023-01-03',
      runtime: 150,
    };

    const createdMovie = await movieService.createMovie(movieData);

    // Update the movie
    const updateData = {
      title: 'Updated Test Movie 3',
      runtime: 160,
    };

    const updatedMovie = await movieService.updateMovie(createdMovie.id, updateData);

    expect(updatedMovie).toBeDefined();
    expect(updatedMovie.id).toBe(createdMovie.id);
    expect(updatedMovie.title).toBe(updateData.title);
    expect(updatedMovie.runtime).toBe(updateData.runtime);
    expect(updatedMovie.overview).toBe(movieData.overview); // Should remain unchanged
  });

  test('should delete a movie', async () => {
    // Create a movie first
    const movieData = {
      title: 'Test Movie 4',
      overview: 'Test overview 4',
      releaseDate: '2023-01-04',
      runtime: 110,
    };

    const createdMovie = await movieService.createMovie(movieData);

    // Delete the movie
    const result = await movieService.deleteMovie(createdMovie.id);

    expect(result).toBe(true);

    // Try to get the deleted movie
    const movie = await movieService.getMovieById(createdMovie.id);
    expect(movie).toBeNull();
  });

  test('should get all movies with pagination', async () => {
    // Create some movies
    await movieService.createMovie({
      title: 'Movie A',
      overview: 'Overview A',
      releaseDate: '2023-02-01',
    });

    await movieService.createMovie({
      title: 'Movie B',
      overview: 'Overview B',
      releaseDate: '2023-02-02',
    });

    await movieService.createMovie({
      title: 'Movie C',
      overview: 'Overview C',
      releaseDate: '2023-02-03',
    });

    // Get all movies
    const result = await movieService.getAllMovies(1, 10);

    expect(result.movies).toBeDefined();
    expect(result.movies.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
  });

  test('should search movies', async () => {
    // Create a movie with a specific title
    await movieService.createMovie({
      title: 'Unique Search Term',
      overview: 'Overview for search',
      releaseDate: '2023-03-01',
    });

    // Search for the movie
    const result = await movieService.getAllMovies(1, 10, 'Unique Search');

    expect(result.movies).toBeDefined();
    expect(result.movies.length).toBeGreaterThan(0);
    expect(result.movies[0].title).toContain('Unique Search');
  });
});
