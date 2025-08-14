import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

function RatingModal({ show, onHide, movie, onRatingSubmit }) {
  const { currentUser } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const form = useForm({
    defaultValues: {
      rating: 5,
      comment: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`/api/movies/${movie.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }
      
      setSuccess('Rating submitted successfully');
      setError('');
      
      // Close modal after a delay
      setTimeout(() => {
        onHide();
        onRatingSubmit();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  const renderStars = () => {
    const stars = [];
    const rating = form.watch('rating');
    
    for (let i = 10; i >= 1; i--) {
      stars.push(
        <label key={i} className="me-1" style={{ cursor: 'pointer' }}>
          <input
            type="radio"
            name="rating"
            value={i}
            className="d-none"
            {...form.register('rating', { required: 'Rating is required' })}
            onChange={() => form.setValue('rating', i)}
          />
          <span style={{ fontSize: '24px', color: i <= rating ? '#ffc107' : '#ddd' }}>
            ★
          </span>
        </label>
      );
    }
    
    return stars;
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Rate "{movie.title}"</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={form.handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Your Rating (1-10):</Form.Label>
            <div className="rating-input">
              {renderStars()}
              <div className="mt-2">
                <span className="fw-bold">{form.watch('rating')}</span>/10
              </div>
            </div>
            {form.formState.errors.rating && (
              <Form.Text className="text-danger">
                {form.formState.errors.rating.message}
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="formComment">
            <Form.Label>Comment (Optional):</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Share your thoughts about this movie"
              {...form.register('comment')}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={form.handleSubmit(onSubmit)}>
          Submit Rating
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RatingModal;
