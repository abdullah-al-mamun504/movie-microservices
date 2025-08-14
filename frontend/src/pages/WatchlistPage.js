import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import MovieModal from '../components/MovieModal';

function WatchlistPage() {
  const { currentUser } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showMovieModal, setShowMovieModal] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/watchlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch watchlist');
      }
      
      const data = await response.json();
      setWatchlist(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setShowMovieModal(true);
  };

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
      const response = await fetch(`/api/watchlist/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove from watchlist');
      }
      
      // Refresh watchlist
      fetchWatchlist();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <h1 className="mb-4">My Watchlist</h1>
      
      {watchlist.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {watchlist.map((item) => (
            <Col key={item.id}>
              <Card className="watchlist-item h-100">
                <Card.Img 
                  variant="top" 
                  src={item.posterUrl || `https://picsum.photos/seed/${item.movieId}/300/450.jpg`} 
                  className="watchlist-item-poster"
                />
                <Card.Body className="watchlist-item-details">
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text>
                    <small className="text-muted">
                      Added on {new Date(item.createdAt).toLocaleDateString()}
                    </small>
                  </Card.Text>
                  <div className="d-flex justify-content-between">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleMovieClick(item)}
                    >
                      Details
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleRemoveFromWatchlist(item.movieId)}
                    >
                      Remove
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card>
          <Card.Body className="text-center">
            <Card.Title>Your watchlist is empty</Card.Title>
            <Card.Text>
              Browse movies and add them to your watchlist to see them here.
            </Card.Text>
            <Button variant="primary" href="/movies">
              Browse Movies
            </Button>
          </Card.Body>
        </Card>
      )}

      {selectedMovie && (
        <MovieModal
          show={showMovieModal}
          onHide={() => setShowMovieModal(false)}
          movie={selectedMovie}
        />
      )}
    </div>
  );
}

export default WatchlistPage;
