import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { Mail, AlertCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  // ✅ Récupérer les données transmises par VerifyEmail
  const fromVerification = location.state?.emailVerified || false;
  const verifiedEmail    = location.state?.email || '';
  const toastMessage     = location.state?.toastMessage || '';

  const [formData, setFormData] = useState({
    email:    verifiedEmail, // pré-rempli si on vient de la vérification
    password: '',
  });
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail]   = useState('');

  // ✅ Afficher le toast de succès une seule fois à l'arrivée
  useEffect(() => {
    if (fromVerification && toastMessage) {
      toast.success(toastMessage, { duration: 5000 });
    }
  }, []);

  const handleChange = (e) => {
    // Empêcher la modification de l'email s'il vient de la vérification
    if (e.target.name === 'email' && fromVerification) return;
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

      if (user.needs_onboarding) {
        const step = user.onboarding_step || 'role';
        navigate(`/onboarding/${step}`);
      } else {
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
        email: unverifiedEmail,
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
                  <h2 className="fw-bold text-primary">
                    {fromVerification ? 'Finalisez votre connexion' : 'Connexion'}
                  </h2>
                  <p className="text-muted">
                    {fromVerification
                      ? 'Votre email est vérifié, entrez votre mot de passe'
                      : 'Accédez à votre espace e-Learning'}
                  </p>
                </div>

                {/* ✅ Bannière succès si on vient de la vérification */}
                {fromVerification && (
                  <Alert variant="success" className="mb-4 py-2 text-center">
                    ✅ Email vérifié avec succès !
                  </Alert>
                )}

                {error && !needsVerification && (
                  <Alert variant="danger">{error}</Alert>
                )}

                {/* Message spécial si email non vérifié */}
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
                        <Button variant="warning" size="sm" onClick={handleResendVerification}>
                          📧 Renvoyer l'email de vérification
                        </Button>
                      </div>
                    </div>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>

                    {/* ✅ Champ email en lecture seule si on vient de la vérification */}
                    {fromVerification ? (
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <Lock size={16} className="text-muted" />
                        </span>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          readOnly
                          className="bg-light text-muted"
                          style={{ cursor: 'not-allowed' }}
                        />
                        <span className="input-group-text bg-success bg-opacity-10 border-success text-success">
                          ✅
                        </span>
                      </div>
                    ) : (
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    )}

                    {fromVerification && (
                      <Form.Text className="text-success">
                        Email vérifié — champ non modifiable
                      </Form.Text>
                    )}
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
                      autoFocus={fromVerification} // ✅ focus automatique sur le mot de passe
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    {!fromVerification && (
                      <Form.Check type="checkbox" label="Se souvenir de moi" />
                    )}
                    <Link to="/forgot-password" className="text-primary text-decoration-none ms-auto">
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-2 mb-3"
                    disabled={loading}
                  >
                    {loading
                      ? 'Connexion...'
                      : fromVerification ? 'Se connecter et commencer' : 'Se connecter'}
                  </Button>

                  {!fromVerification && (
                    <div className="text-center">
                      <span className="text-muted">Pas encore de compte ? </span>
                      <Link to="/register" className="text-primary fw-bold text-decoration-none">
                        S'inscrire
                      </Link>
                    </div>
                  )}
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