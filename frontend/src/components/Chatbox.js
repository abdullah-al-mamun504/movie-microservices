import React, { useState, useRef, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';

function Chatbox({ isOpen, onToggle }) {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today?', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user'
    };
    setMessages([...messages, userMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text: 'Thanks for your message! This is a demo chatbot.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className={`chatbox ${isOpen ? '' : 'chatbox-minimized'}`}>
      <div className="chatbox-header">
        <span>Support Chat</span>
        <Button variant="link" className="text-white p-0" onClick={onToggle}>
          {isOpen ? '−' : '+'}
        </Button>
      </div>
      {isOpen && (
        <>
          <div className="chatbox-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'text-end' : ''}`}
              >
                <div 
                  className={`d-inline-block p-2 my-1 rounded ${
                    message.sender === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-light'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbox-input">
            <Form onSubmit={handleSubmit}>
              <Form.Control
                type="text"
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </Form>
          </div>
        </>
      )}
    </div>
  );
}

export default Chatbox;
