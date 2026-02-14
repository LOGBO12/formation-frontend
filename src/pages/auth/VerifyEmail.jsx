import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { CheckCircle, XCircle, Mail, ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);
  
  // Éviter les doubles appels en mode StrictMode
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!hasVerified.current) {
      hasVerified.current = true;
      verifyEmail();
    }
  }, []);

  const verifyEmail = async () => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setError('Lien de vérification invalide. Paramètres manquants.');
      setVerifying(false);
      return;
    }

    try {
      const response = await api.post('/auth/verify-email', { token, email });

      if (response.data.success) {
        setVerified(true);
        toast.success('Email vérifié avec succès !');

        //  MODIFICATION : passer l'email via state pour pré-remplir le formulaire de connexion
        setTimeout(() => {
          navigate('/login', {
            state: {
              emailVerified: true,
              email: email,
              toastMessage: '✅ Email vérifié ! Entrez votre mot de passe pour vous connecter.',
            },
          });
        }, 3000);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la vérification';
      setError(message);
      if (err.response?.data?.expired) {
        setExpired(true);
      }
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const resendVerification = async () => {
    const email = searchParams.get('email');
    if (!email) { toast.error('Email non fourni'); return; }

    try {
      const response = await api.post('/auth/resend-verification', { email });
      if (response.data.success) {
        toast.success('Email de vérification renvoyé ! Vérifiez votre boîte de réception.');
      }
    } catch (err) {
      toast.error('Erreur lors de l\'envoi');
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="border-0 shadow-lg">
              <Card.Body className="p-5">
                <Link to="/login" className="d-flex align-items-center text-primary text-decoration-none mb-4">
                  <ArrowLeft size={20} className="me-2" />
                  Retour à la connexion
                </Link>

                <div className="text-center mb-4">
                  {verifying ? (
                    <>
                      <div className="mb-3">
                        <Spinner animation="border" variant="primary" style={{ width: 60, height: 60 }} />
                      </div>
                      <h4 className="fw-bold text-primary">Vérification en cours...</h4>
                      <p className="text-muted">
                        Veuillez patienter pendant que nous vérifions votre email
                      </p>
                    </>
                  ) : verified ? (
                    <>
                      <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                           style={{ width: 100, height: 100 }}>
                        <CheckCircle size={60} className="text-success" />
                      </div>
                      <h4 className="fw-bold text-success mb-3">Email vérifié ! ✅</h4>

                      <Alert variant="success" className="text-start">
                        <p className="mb-2">
                          <strong>Félicitations !</strong> Votre adresse email a été vérifiée avec succès.
                        </p>
                        <p className="mb-0">
                          Vous allez être redirigé vers la page de connexion dans quelques secondes...
                        </p>
                      </Alert>

                      <div className="mt-4">
                        <Button as={Link} to="/login" variant="success" size="lg" className="px-5">
                          Se connecter maintenant
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                           style={{ width: 100, height: 100 }}>
                        {expired
                          ? <Clock size={60} className="text-warning" />
                          : <XCircle size={60} className="text-danger" />
                        }
                      </div>

                      <h4 className="fw-bold text-danger mb-3">
                        {expired ? 'Lien expiré ⏱️' : 'Vérification échouée ❌'}
                      </h4>

                      <Alert variant={expired ? 'warning' : 'danger'} className="text-start">
                        <p className="mb-0">{error}</p>
                      </Alert>

                      {expired && (
                        <Alert variant="info" className="text-start">
                          <p className="mb-0">
                            💡 Les liens de vérification expirent après 24 heures pour des raisons de sécurité.
                          </p>
                        </Alert>
                      )}

                      <div className="mt-4">
                        <Button variant="primary" onClick={resendVerification} className="w-100 mb-3">
                          <Mail size={20} className="me-2" />
                          Renvoyer l'email de vérification
                        </Button>
                        <Button as={Link} to="/register" variant="outline-primary" className="w-100">
                          Créer un nouveau compte
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {!verifying && !verified && (
                  <div className="text-center mt-4">
                    <Link to="/login" className="text-primary text-decoration-none">
                      Retour à la connexion
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>

            {!verifying && (
              <div className="text-center mt-4">
                <small className="text-muted">
                  🔒 Le lien de vérification expire après 24 heures
                </small>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VerifyEmail;