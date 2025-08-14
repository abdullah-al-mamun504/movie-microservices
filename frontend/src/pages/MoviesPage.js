import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import MovieModal from '../components/MovieModal';
import RatingModal from '../components/RatingModal';

function MoviesPage() {
  const { currentUser } = useAuth();
  const [topMovies, setTopMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    fetchTopMovies();
    fetchDropdownData();
  }, []);

  const fetchTopMovies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recommendations/top?userId=${currentUser.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch top movies');
      }
      const data = await response.json();
      setTopMovies(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch countries
      const countriesResponse = await fetch('/api/countries');
      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json();
        setCountries(countriesData.data || []);
      }

      // Fetch languages
      const languagesResponse = await fetch('/api/languages');
      if (languagesResponse.ok) {
        const languagesData = await languagesResponse.json();
        setLanguages(languagesData.data || []);
      }

      // Fetch genres
      const genresResponse = await fetch('/api/genres');
      if (genresResponse.ok) {
        const genresData = await genresResponse.json();
        setGenres(genresData.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err);
    }
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setShowMovieModal(true);
  };

  const handleRateClick = (movie) => {
    setSelectedMovie(movie);
    setShowRatingModal(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real implementation, this would call a search API
    console.log('Searching for:', searchTerm);
  };

  const getCountryName = (countryId) => {
    const country = countries.find(c => c.id === countryId);
    return country ? country.name : 'Unknown';
  };

  const getLanguageName = (languageId) => {
    const language = languages.find(l => l.id === languageId);
    return language ? language.name : 'Unknown';
  };

  const getGenreName = (genreId) => {
    const genre = genres.find(g => g.id === genreId);
    return genre ? genre.name : 'Unknown';
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Top 5 Recommended Movies</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={10}>
                <Form.Control
                  type="text"
                  placeholder="Search movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Button type="submit" variant="primary" className="w-100">
                  Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="top-movies-table">
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Movie</th>
                <th>Country</th>
                <th>Language</th>
                <th>Genre</th>
                <th>Director</th>
                <th>Actors</th>
                <th>Synopsis</th>
                <th>Review</th>
                <th>Poster</th>
                <th>User</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topMovies.length > 0 ? (
                topMovies.map((movie, index) => (
                  <tr key={movie.id || index}>
                    <td>
                      <Button 
                        variant="link" 
                        className="p-0 text-start"
                        onClick={() => handleMovieClick(movie)}
                      >
                        {movie.title || `Movie ${index + 1}`}
                      </Button>
                    </td>
                    <td>{getCountryName(movie.countryId)}</td>
                    <td>{getLanguageName(movie.languageId)}</td>
                    <td>{getGenreName(movie.genreId)}</td>
                    <td>{movie.director || 'N/A'}</td>
                    <td>{movie.actors || 'N/A'}</td>
                    <td className="text-truncate" style={{ maxWidth: '200px' }}>
                      {movie.synopsis || 'No synopsis available'}
                    </td>
                    <td>
                      <div className="rating-stars">
                        {'★'.repeat(Math.floor(movie.rating || 0))}
                        {'☆'.repeat(5 - Math.floor(movie.rating || 0))}
                        <span className="ms-1">({movie.rating || 0}/10)</span>
                      </div>
                    </td>
                    <td>
                      {movie.posterUrl ? (
                        <img 
                          src={movie.posterUrl} 
                          alt={movie.title} 
                          className="movie-poster-thumbnail"
                        />
                      ) : (
                        <div className="bg-secondary text-white d-flex align-items-center justify-content-center movie-poster-thumbnail">
                          No Poster
                        </div>
                      )}
                    </td>
                    <td>{movie.reviewer || 'N/A'}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleRateClick(movie)}
                      >
                        Rate
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center">
                    No movies found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {selectedMovie && (
        <>
          <MovieModal
            show={showMovieModal}
            onHide={() => setShowMovieModal(false)}
            movie={selectedMovie}
          />
          <RatingModal
            show={showRatingModal}
            onHide={() => setShowRatingModal(false)}
            movie={selectedMovie}
            onRatingSubmit={() => {
              // Refresh top movies after rating
              fetchTopMovies();
            }}
          />
        </>
      )}
    </div>
  );
}

export default MoviesPage;
