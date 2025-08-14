import React, { useState } from 'react';
import { Tab, Tabs, Form, Button, Alert, Card } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  
  const loginForm = useForm();
  const registerForm = useForm();

  const onLoginSubmit = async (data) => {
    const result = await login(data.username, data.password);
    if (!result.success) {
      setError(result.error);
    }
  };

  const onRegisterSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const result = await register(data.username, data.email, data.password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="form-container">
      <Card>
        <Card.Body>
          <Card.Title className="text-center mb-4">Movie Microservices</Card.Title>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => {
              setActiveTab(k);
              setError('');
            }}
            className="mb-3"
            justify
          >
            <Tab eventKey="login" title="Login">
              <Form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <Form.Group className="mb-3" controlId="formLoginUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    {...loginForm.register('username', { required: 'Username is required' })}
                  />
                  {loginForm.formState.errors.username && (
                    <Form.Text className="text-danger">
                      {loginForm.formState.errors.username.message}
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formLoginPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    {...loginForm.register('password', { required: 'Password is required' })}
                  />
                  {loginForm.formState.errors.password && (
                    <Form.Text className="text-danger">
                      {loginForm.formState.errors.password.message}
                    </Form.Text>
                  )}
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Login
                </Button>
              </Form>
            </Tab>
            
            <Tab eventKey="register" title="Register">
              <Form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <Form.Group className="mb-3" controlId="formRegisterUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    {...registerForm.register('username', { required: 'Username is required' })}
                  />
                  {registerForm.formState.errors.username && (
                    <Form.Text className="text-danger">
                      {registerForm.formState.errors.username.message}
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formRegisterEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    {...registerForm.register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {registerForm.formState.errors.email && (
                    <Form.Text className="text-danger">
                      {registerForm.formState.errors.email.message}
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formRegisterPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    {...registerForm.register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                  />
                  {registerForm.formState.errors.password && (
                    <Form.Text className="text-danger">
                      {registerForm.formState.errors.password.message}
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formRegisterConfirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm Password"
                    {...registerForm.register('confirmPassword', { 
                      required: 'Please confirm your password'
                    })}
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <Form.Text className="text-danger">
                      {registerForm.formState.errors.confirmPassword.message}
                    </Form.Text>
                  )}
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Register
                </Button>
              </Form>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
}

export default LoginPage;
