import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { ArrowLeft, Users, Clock, BookOpen, Award, DollarSign, CreditCard } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FormationDetailPage = () => {
  const { lienPublic } = useParams();
  const navigate = useNavigate();
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
      const response = await api.get(`/formations/lien/${lienPublic}`);
      setFormation(response.data.formation);
    } catch (error) {
      toast.error('Formation introuvable');
      navigate('/apprenant/catalogue');
    } finally {
      setLoading(false);
    }
  };

  const handleInscription = async () => {
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
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);

    try {
      const response = await api.post(`/paiements/formations/${formation.id}/initier`, {
        phone_number: phoneNumber
      });

      // Rediriger vers FedaPay
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        toast.error('Erreur lors de l\'initialisation du paiement');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de paiement');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
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
            {formation.image && (
              <Card className="border-0 shadow-sm mb-4">
                <Card.Img
                  src={`${import.meta.env.VITE_API_URL}/storage/${formation.image}`}
                  style={{ height: '400px', objectFit: 'cover' }}
                />
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
                      {formation.prix} FCFA
                    </Badge>
                  )}
                </div>
                <p className="text-muted mb-3">Par {formation.formateur.name}</p>
                <hr />
                <h5 className="fw-bold mb-3">Description</h5>
                <p className="text-justify">{formation.description}</p>
              </Card.Body>
            </Card>

            {/* Modules preview */}
            {formation.modules && formation.modules.length > 0 && (
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Contenu de la formation</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong>{formation.modules.length} module(s)</strong>
                  </div>
                  {formation.modules.map((module, index) => (
                    <div key={module.id} className="mb-3 p-3 bg-light rounded">
                      <strong>Module {index + 1}: {module.titre}</strong>
                      <div className="text-muted small mt-1">
                        {module.chapitres?.length || 0} chapitre(s)
                      </div>
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
                    <h2 className="fw-bold text-success">Gratuit</h2>
                  ) : (
                    <>
                      <h2 className="fw-bold text-primary">{formation.prix} FCFA</h2>
                      <small className="text-muted">Paiement sécurisé via FedaPay</small>
                    </>
                  )}
                </div>

                <div className="d-grid gap-3 mb-4">
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
                </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <Users size={18} className="text-muted me-2" />
                    <span>{formation.total_apprenants} inscrits</span>
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

      {/* Modal de paiement */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <DollarSign size={24} className="me-2" />
            Paiement sécurisé
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePayment}>
          <Modal.Body>
            <Alert variant="info" className="small">
              Vous allez être redirigé vers FedaPay pour effectuer le paiement de manière sécurisée.
            </Alert>

            <div className="mb-4 p-3 bg-light rounded">
              <div className="d-flex justify-content-between mb-2">
                <span>Formation :</span>
                <strong>{formation.titre}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Montant :</span>
                <strong className="text-primary">{formation.prix} FCFA</strong>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Numéro de téléphone *</Form.Label>
              <Form.Control
                type="tel"
                placeholder="+229 XX XX XX XX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Format : +229XXXXXXXX (Bénin), +228XXXXXXXX (Togo), etc.
              </Form.Text>
            </Form.Group>

            <Alert variant="success" className="small mb-0">
              <strong>Méthodes de paiement acceptées :</strong>
              <div className="mt-2">
                • MTN Mobile Money<br />
                • Moov Money<br />
                • Carte bancaire
              </div>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={processingPayment}>
              {processingPayment ? 'Redirection...' : 'Procéder au paiement'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default FormationDetailPage;