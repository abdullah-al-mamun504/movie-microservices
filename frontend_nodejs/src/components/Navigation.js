import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Chatbox from './Chatbox';

function Navigation() {
  const { currentUser, logout } = useAuth();
  const [chatboxOpen, setChatboxOpen] = useState(true);
  const location = useLocation();

  const toggleChatbox = () => {
    setChatboxOpen(!chatboxOpen);
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Movie Microservices
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {currentUser ? (
              <>
                <Nav className="me-auto">
                  <Nav.Link 
                    as={Link} 
                    to="/movies" 
                    active={location.pathname === '/movies'}
                  >
                    Movies
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/watchlist" 
                    active={location.pathname === '/watchlist'}
                  >
                    Watchlist
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/profile" 
                    active={location.pathname === '/profile'}
                  >
                    Profile
                  </Nav.Link>
                </Nav>
                <Nav className="user-info">
                  <NavDropdown 
                    title={
                      <>
                        <span className="me-2">{currentUser.username}</span>
                        <img 
                          src={`https://ui-avatars.com/api/?name=${currentUser.username}&background=343a40&color=fff&size=30`} 
                          alt="User Avatar" 
                          className="user-avatar"
                        />
                      </>
                    } 
                    id="basic-nav-dropdown"
                    align="end"
                  >
                    <NavDropdown.Item as={Link} to="/profile">
                      Profile
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={logout}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </Nav>
              </>
            ) : (
              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      {currentUser && (
        <Chatbox isOpen={chatboxOpen} onToggle={toggleChatbox} />
      )}
    </>
  );
}

export default Navigation;
