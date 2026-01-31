import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ConfirmPassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Récupérer l'intention de redirection
  const intendedAction = sessionStorage.getItem('intended_action');
  const intendedUrl = sessionStorage.getItem('intended_url');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/confirm-password', {
        password,
      });

      if (response.data.success) {
        toast.success('Mot de passe confirmé');
        
        // Stocker la confirmation (valide pendant 3 heures)
        sessionStorage.setItem('password_confirmed_at', new Date().toISOString());
        
        // Rediriger vers l'URL prévue ou le dashboard
        const redirectTo = intendedUrl || '/dashboard/' + user?.role;
        
        // Nettoyer
        sessionStorage.removeItem('intended_action');
        sessionStorage.removeItem('intended_url');
        
        navigate(redirectTo);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Mot de passe incorrect';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="border-0 shadow-lg">
              <Card.Body className="p-5">
                <Link 
                  to={intendedUrl || '/dashboard/' + user?.role} 
                  className="d-flex align-items-center text-primary text-decoration-none mb-4"
                >
                  <ArrowLeft size={20} className="me-2" />
                  Annuler
                </Link>

                <div className="text-center mb-4">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: 80, height: 80 }}>
                    <Shield size={40} className="text-warning" />
                  </div>
                  <h2 className="fw-bold text-primary">Confirmation requise</h2>
                  <p className="text-muted">
                    {intendedAction || 'Cette action nécessite la confirmation de votre mot de passe pour des raisons de sécurité.'}
                  </p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>Mot de passe actuel</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Entrez votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
                      />
                      <Button
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y text-muted"
                        style={{ zIndex: 10 }}
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </Button>
                    </div>
                    <Form.Text className="text-muted">
                      Votre mot de passe ne sera pas modifié
                    </Form.Text>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-2 mb-3"
                    disabled={loading || !password}
                  >
                    {loading ? 'Vérification...' : 'Confirmer'}
                  </Button>

                  <div className="text-center">
                    <Link to="/forgot-password" className="text-primary text-decoration-none">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                </Form>

                {/* Info de sécurité */}
                <div className="mt-4 p-3 bg-light rounded">
                  <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                    <strong>🔒 Sécurité :</strong> La confirmation du mot de passe est valable pendant 3 heures pour les actions sensibles.
                  </p>
                </div>
              </Card.Body>
            </Card>

            {/* Note */}
            <div className="text-center mt-4">
              <small className="text-muted">
                Cette vérification protège votre compte contre les accès non autorisés
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ConfirmPassword;