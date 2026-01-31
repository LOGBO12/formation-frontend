import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { ArrowLeft, Users, Clock, BookOpen, Award, DollarSign, CreditCard, Shield, Info, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FormationDetailPage = () => {
  const { lienPublic } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchFormation();
  }, [lienPublic]);

  const fetchFormation = async () => {
    try {
      // ✅ Utiliser la route publique (pas besoin d'être connecté)
      const response = await api.get(`/public/formations/${lienPublic}`);
      
      if (response.data.success) {
        setFormation(response.data.formation);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Formation introuvable');
      navigate('/public/formations');
    } finally {
      setLoading(false);
    }
  };

  const handleInscription = async () => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      toast.error('Veuillez vous connecter pour vous inscrire');
      navigate('/login', { 
        state: { 
          from: `/formations/${lienPublic}`,
          message: 'Connectez-vous pour accéder à cette formation' 
        } 
      });
      return;
    }

    try {
      if (!formation.is_free) {
        // Ouvrir le modal de paiement
        setShowPaymentModal(true);
      } else {
        // Inscription gratuite directe
        await api.post(`/inscriptions/formations/${formation.id}/demander`);
        toast.success('Inscription réussie !');
        navigate('/apprenant/mes-formations');
      }
    } catch (error) {
      const message = error.response?.data?.message;
      if (message === 'Vous êtes déjà inscrit à cette formation') {
        toast.success('Vous êtes déjà inscrit à cette formation !');
        navigate('/apprenant/mes-formations');
      } else {
        toast.error(message || 'Erreur lors de l\'inscription');
      }
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Validation du numéro
    if (!phoneNumber || phoneNumber.length < 8) {
      toast.error('Veuillez entrer un numéro de téléphone valide');
      return;
    }
    
    setProcessingPayment(true);

    try {
      const response = await api.post(`/paiements/formations/${formation.id}/initier`, {
        phone_number: phoneNumber
      });

      // Rediriger vers FedaPay
      if (response.data.payment_url) {
        toast.success('Redirection vers la page de paiement...');
        setTimeout(() => {
          window.location.href = response.data.payment_url;
        }, 1000);
      } else {
        toast.error('Erreur lors de l\'initialisation du paiement');
      }
    } catch (error) {
      const message = error.response?.data?.message;
      if (message === 'Vous êtes déjà inscrit à cette formation') {
        toast.success('Vous êtes déjà inscrit !');
        navigate('/apprenant/mes-formations');
      } else {
        toast.error(message || 'Erreur de paiement');
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!formation) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Formation introuvable</Alert>
      </Container>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <Container className="py-3">
          <Button variant="link" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} className="me-2" />
            Retour
          </Button>
        </Container>
      </div>

      <Container className="py-5">
        <Row>
          <Col lg={8}>
            {/* Image */}
            {formation.image ? (
              <Card className="border-0 shadow-sm mb-4">
                <Card.Img
                  src={`${import.meta.env.VITE_API_URL}/storage/${formation.image}`}
                  style={{ height: '400px', objectFit: 'cover' }}
                />
              </Card>
            ) : (
              <Card className="border-0 shadow-sm mb-4">
                <div 
                  className="d-flex align-items-center justify-content-center text-white"
                  style={{ 
                    height: '400px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <BookOpen size={120} className="opacity-50" />
                </div>
              </Card>
            )}

            {/* Description */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h2 className="fw-bold mb-3">{formation.titre}</h2>
                <div className="mb-3">
                  <Badge bg="info" className="me-2">{formation.domaine.name}</Badge>
                  {formation.is_free ? (
                    <Badge bg="success">Gratuit</Badge>
                  ) : (
                    <Badge bg="warning" className="text-dark">
                      {parseFloat(formation.prix).toLocaleString()} FCFA
                    </Badge>
                  )}
                </div>
                <p className="text-muted mb-3">Par {formation.formateur.name}</p>
                <hr />
                <h5 className="fw-bold mb-3">Description</h5>
                <p className="text-justify" style={{ whiteSpace: 'pre-wrap' }}>
                  {formation.description}
                </p>
              </Card.Body>
            </Card>

            {/* Modules preview */}
            {formation.modules && formation.modules.length > 0 && (
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">📚 Contenu de la formation</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong>{formation.modules.length} module(s)</strong>
                    {formation.total_chapitres && (
                      <span className="text-muted"> • {formation.total_chapitres} chapitre(s)</span>
                    )}
                    {formation.duree_totale && (
                      <span className="text-muted"> • {formation.duree_totale} min</span>
                    )}
                  </div>
                  {formation.modules.map((module, index) => (
                    <div key={module.id} className="mb-3 p-3 bg-light rounded">
                      <strong>Module {index + 1}: {module.titre}</strong>
                      {module.description && (
                        <p className="text-muted small mb-2 mt-1">{module.description}</p>
                      )}
                      <div className="text-muted small">
                        {module.chapitres?.length || 0} chapitre(s)
                      </div>
                      
                      {/* Afficher les chapitres en preview */}
                      {module.chapitres && module.chapitres.length > 0 && (
                        <div className="mt-2 ms-3">
                          {module.chapitres.slice(0, 3).map((chapitre, idx) => (
                            <div key={chapitre.id} className="small text-muted mb-1">
                              {idx + 1}. {chapitre.titre}
                              {chapitre.is_preview && (
                                <Badge bg="success" className="ms-2 small">Aperçu</Badge>
                              )}
                            </div>
                          ))}
                          {module.chapitres.length > 3 && (
                            <div className="small text-muted">
                              ... et {module.chapitres.length - 3} autre(s)
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
              <Card.Body>
                <div className="text-center mb-4">
                  {formation.is_free ? (
                    <>
                      <h2 className="fw-bold text-success mb-2">Gratuit</h2>
                      <p className="text-muted small mb-0">Formation entièrement gratuite</p>
                    </>
                  ) : (
                    <>
                      <h2 className="fw-bold text-primary mb-2">
                        {parseFloat(formation.prix).toLocaleString()} FCFA
                      </h2>
                      <div className="d-flex align-items-center justify-content-center text-muted small">
                        <Shield size={14} className="me-1" />
                        <span>Paiement sécurisé via FedaPay</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="d-grid gap-3 mb-4">
                  {user ? (
                    <Button
                      variant={formation.is_free ? 'success' : 'primary'}
                      size="lg"
                      onClick={handleInscription}
                    >
                      {formation.is_free ? (
                        <>S'inscrire gratuitement</>
                      ) : (
                        <>
                          <CreditCard size={20} className="me-2" />
                          Acheter maintenant
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => navigate('/login', { 
                          state: { 
                            from: `/formations/${lienPublic}`,
                            message: 'Connectez-vous pour vous inscrire' 
                          } 
                        })}
                      >
                        <LogIn size={20} className="me-2" />
                        Se connecter pour s'inscrire
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="lg"
                        onClick={() => navigate('/register')}
                      >
                        Créer un compte
                      </Button>
                    </>
                  )}
                </div>

                {/* Info sur la garantie (si payant) */}
                {!formation.is_free && (
                  <Alert variant="info" className="mb-4 small">
                    <Info size={16} className="me-2" />
                    <strong>Paiement sécurisé</strong>
                    <p className="mb-0 mt-2">
                      Accès immédiat après paiement. Paiement par Mobile Money ou Carte bancaire.
                    </p>
                  </Alert>
                )}

                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <Users size={18} className="text-muted me-2" />
                    <span>{formation.inscriptions_count} inscrits</span>
                  </div>
                  {formation.duree_estimee && (
                    <div className="d-flex align-items-center mb-2">
                      <Clock size={18} className="text-muted me-2" />
                      <span>{formation.duree_estimee} heures de contenu</span>
                    </div>
                  )}
                  <div className="d-flex align-items-center mb-2">
                    <BookOpen size={18} className="text-muted me-2" />
                    <span>{formation.modules?.length || 0} modules</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Award size={18} className="text-muted me-2" />
                    <span>Certificat de complétion</span>
                  </div>
                </div>

                <hr />

                <div>
                  <h6 className="fw-bold mb-3">Cette formation inclut :</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">✅ Accès à vie</li>
                    <li className="mb-2">✅ Accès mobile et desktop</li>
                    <li className="mb-2">✅ Certificat de complétion</li>
                    <li className="mb-2">✅ Support formateur</li>
                    <li className="mb-2">✅ Communauté d'apprenants</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal de paiement (seulement si connecté) */}
      {user && (
        <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <CreditCard size={24} className="me-2" />
              Paiement sécurisé
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handlePayment}>
            <Modal.Body>
              <Alert variant="info" className="small">
                <Shield size={16} className="me-2" />
                Vous allez être redirigé vers <strong>FedaPay</strong> pour effectuer le paiement de manière sécurisée.
              </Alert>

              {/* Récapitulatif */}
              <div className="mb-4 p-3 bg-light rounded">
                <h6 className="fw-bold mb-3">Récapitulatif</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Formation :</span>
                  <strong>{formation.titre}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Formateur :</span>
                  <span>{formation.formateur.name}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between">
                  <strong>Montant total :</strong>
                  <strong className="text-primary fs-5">
                    {parseFloat(formation.prix).toLocaleString()} FCFA
                  </strong>
                </div>
              </div>

              {/* Numéro de téléphone */}
              <Form.Group className="mb-3">
                <Form.Label>Numéro de téléphone Mobile Money *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>📱</InputGroup.Text>
                  <Form.Control
                    type="tel"
                    placeholder="Ex: +229 97 00 00 01"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Format international : +229XXXXXXXX (Bénin), +228XXXXXXXX (Togo)
                </Form.Text>
              </Form.Group>

              {/* Méthodes de paiement */}
              <Alert variant="success" className="small mb-0">
                <strong>💳 Méthodes de paiement acceptées :</strong>
                <div className="mt-2">
                  <div className="d-flex align-items-center mb-1">
                    <span className="badge bg-success me-2">MTN</span>
                    MTN Mobile Money
                  </div>
                  <div className="d-flex align-items-center mb-1">
                    <span className="badge bg-primary me-2">Moov</span>
                    Moov Money
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="badge bg-info me-2">Carte</span>
                    Carte bancaire Visa/Mastercard
                  </div>
                </div>
              </Alert>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="secondary" 
                onClick={() => setShowPaymentModal(false)}
                disabled={processingPayment}
              >
                Annuler
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Redirection...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} className="me-2" />
                    Procéder au paiement
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default FormationDetailPage;