import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { MessageSquare, Users, Send, Shield, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CommunautesPage = () => {
  const navigate = useNavigate();
  const [communautes, setCommunautes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunautes();
  }, []);

  const fetchCommunautes = async () => {
    try {
      const response = await api.get('/apprenant/communautes');
      setCommunautes(response.data.communautes);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <Container fluid className="py-3">
          <h4 className="mb-0 fw-bold">Mes Communautés</h4>
          <small className="text-muted">Échangez avec d'autres apprenants et formateurs</small>
        </Container>
      </div>

      <Container className="py-4">
        {/* Stats */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <MessageSquare className="text-primary" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Total</h6>
                    <h3 className="mb-0">{communautes.length}</h3>
                    <small className="text-muted">communautés</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                    <Users className="text-success" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Membres</h6>
                    <h3 className="mb-0">
                      {communautes.reduce((sum, c) => sum + c.total_membres, 0)}
                    </h3>
                    <small className="text-muted">au total</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                    <Send className="text-info" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Messages</h6>
                    <h3 className="mb-0">
                      {communautes.reduce((sum, c) => sum + c.total_messages, 0)}
                    </h3>
                    <small className="text-muted">au total</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Info Alert */}
        <Alert variant="info" className="mb-4">
          <Alert.Heading className="h6">
            💡 À propos des communautés
          </Alert.Heading>
          <p className="mb-0 small">
            Les communautés vous permettent d'échanger avec les autres apprenants et les formateurs de chaque formation.
            Posez vos questions, partagez vos expériences et apprenez ensemble !
          </p>
        </Alert>

        {/* Liste des communautés */}
        {communautes.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <MessageSquare size={64} className="text-muted mb-3 opacity-50" />
              <h5 className="text-muted mb-3">Aucune communauté</h5>
              <p className="text-muted mb-4">
                Inscrivez-vous à une formation pour rejoindre sa communauté
              </p>
              <Button variant="primary" onClick={() => navigate('/apprenant/catalogue')}>
                Explorer les formations
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {communautes.map((communaute) => (
              <Col lg={6} key={communaute.id} className="mb-4">
                <Card className="border-0 shadow-sm h-100 hover-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="fw-bold mb-2">{communaute.nom}</h5>
                        <p className="text-muted small mb-0">
                          {communaute.description}
                        </p>
                      </div>
                      <div className="bg-primary bg-opacity-10 p-2 rounded">
                        <MessageSquare className="text-primary" size={24} />
                      </div>
                    </div>

                    {/* Formation info */}
                    <div className="mb-3 p-3 bg-light rounded">
                      <div className="mb-2">
                        <Badge bg="info">{communaute.formation.domaine}</Badge>
                        {communaute.mon_role === 'admin' && (
                          <Badge bg="success" className="ms-2">
                            <Shield size={12} className="me-1" />
                            Formateur
                          </Badge>
                        )}
                        {communaute.is_muted && (
                          <Badge bg="danger" className="ms-2">
                            <AlertTriangle size={12} className="me-1" />
                            Muté
                          </Badge>
                        )}
                      </div>
                      <strong className="d-block mb-1">{communaute.formation.titre}</strong>
                      <small className="text-muted">
                        Par {communaute.formation.formateur}
                      </small>
                    </div>

                    {/* Stats */}
                    <Row className="g-2 mb-3">
                      <Col xs={6}>
                        <div className="text-center p-2 bg-light rounded">
                          <Users size={20} className="text-success mb-1" />
                          <div className="fw-bold">{communaute.total_membres}</div>
                          <small className="text-muted">Membres</small>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="text-center p-2 bg-light rounded">
                          <Send size={20} className="text-primary mb-1" />
                          <div className="fw-bold">{communaute.total_messages}</div>
                          <small className="text-muted">Messages</small>
                        </div>
                      </Col>
                    </Row>

                    {/* Date */}
                    <div className="text-muted small mb-3">
                      📅 Rejoint le {new Date(communaute.joined_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>

                    {communaute.is_muted && (
                      <Alert variant="warning" className="mb-3 py-2 small">
                        <AlertTriangle size={16} className="me-2" />
                        Vous ne pouvez pas envoyer de messages dans cette communauté.
                      </Alert>
                    )}
                  </Card.Body>

                  <Card.Footer className="bg-white border-top">
                    <Button
                      variant="primary"
                      className="w-100"
                      onClick={() => navigate(`/communaute/${communaute.id}`)}
                    >
                      <MessageSquare size={18} className="me-2" />
                      Ouvrir la communauté
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Info Box */}
        <Card className="border-0 shadow-sm bg-light mt-4">
          <Card.Body>
            <h6 className="fw-bold mb-3">📌 Règles de la communauté</h6>
            <ul className="mb-0">
              <li className="mb-2">Restez respectueux envers les autres membres</li>
              <li className="mb-2">Posez des questions claires et précises</li>
              <li className="mb-2">Partagez vos connaissances et aidez les autres</li>
              <li className="mb-2">Évitez le spam et les messages hors-sujet</li>
              <li>Signalez tout comportement inapproprié aux formateurs</li>
            </ul>
          </Card.Body>
        </Card>
      </Container>

      <style>{`
        .hover-card {
          transition: all 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default CommunautesPage;