import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accepted) {
      toast.error('Vous devez accepter la politique de confidentialité pour continuer');
      return;
    }

    setLoading(true);

    try {
      await api.post('/onboarding/accept-privacy', { accepted: true });
      await fetchUser();
      toast.success('Bienvenue sur e-Learning ! 🎉');

      // Redirection selon le rôle
      if (user?.role === 'super_admin') {
        navigate('/dashboard/admin');
      } else if (user?.role === 'formateur') {
        navigate('/dashboard/formateur');
      } else {
        navigate('/dashboard/apprenant');
      }
    } catch (err) {
      toast.error('Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3">Dernière étape ! 🎯</h2>
          <p className="text-muted fs-5">Acceptez notre politique de confidentialité</p>
          <div className="d-flex justify-content-center mt-4">
            <div className="bg-success rounded-circle me-2" style={{ width: 10, height: 10 }}></div>
            <div className="bg-success rounded-circle me-2" style={{ width: 10, height: 10 }}></div>
            <div className="bg-primary rounded-circle" style={{ width: 10, height: 10 }}></div>
          </div>
        </div>

        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <Alert variant="info" className="mb-4">
                  <Alert.Heading>📋 Important</Alert.Heading>
                  <p className="mb-0">
                    Cette étape est obligatoire pour utiliser notre plateforme.
                  </p>
                </Alert>

                <div className="bg-light p-4 rounded mb-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <h5 className="fw-bold mb-3">Politique de Confidentialité</h5>

                  <h6 className="fw-bold mt-4">1. Collecte des données</h6>
                  <p className="text-muted">
                    Nous collectons uniquement les informations nécessaires au bon fonctionnement
                    de la plateforme : nom, email, préférences d'apprentissage.
                  </p>

                  <h6 className="fw-bold mt-4">2. Utilisation des données</h6>
                  <p className="text-muted">
                    Vos données sont utilisées pour personnaliser votre expérience, vous proposer
                    des formations adaptées et améliorer nos services.
                  </p>

                  <h6 className="fw-bold mt-4">3. Protection des données</h6>
                  <p className="text-muted">
                    Nous mettons en œuvre des mesures de sécurité strictes pour protéger vos
                    informations personnelles contre tout accès non autorisé.
                  </p>

                  <h6 className="fw-bold mt-4">4. Partage des données</h6>
                  <p className="text-muted">
                    Nous ne vendons ni ne louons vos données personnelles à des tiers. Vos
                    informations ne sont partagées qu'avec votre consentement explicite.
                  </p>

                  <h6 className="fw-bold mt-4">5. Vos droits</h6>
                  <p className="text-muted">
                    Vous avez le droit d'accéder, de modifier ou de supprimer vos données à tout
                    moment. Contactez-nous à privacy@elearning.com pour toute demande.
                  </p>

                  <h6 className="fw-bold mt-4">6. Cookies</h6>
                  <p className="text-muted">
                    Nous utilisons des cookies pour améliorer votre expérience de navigation.
                    Vous pouvez les désactiver dans les paramètres de votre navigateur.
                  </p>

                  <h6 className="fw-bold mt-4">7. Modifications</h6>
                  <p className="text-muted mb-0">
                    Nous nous réservons le droit de modifier cette politique à tout moment.
                    Les changements seront communiqués par email.
                  </p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      id="accept-privacy"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      label={
                        <span>
                          J'ai lu et j'accepte la{' '}
                          <strong>politique de confidentialité</strong> *
                        </span>
                      }
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100"
                    disabled={!accepted || loading}
                  >
                    {loading ? 'Validation...' : 'Valider et Accéder à ma plateforme'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PrivacyPolicy;