import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error, pending
  const [message, setMessage] = useState('');

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const formationId = searchParams.get('formation_id');

    if (paymentStatus === 'success') {
      setStatus('success');
      setMessage('Votre paiement a été effectué avec succès !');
      
      // Redirection automatique après 3 secondes
      setTimeout(() => {
        if (formationId) {
          navigate(`/apprenant/formations/${formationId}`);
        } else {
          navigate('/apprenant/mes-formations');
        }
      }, 3000);
    } else if (paymentStatus === 'pending') {
      setStatus('pending');
      setMessage('Votre paiement est en cours de traitement...');
    } else if (paymentStatus === 'error') {
      setStatus('error');
      setMessage('Une erreur est survenue lors du paiement.');
    } else {
      setStatus('error');
      setMessage('Statut de paiement inconnu.');
    }
  }, [searchParams, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle size={80} className="text-success mb-4" />;
      case 'error':
        return <XCircle size={80} className="text-danger mb-4" />;
      case 'pending':
        return <Clock size={80} className="text-warning mb-4" />;
      default:
        return <Spinner animation="border" variant="primary" className="mb-4" />;
    }
  };

  const getVariant = () => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <Container>
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-5 text-center">
                {getIcon()}

                <h3 className="mb-3">
                  {status === 'success' && 'Paiement réussi !'}
                  {status === 'error' && 'Paiement échoué'}
                  {status === 'pending' && 'Paiement en cours'}
                  {status === 'loading' && 'Vérification du paiement...'}
                </h3>

                <Alert variant={getVariant()} className="mb-4">
                  {message}
                </Alert>

                {status === 'success' && (
                  <>
                    <p className="text-muted mb-4">
                      Vous avez maintenant accès à cette formation. Vous allez être redirigé automatiquement...
                    </p>
                    <Button 
                      variant="success" 
                      size="lg"
                      onClick={() => navigate('/apprenant/mes-formations')}
                    >
                      Accéder à mes formations
                      <ArrowRight size={20} className="ms-2" />
                    </Button>
                  </>
                )}

                {status === 'error' && (
                  <>
                    <p className="text-muted mb-4">
                      Le paiement n'a pas pu être traité. Veuillez réessayer.
                    </p>
                    <div className="d-grid gap-2">
                      <Button 
                        variant="primary"
                        onClick={() => navigate('/apprenant/catalogue')}
                      >
                        Retour au catalogue
                      </Button>
                      <Button 
                        variant="outline-secondary"
                        onClick={() => navigate('/apprenant/mes-formations')}
                      >
                        Mes formations
                      </Button>
                    </div>
                  </>
                )}

                {status === 'pending' && (
                  <>
                    <p className="text-muted mb-4">
                      Votre paiement est en cours de vérification. Vous recevrez une notification une fois le paiement confirmé.
                    </p>
                    <Button 
                      variant="warning"
                      onClick={() => navigate('/apprenant/mes-formations')}
                    >
                      Retour à mes formations
                    </Button>
                  </>
                )}

                {status === 'loading' && (
                  <Spinner animation="border" variant="primary" className="mt-3" />
                )}
              </Card.Body>
            </Card>

            {/* Support info */}
            <Card className="border-0 shadow-sm mt-3 bg-light">
              <Card.Body className="text-center small">
                <p className="mb-0 text-muted">
                  Des questions ? Contactez notre support à{' '}
                  <a href="mailto:support@elearning.com">support@elearning.com</a>
                </p>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PaymentCallbackPage;