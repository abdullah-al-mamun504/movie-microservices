import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      bio: ''
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${currentUser.id}/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data.data);
      
      // Set form values
      form.reset({
        firstName: data.data.firstName || '',
        lastName: data.data.lastName || '',
        bio: data.data.bio || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`/api/users/${currentUser.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const result = await response.json();
      setProfile(result.data);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div>
      <h1 className="mb-4">My Profile</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Card.Title>Profile Information</Card.Title>
            {!isEditing && (
              <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
          
          {isEditing ? (
            <Form onSubmit={form.handleSubmit(onSubmit)}>
              <Form.Group className="mb-3" controlId="formFirstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter first name"
                  {...form.register('firstName')}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formLastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter last name"
                  {...form.register('lastName')}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBio">
                <Form.Label>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Tell us about yourself"
                  {...form.register('bio')}
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button 
                  variant="outline-secondary" 
                  className="me-2"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset({
                      firstName: profile?.firstName || '',
                      lastName: profile?.lastName || '',
                      bio: profile?.bio || ''
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            </Form>
          ) : (
            <div>
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Username:</Col>
                <Col sm={9}>{currentUser.username}</Col>
              </Row>
              
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Email:</Col>
                <Col sm={9}>{currentUser.email}</Col>
              </Row>
              
              <Row className="mb-3">
                <Col sm={3} className="text-muted">First Name:</Col>
                <Col sm={9}>{profile?.firstName || 'Not provided'}</Col>
              </Row>
              
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Last Name:</Col>
                <Col sm={9}>{profile?.lastName || 'Not provided'}</Col>
              </Row>
              
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Bio:</Col>
                <Col sm={9}>{profile?.bio || 'Not provided'}</Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default ProfilePage;
