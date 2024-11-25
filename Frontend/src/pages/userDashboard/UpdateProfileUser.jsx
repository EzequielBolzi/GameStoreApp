import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import userApi from '../../api/userApi';
import '.././updateProfile.css';
import Header from '../Header';

function UpdateProfileUser() {
    const { auth } = useAuth();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
      email: '',
      username: '',
      password: '',
      confirmPassword: '', 
      country: '',
      city: '',
      street: '',
      address: '',
      phoneNumber: '',
      profileAvatar: '',
      cardName: '',
      cardNumber: '',
      cardExpiration: '',
      cardCVV: ''
    });
  
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const authToken = auth?.accessToken;
          if (!authToken) {
            setError('Authentication token is missing.');
            return;
          }
          
          const data = await userApi.getCurrentUser(authToken);
          const { password, ...profileData } = data; 
  
          setFormData(prevState => ({
            ...prevState,
            ...profileData
          }));
        } catch (error) {
          console.error('Failed to fetch profile:', error.message);
          setError('Failed to load profile data.');
        }
      };
  
      fetchProfile();
    }, [auth]);
  
    const handleChange = (e) => {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');

      if (formData.password && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      try {
        const authToken = auth?.accessToken; 
        if (!authToken) {
            setError('Authentication token is missing.');
            return;
        }

        const { confirmPassword, ...dataToUpdate } = formData;
        if (!formData.password) {
          delete dataToUpdate.password; 
        }

        await userApi.updateProfile(dataToUpdate, authToken); 
        setSuccess('Profile updated successfully.');
      } catch (error) {
        setError('Failed to update profile: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

  return (
    <>      
      <Header username={formData.username} isProfileUpdate={true} />
      <div className="alert-container">
        {error && <Alert variant="danger" className="custom-alert">{error}</Alert>}
        {success && <Alert variant="success" className="custom-alert">{success}</Alert>}
      </div>
      <Container className="profile-container">
        <Card className="profile-card">
          <Card.Body >
            <Form className="profile-form" onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      pattern=".+@.+\..+"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
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
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>New Password (leave blank to keep current)</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"  
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength={6}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Street</Form.Label>
                    <Form.Control
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Profile Avatar URL</Form.Label>
                    <Form.Control
                      type="url"
                      name="profileAvatar"
                      value={formData.profileAvatar}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Card Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Card Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      placeholder="16 NUMEROS"
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Expiration Date</Form.Label>
                    <Form.Control
                      type="text"
                      name="cardExpiration"
                      value={formData.cardExpiration}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>CVV</Form.Label>
                    <Form.Control
                      type="text"
                      name="cardCVV"
                      value={formData.cardCVV}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </Form>

          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default UpdateProfileUser;
