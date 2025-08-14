import React from 'react';
import { Modal, Button, Card } from 'react-bootstrap';

function MovieModal({ show, onHide, movie }) {
  if (!movie) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{movie.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="border-0">
          <Row>
            <Col md={4}>
              {movie.posterUrl ? (
                <Card.Img src={movie.posterUrl} alt={movie.title} />
              ) : (
                <div className="bg-secondary text-white d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                  No Poster Available
                </div>
              )}
            </Col>
            <Col md={8}>
              <Card.Body>
                <Card.Text>
                  <strong>Director:</strong> {movie.director || 'N/A'}
                </Card.Text>
                <Card.Text>
                  <strong>Actors:</strong> {movie.actors || 'N/A'}
                </Card.Text>
                <Card.Text>
                  <strong>Release Date:</strong> {movie.releaseDate || 'N/A'}
                </Card.Text>
                <Card.Text>
                  <strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} minutes` : 'N/A'}
                </Card.Text>
                <Card.Text>
                  <strong>Rating:</strong> {movie.rating || 'N/A'}/10
                </Card.Text>
                <Card.Text>
                  <strong>Synopsis:</strong> {movie.synopsis || 'No synopsis available.'}
                </Card.Text>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default MovieModal;
