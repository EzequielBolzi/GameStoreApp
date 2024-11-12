import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import companyApi from '../../api/companyApi';
import { Link } from 'react-router-dom';
import '../companyDashboard/updateProfileCompany.css'

const UpdateProfile = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    password: '',
    country: '',
    city: '',
    street: '',
    address: '',
    phoneNumber: '',
    profileAvatar: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const authToken = auth?.accessToken;
        const data = await companyApi.getCurrentCompany(authToken);
        const { password, ...profileData } = data;
        setFormData(prevState => ({
          ...prevState,
          ...profileData
        }));
      } catch (error) {
        console.error('Failed to fetch profile:', error.message);
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

    try {
        const authToken = auth?.accessToken; 
        if (!authToken) {
            setError('Authentication token is missing.');
            return;
        }

        await companyApi.updateCompanyProfile(formData, authToken); 
        setSuccess('Profile updated successfully.');
    } catch (error) {
        setError('Failed to update profile: ' + error.message);
    } finally {
        setLoading(false);
    }
};
  return (
<Container className="profile-container">
  <Card className="profile-card">
    <Card.Header>
      <h2>Update Company Profile</h2>
      <Link to="/main">Home page</Link>
    </Card.Header>
    <Card.Body >
      {error && <Alert className="profile-alert" variant="danger">{error}</Alert>}
      {success && <Alert className="profile-alert" variant="success">{success}</Alert>}

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
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="companyName"
                    value={formData.companyName}
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
  );
};

export default UpdateProfile;