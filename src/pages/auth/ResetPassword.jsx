import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    token: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Récupérer le token et l'email depuis l'URL
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setError('Lien de réinitialisation invalide');
      return;
    }

    setFormData(prev => ({
      ...prev,
      token,
      email,
    }));
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation côté client
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/reset-password', formData);

      if (response.data.success) {
        toast.success('Mot de passe réinitialisé avec succès !');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la réinitialisation';
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
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <Link to="/login" className="d-flex align-items-center text-primary text-decoration-none mb-4">
                  <ArrowLeft size={20} className="me-2" />
                  Retour à la connexion
                </Link>

                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 80, height: 80 }}>
                    <Lock size={40} className="text-primary" />
                  </div>
                  <h2 className="fw-bold text-primary">Nouveau mot de passe</h2>
                  <p className="text-muted">
                    Créez un nouveau mot de passe sécurisé pour votre compte
                  </p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Email (lecture seule) */}
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      readOnly
                      disabled
                      className="bg-light"
                    />
                  </Form.Group>

                  {/* Nouveau mot de passe */}
                  <Form.Group className="mb-3">
                    <Form.Label>Nouveau mot de passe</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
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
                      Minimum 8 caractères
                    </Form.Text>
                  </Form.Group>

                  {/* Confirmation */}
                  <Form.Group className="mb-4">
                    <Form.Label>Confirmer le mot de passe</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="password_confirmation"
                        placeholder="••••••••"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        required
                      />
                      <Button
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y text-muted"
                        style={{ zIndex: 10 }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        type="button"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </Button>
                    </div>
                  </Form.Group>

                  {/* Indicateur de force du mot de passe */}
                  {formData.password && (
                    <div className="mb-4">
                      <small className="text-muted">Force du mot de passe:</small>
                      <div className="progress" style={{ height: 5 }}>
                        <div
                          className={`progress-bar ${
                            formData.password.length < 8
                              ? 'bg-danger'
                              : formData.password.length < 12
                              ? 'bg-warning'
                              : 'bg-success'
                          }`}
                          style={{
                            width: `${Math.min((formData.password.length / 12) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <small className="text-muted">
                        {formData.password.length < 8
                          ? 'Faible'
                          : formData.password.length < 12
                          ? 'Moyen'
                          : 'Fort'}
                      </small>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-2"
                    disabled={loading || !formData.token || !formData.email}
                  >
                    {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                  </Button>
                </Form>

                {/* Conseils de sécurité */}
                <div className="mt-4 p-3 bg-light rounded">
                  <p className="mb-2 fw-semibold text-muted" style={{ fontSize: '0.9rem' }}>
                    💡 Conseils pour un mot de passe sécurisé :
                  </p>
                  <ul className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                    <li>Au moins 8 caractères (12+ recommandé)</li>
                    <li>Mélange de majuscules et minuscules</li>
                    <li>Chiffres et caractères spéciaux</li>
                    <li>Évitez les mots du dictionnaire</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>

            {/* Note de sécurité */}
            <div className="text-center mt-4">
              <small className="text-muted">
                🔒 Ce lien est valable pendant 60 minutes
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPassword;