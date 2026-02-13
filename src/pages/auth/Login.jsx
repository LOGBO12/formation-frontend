import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { Mail, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setNeedsVerification(false);

    try {
      const user = await login(formData.email, formData.password);
      toast.success('Connexion réussie !');

      // Redirection selon le profil
      if (user.needs_onboarding) {
        const step = user.onboarding_step || 'role';
        navigate(`/onboarding/${step}`);
      } else {
        // Redirection selon le rôle
        if (user.role === 'super_admin') {
          navigate('/dashboard/admin');
        } else if (user.role === 'formateur') {
          navigate('/dashboard/formateur');
        } else {
          navigate('/dashboard/apprenant');
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur de connexion';
      
      // ✅ Vérifier si c'est un problème de vérification d'email
      if (err.response?.data?.email_verified === false) {
        setNeedsVerification(true);
        setUnverifiedEmail(err.response?.data?.email || formData.email);
        setError(message);
      } else {
        setError(message);
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await api.post('/auth/resend-verification', {
        email: unverifiedEmail
      });

      if (response.data.success) {
        toast.success('Email de vérification renvoyé !');
      }
    } catch (err) {
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">Connexion</h2>
                  <p className="text-muted">Accédez à votre espace e-Learning</p>
                </div>

                {error && !needsVerification && (
                  <Alert variant="danger">{error}</Alert>
                )}

                {/* ✅ Message spécial si email non vérifié */}
                {needsVerification && (
                  <Alert variant="warning" className="mb-4">
                    <div className="d-flex align-items-start">
                      <Mail size={24} className="me-3 flex-shrink-0 mt-1" />
                      <div className="flex-grow-1">
                        <Alert.Heading className="h6 mb-2">
                          <AlertCircle size={18} className="me-2" />
                          Email non vérifié
                        </Alert.Heading>
                        <p className="mb-2">
                          Vous devez vérifier votre adresse email avant de vous connecter.
                        </p>
                        <p className="mb-3">
                          Un email a été envoyé à <strong>{unverifiedEmail}</strong>
                        </p>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={handleResendVerification}
                        >
                          📧 Renvoyer l'email de vérification
                        </Button>
                      </div>
                    </div>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mot de passe</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check type="checkbox" label="Se souvenir de moi" />
                    <Link to="/forgot-password" className="text-primary text-decoration-none">
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-2 mb-3"
                    disabled={loading}
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>

                  <div className="text-center">
                    <span className="text-muted">Pas encore de compte ? </span>
                    <Link to="/register" className="text-primary fw-bold text-decoration-none">
                      S'inscrire
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;