const { sequelize } = require('../src/models');
const ratingService = require('../src/services/ratingService');

// Set up test database
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Rating Service', () => {
  test('should create a new rating', async () => {
    const ratingData = {
      userId: 1,
      movieId: 1,
      rating: 8,
      comment: 'Great movie!',
    };

    const rating = await ratingService.createRating(ratingData);

    expect(rating).toBeDefined();
    expect(rating.userId).toBe(ratingData.userId);
    expect(rating.movieId).toBe(ratingData.movieId);
    expect(rating.rating).toBe(ratingData.rating);
    expect(rating.comment).toBe(ratingData.comment);
    expect(rating.isApproved).toBe(true);
  });

  test('should get a rating by ID', async () => {
    // Create a rating first
    const ratingData = {
      userId: 2,
      movieId: 2,
      rating: 7,
      comment: 'Good movie',
    };

    const createdRating = await ratingService.createRating(ratingData);

    // Get the rating by ID
    const rating = await ratingService.getRatingById(createdRating.id);

    expect(rating).toBeDefined();
    expect(rating.id).toBe(createdRating.id);
    expect(rating.userId).toBe(ratingData.userId);
  });

  test('should update a rating', async () => {
    // Create a rating first
    const ratingData = {
      userId: 3,
      movieId: 3,
      rating: 6,
      comment: 'Average movie',
    };

    const createdRating = await ratingService.createRating(ratingData);

    // Update the rating
    const updateData = {
      rating: 9,
      comment: 'Actually, it was great!',
    };

    const updatedRating = await ratingService.updateRating(createdRating.id, updateData);

    expect(updatedRating).toBeDefined();
    expect(updatedRating.id).toBe(createdRating.id);
    expect(updatedRating.rating).toBe(updateData.rating);
    expect(updatedRating.comment).toBe(updateData.comment);
    expect(updatedRating.userId).toBe(ratingData.userId); // Should remain unchanged
  });

  test('should delete a rating', async () => {
    // Create a rating first
    const ratingData = {
      userId: 4,
      movieId: 4,
      rating: 5,
      comment: 'Below average',
    };

    const createdRating = await ratingService.createRating(ratingData);

    // Delete the rating
    const result = await ratingService.deleteRating(createdRating.id);

    expect(result).toBe(true);

    // Try to get the deleted rating
    const rating = await ratingService.getRatingById(createdRating.id);
    expect(rating).toBeNull();
  });

  test('should get ratings by user ID', async () => {
    // Create some ratings for the same user
    await ratingService.createRating({
      userId: 5,
      movieId: 5,
      rating: 8,
    });

    await ratingService.createRating({
      userId: 5,
      movieId: 6,
      rating: 7,
    });

    await ratingService.createRating({
      userId: 5,
      movieId: 7,
      rating: 9,
    });

    // Get ratings by user ID
    const result = await ratingService.getRatingsByUserId(5);

    expect(result.ratings).toBeDefined();
    expect(result.ratings.length).toBe(3);
    expect(result.total).toBe(3);
    expect(result.ratings.every(r => r.userId === 5)).toBe(true);
  });

  test('should get ratings by movie ID', async () => {
    // Create some ratings for the same movie
    await ratingService.createRating({
      userId: 6,
      movieId: 8,
      rating: 8,
    });

    await ratingService.createRating({
      userId: 7,
      movieId: 8,
      rating: 7,
    });

    await ratingService.createRating({
      userId: 8,
      movieId: 8,
      rating: 9,
    });

    // Get ratings by movie ID
    const result = await ratingService.getRatingsByMovieId(8);

    expect(result.ratings).toBeDefined();
    expect(result.ratings.length).toBe(3);
    expect(result.total).toBe(3);
    expect(result.ratings.every(r => r.movieId === 8)).toBe(true);
  });

  test('should get average rating for a movie', async () => {
    // Create some ratings for the same movie
    await ratingService.createRating({
      userId: 9,
      movieId: 9,
      rating: 8,
    });

    await ratingService.createRating({
      userId: 10,
      movieId: 9,
      rating: 7,
    });

    await ratingService.createRating({
      userId: 11,
      movieId: 9,
      rating: 9,
    });

    // Get average rating for the movie
    const averageRating = await ratingService.getAverageRatingForMovie(9);

    expect(averageRating).toBeDefined();
    expect(averageRating.averageRating).toBe('8.0'); // (8+7+9)/3 = 8.0
    expect(averageRating.totalRatings).toBe(3);
  });

  test('should get rating by user and movie', async () => {
    // Create a rating
    const ratingData = {
      userId: 12,
      movieId: 10,
      rating: 8,
    };

    await ratingService.createRating(ratingData);

    // Get rating by user and movie
    const rating = await ratingService.getRatingByUserAndMovie(12, 10);

    expect(rating).toBeDefined();
    expect(rating.userId).toBe(12);
    expect(rating.movieId).toBe(10);
  });

  test('should approve a rating', async () => {
    // Create an unapproved rating
    const ratingData = {
      userId: 13,
      movieId: 11,
      rating: 8,
      isApproved: false,
    };

    const createdRating = await ratingService.createRating(ratingData);

    // Approve the rating
    const approvedRating = await ratingService.approveRating(createdRating.id);

    expect(approvedRating).toBeDefined();
    expect(approvedRating.id).toBe(createdRating.id);
    expect(approvedRating.isApproved).toBe(true);
  });
});
