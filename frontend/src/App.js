// src/App.js  

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Card, Button, Form, Table, Modal, Alert, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


// ✅ Base URL from .env
const baseUrl = process.env.REACT_APP_API_BASE_URL;

// ================= Auth Context =================
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userInfo = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({
          id: userInfo.sub || userInfo.userId || '1',
          username: userInfo.unique_name || userInfo.username || 'testuser',
          email: userInfo.email || 'test@example.com'
        });
      } catch (error) {
        console.error('Error parsing token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL
    try {
 //     const response = await fetch('http://192.168.152.133:8080/api/auth/login', {
        const response = await fetch(`${baseUrl}api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const token = data.token || 'dummy-token';
      localStorage.setItem('token', token);

      setCurrentUser({
        id: data.user?.id || '1',
        username: data.user?.username || username,
        email: data.user?.email || 'user@example.com'
      });

      return { success: true };
    } catch (error) {
      // Fallback for demo
      const token = 'dummy-token';
      localStorage.setItem('token', token);
      setCurrentUser({
        id: '1',
        username: username,
        email: 'demo@example.com'
      });
      return { success: true };
    }
  };

  const register = async (username, email, password) => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL
    console.log('Register baseUrl:', baseUrl);  // to test log
    console.log('Full URL:', `${baseUrl}api/auth/register`);  //to test log
    try {
      const response = await fetch(`${baseUrl}api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      const token = data.token || 'dummy-token';
      localStorage.setItem('token', token);

      setCurrentUser({
        id: data.user?.id || '1',
        username: data.user?.username || username,
        email: data.user?.email || email
      });

      return { success: true };
    } catch (error) {
      // Fallback for demo
      const token = 'dummy-token';
      localStorage.setItem('token', token);
      setCurrentUser({
        id: '1',
        username: username,
        email: email
      });
      return { success: true };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ================= Navigation =================

const Navigation = () => {
  const { currentUser, logout } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">Movie App</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/movies">Movies</Nav.Link>
          {currentUser && (
            <>
              <Nav.Link href="/watchlist">Watchlist</Nav.Link>
              <Nav.Link href="/profile">Profile</Nav.Link>
            </>
          )}
        </Nav>
        <Nav>
          {currentUser ? (
            <>
              <Navbar.Text className="me-3">Hello, {currentUser.username}</Navbar.Text>
              <Button variant="outline-light" onClick={logout}>Logout</Button>
            </>
          ) : (
            <Nav.Link href="/login">Login</Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

// ================= Protected Route =================
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  return currentUser ? children : <Navigate to="/login" />;
};

// ================= Login Page =================
const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'register' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = activeTab === 'login' 
      ? await login(formData.username, formData.password)
      : await register(formData.username, formData.email, formData.password);

    if (result.success) {
      navigate('/movies');
    } else {
      setError(result.error || 'Operation failed');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">Movie Microservices</Card.Title>
              
              {error && <Alert variant="danger">{error}</Alert>}

              <div className="d-flex justify-content-center mb-3">
                <Button 
                  variant={activeTab === 'login' ? 'primary' : 'outline-primary'} 
                  className="me-2"
                  onClick={() => setActiveTab('login')}
                >
                  Login
                </Button>
                <Button 
                  variant={activeTab === 'register' ? 'primary' : 'outline-primary'}
                  onClick={() => setActiveTab('register')}
                >
                  Register
                </Button>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {activeTab === 'register' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {activeTab === 'register' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                )}

                <Button variant="primary" type="submit" className="w-100">
                  {activeTab === 'login' ? 'Login' : 'Register'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// ================= Movie Modal =================

const MovieModal = ({ show, onHide, movie }) => {
  if (!movie) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{movie.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={4}>
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} className="img-fluid rounded" />
            ) : (
              <div className="bg-secondary text-white d-flex align-items-center justify-content-center rounded" style={{height: '300px'}}>
                No Poster
              </div>
            )}
          </Col>
          <Col md={8}>
            <p><strong>Director:</strong> {movie.director || 'N/A'}</p>
            <p><strong>Actors:</strong> {movie.actors || 'N/A'}</p>
            <p><strong>Rating:</strong> {movie.rating || 0}/10</p>
            <p><strong>Synopsis:</strong> {movie.synopsis || 'No synopsis available'}</p>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};


// ================= Rating Modal =================

const RatingModal = ({ show, onHide, movie, onRatingSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await fetch(`/api/movies/${movie.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating, comment })
      });
      
      onRatingSubmit();
      onHide();
    } catch (error) {
      console.error('Rating submission failed:', error);
    }
    setSubmitting(false);
  };

  if (!movie) return null;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Rate "{movie.title}"</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Rating (1-10):</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Range
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="me-3"
              />
              <span className="fw-bold">{rating}/10</span>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Comment (Optional):</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this movie"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

// ================= Movies Page =================

const MoviesPage = () => {
  const { currentUser } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Demo data fallback
  const demoMovies = [
    {
      id: 1,
      title: "The Shawshank Redemption",
      director: "Frank Darabont",
      actors: "Tim Robbins, Morgan Freeman",
      rating: 9.3,
      synopsis: "Two imprisoned men bond over a number of years...",
      posterUrl: "https://picsum.photos/seed/movie1/300/450"
    },
    {
      id: 2,
      title: "The Godfather",
      director: "Francis Ford Coppola", 
      actors: "Marlon Brando, Al Pacino",
      rating: 9.2,
      synopsis: "The aging patriarch of an organized crime dynasty...",
      posterUrl: "https://picsum.photos/seed/movie2/300/450"
    },
    {
      id: 3,
      title: "Pulp Fiction",
      director: "Quentin Tarantino",
      actors: "John Travolta, Samuel L. Jackson",
      rating: 8.9,
      synopsis: "The lives of two mob hitmen, a boxer, a gangster...",
      posterUrl: "https://picsum.photos/seed/movie3/300/450"
    }
  ];

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    try {
      const response = await fetch(`${baseUrl}api/recommendations/top?userId=${currentUser.id}`, {
              headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });  
      if (response.ok) {
        const data = await response.json();
        setMovies(data.data || demoMovies); // this is responsible for dummy movie
//        setMovies(data.data || []);  // ✅  Used empty array instead of demoMovies
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.log('Using demo data');
      setMovies(demoMovies); // this line referenced the demomovies in earlier line
 //     setMovies([]);  // ✅ Use empty array instead of demoMovies
    }
    setLoading(false);
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setShowMovieModal(true);
  };

  const handleRateClick = (movie) => {
    setSelectedMovie(movie);
    setShowRatingModal(true);
  };

  if (loading) {
    return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Top Recommended Movies</h1>

      <Card className="mb-4">
        <Card.Body>
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
              <Button variant="primary" className="w-100">Search</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Movie</th>
                <th>Director</th>
                <th>Actors</th>
                <th>Rating</th>
                <th>Synopsis</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id}>
                  <td>
                    <Button variant="link" onClick={() => handleMovieClick(movie)}>
                      {movie.title}
                    </Button>
                  </td>
                  <td>{movie.director}</td>
                  <td>{movie.actors}</td>
                  <td>
                    <div className="text-warning">
                      {'★'.repeat(Math.floor(movie.rating / 2))}
                      {'☆'.repeat(5 - Math.floor(movie.rating / 2))}
                      <span className="ms-1">({movie.rating}/10)</span>
                    </div>
                  </td>
                  <td className="text-truncate" style={{ maxWidth: '200px' }}>
                    {movie.synopsis}
                  </td>
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
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <MovieModal
        show={showMovieModal}
        onHide={() => setShowMovieModal(false)}
        movie={selectedMovie}
      />

      <RatingModal
        show={showRatingModal}
        onHide={() => setShowRatingModal(false)}
        movie={selectedMovie}
        onRatingSubmit={fetchMovies}
      />
    </Container>
  );
};


// ================= Watchlist Page =================

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const demoWatchlist = [
    {
      id: 1,
      movieId: 1,
      title: "Inception",
      posterUrl: "https://picsum.photos/seed/watchlist1/300/450",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      movieId: 2,
      title: "Interstellar",
      posterUrl: "https://picsum.photos/seed/watchlist2/300/450",
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // Use demo data for now
    setTimeout(() => {
      setWatchlist(demoWatchlist);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRemove = (movieId) => {
    setWatchlist(watchlist.filter(item => item.movieId !== movieId));
  };

  if (loading) {
    return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-4">My Watchlist</h1>
      
      {watchlist.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {watchlist.map((item) => (
            <Col key={item.id}>
              <Card className="h-100">
                <Card.Img variant="top" src={item.posterUrl} style={{height: '300px', objectFit: 'cover'}} />
                <Card.Body>
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text>
                    <small className="text-muted">
                      Added on {new Date(item.createdAt).toLocaleDateString()}
                    </small>
                  </Card.Text>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemove(item.movieId)}
                  >
                    Remove
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card>
          <Card.Body className="text-center">
            <Card.Title>Your watchlist is empty</Card.Title>
            <Card.Text>Browse movies and add them to your watchlist.</Card.Text>
            <Button variant="primary" href="/movies">Browse Movies</Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

// ================= Profile Page =================

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    watchedMovies: 15,
    ratingsGiven: 8,
    favoriteGenres: ['Action', 'Drama', 'Sci-Fi']
  });

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h2>User Profile</h2>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={4}><strong>Username:</strong></Col>
                <Col md={8}>{profile.username}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}><strong>Email:</strong></Col>
                <Col md={8}>{profile.email}</Col>
              </Row>
              
              <hr />
              <h5 className="mb-3">Statistics</h5>
              
              <Row className="text-center">
                <Col md={4}>
                  <h3 className="text-primary">{profile.watchedMovies}</h3>
                  <p>Movies Watched</p>
                </Col>
                <Col md={4}>
                  <h3 className="text-success">{profile.ratingsGiven}</h3>
                  <p>Ratings Given</p>
                </Col>
                <Col md={4}>
                  <h3 className="text-warning">{profile.favoriteGenres.length}</h3>
                  <p>Favorite Genres</p>
                </Col>
              </Row>
              
              <hr />
              <h5>Favorite Genres</h5>
              <div className="mt-2">
                {profile.favoriteGenres.map((genre, index) => (
                  <span key={index} className="badge bg-secondary me-2 mb-2">{genre}</span>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
          <Navigation />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/movies" element={<ProtectedRoute><MoviesPage /></ProtectedRoute>} />
            <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/movies" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
