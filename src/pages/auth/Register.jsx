import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { Mail, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Effacer l'erreur du champ modifié
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validation côté client
    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: 'Les mots de passe ne correspondent pas' });
      setLoading(false);
      return;
    }

    try {
      const response = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.password_confirmation
      );
      
      // ✅ Si l'inscription réussit, afficher le message de vérification
      if (response.success) {
        setRegisteredEmail(formData.email);
        setEmailSent(true);
        toast.success('Inscription réussie ! Vérifiez votre email.');
      }
    } catch (err) {
      const serverErrors = err.response?.data?.errors || {};
      setErrors(serverErrors);
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Afficher la page de confirmation d'email
  if (emailSent) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <Card className="shadow-lg border-0">
                <Card.Body className="p-5">
                  <div className="text-center mb-4">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{ width: 80, height: 80 }}>
                      <Mail size={40} className="text-success" />
                    </div>
                    <h2 className="fw-bold text-success mb-3">Vérifiez votre email ! 📧</h2>
                  </div>

                  <Alert variant="success" className="mb-4">
                    <Alert.Heading className="h6">
                      <Check size={20} className="me-2" />
                      Inscription réussie !
                    </Alert.Heading>
                    <p className="mb-0">
                      Un email de vérification a été envoyé à <strong>{registeredEmail}</strong>
                    </p>
                  </Alert>

                  <div className="bg-light p-4 rounded mb-4">
                    <h6 className="fw-bold mb-3">📋 Prochaines étapes :</h6>
                    <ol className="mb-0 ps-3">
                      <li className="mb-2">Consultez votre boîte de réception (et spam)</li>
                      <li className="mb-2">Cliquez sur le lien de vérification</li>
                      <li className="mb-2">Connectez-vous à votre compte</li>
                      <li>Commencez votre parcours d'apprentissage ! 🎓</li>
                    </ol>
                  </div>

                  <div className="text-center">
                    <p className="text-muted mb-3">
                      Vous n'avez pas reçu l'email ?
                    </p>
                    <Button
                      variant="outline-primary"
                      onClick={() => window.location.reload()}
                      className="mb-3"
                    >
                      Renvoyer l'email
                    </Button>
                    <div>
                      <Link to="/login" className="text-primary text-decoration-none">
                        Retour à la connexion
                      </Link>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <div className="text-center mt-4">
                <small className="text-muted">
                  💡 Astuce : Le lien de vérification est valable 24 heures
                </small>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // ✅ Formulaire d'inscription
  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">Inscription</h2>
                  <p className="text-muted">Créez votre compte gratuitement</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom complet</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      isInvalid={!!errors.name}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name?.[0]}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email?.[0]}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mot de passe</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                      required
                      minLength={8}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password?.[0]}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Minimum 8 caractères
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirmer le mot de passe</Form.Label>
                    <Form.Control
                      type="password"
                      name="password_confirmation"
                      placeholder="••••••••"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      isInvalid={!!errors.password_confirmation}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password_confirmation}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-2 mb-3"
                    disabled={loading}
                  >
                    {loading ? 'Inscription...' : 'S\'inscrire'}
                  </Button>

                  <div className="text-center">
                    <span className="text-muted">Déjà un compte ? </span>
                    <Link to="/login" className="text-primary fw-bold text-decoration-none">
                      Se connecter
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

export default Register;