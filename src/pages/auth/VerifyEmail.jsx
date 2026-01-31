import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setError('Lien de vérification invalide');
      setVerifying(false);
      return;
    }

    try {
      const response = await api.post('/auth/verify-email', {
        token,
        email,
      });

      if (response.data.success) {
        setVerified(true);
        toast.success('Email vérifié avec succès !');
        
        // Redirection après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la vérification';
      setError(message);
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const resendVerification = async () => {
    const email = searchParams.get('email');
    
    if (!email) {
      toast.error('Email non fourni');
      return;
    }

    try {
      const response = await api.post('/auth/resend-verification', { email });
      
      if (response.data.success) {
        toast.success('Email de vérification renvoyé !');
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
                           style={{ width: 80, height: 80 }}>
                        <CheckCircle size={50} className="text-success" />
                      </div>
                      <h4 className="fw-bold text-success">Email vérifié !</h4>
                      <p className="text-muted">
                        Votre adresse email a été vérifiée avec succès.
                      </p>
                      <p className="text-muted">
                        Redirection vers la page de connexion...
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{ width: 80, height: 80 }}>
                        <XCircle size={50} className="text-danger" />
                      </div>
                      <h4 className="fw-bold text-danger">Vérification échouée</h4>
                      <Alert variant="danger" className="mt-3">
                        {error}
                      </Alert>

                      <div className="mt-4">
                        <button 
                          className="btn btn-primary w-100"
                          onClick={resendVerification}
                        >
                          <Mail size={20} className="me-2" />
                          Renvoyer l'email de vérification
                        </button>
                      </div>

                      <div className="mt-3">
                        <Link to="/register" className="btn btn-outline-primary w-100">
                          Créer un nouveau compte
                        </Link>
                      </div>
                    </>
                  )}
                </div>

                {!verifying && verified && (
                  <div className="text-center mt-4">
                    <Link to="/login" className="btn btn-primary">
                      Aller à la connexion
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Note de sécurité */}
            {!verifying && !verified && (
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