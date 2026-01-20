import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      toast.success('Email de réinitialisation envoyé !');
    } catch (err) {
      toast.error('Erreur lors de l\'envoi de l\'email');
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
                  <h2 className="fw-bold text-primary">Mot de passe oublié ?</h2>
                  <p className="text-muted">
                    Entrez votre email pour recevoir un lien de réinitialisation
                  </p>
                </div>

                {success ? (
                  <Alert variant="success">
                    <Alert.Heading>Email envoyé !</Alert.Heading>
                    <p className="mb-0">
                      Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
                    </p>
                  </Alert>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label>Adresse email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100 py-2"
                      disabled={loading}
                    >
                      {loading ? 'Envoi...' : 'Envoyer le lien'}
                    </Button>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword;