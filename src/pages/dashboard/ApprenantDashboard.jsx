import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ProgressBar, Badge } from 'react-bootstrap';
import { BookOpen, Award, Clock, TrendingUp, ArrowRight, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ApprenantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/apprenant/dashboard');
      setStats(response.data.statistiques);
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
      <Container fluid className="py-4">
        {/* Welcome Banner */}
        <Card className="bg-gradient mb-4 border-0 text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col md={8}>
                <h3 className="mb-2">Bienvenue, {user?.name} ! 📚</h3>
                <p className="mb-0">Continuez votre apprentissage là où vous l'avez laissé</p>
              </Col>
              <Col md={4} className="text-md-end">
                <Button 
                  variant="light" 
                  size="lg"
                  onClick={() => navigate('/apprenant/catalogue')}
                >
                  Explorer le catalogue
                  <ArrowRight size={20} className="ms-2" />
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100 hover-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                    <BookOpen className="text-info" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">En cours</h6>
                    <h3 className="mb-0">{stats?.formations_en_cours || 0}</h3>
                    <small className="text-muted">formations</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100 hover-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                    <Award className="text-success" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Complétées</h6>
                    <h3 className="mb-0">{stats?.formations_terminees || 0}</h3>
                    <small className="text-success">formations</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100 hover-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                    <Clock className="text-warning" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Heures</h6>
                    <h3 className="mb-0">{stats?.total_heures_apprentissage || 0}h</h3>
                    <small className="text-muted">d'apprentissage</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100 hover-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <TrendingUp className="text-primary" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Progression</h6>
                    <h3 className="mb-0">{stats?.progression_moyenne || 0}%</h3>
                    <small className="text-primary">moyenne</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col md={4} className="mb-3">
            <Card 
              className="border-0 shadow-sm h-100 hover-card cursor-pointer"
              onClick={() => navigate('/apprenant/mes-formations')}
            >
              <Card.Body className="text-center py-4">
                <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 70, height: 70 }}>
                  <BookOpen className="text-info" size={32} />
                </div>
                <h5 className="fw-bold mb-2">Mes Formations</h5>
                <p className="text-muted small mb-0">Continuer l'apprentissage</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-3">
            <Card 
              className="border-0 shadow-sm h-100 hover-card cursor-pointer"
              onClick={() => navigate('/apprenant/progression')}
            >
              <Card.Body className="text-center py-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 70, height: 70 }}>
                  <TrendingUp className="text-primary" size={32} />
                </div>
                <h5 className="fw-bold mb-2">Ma Progression</h5>
                <p className="text-muted small mb-0">Voir mes statistiques</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-3">
            <Card 
              className="border-0 shadow-sm h-100 hover-card cursor-pointer"
              onClick={() => navigate('/apprenant/communautes')}
            >
              <Card.Body className="text-center py-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 70, height: 70 }}>
                  <MessageSquare className="text-success" size={32} />
                </div>
                <h5 className="fw-bold mb-2">Communautés</h5>
                <p className="text-muted small mb-0">
                  {stats?.communautes_actives || 0} actives
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Formations Récentes */}
        {stats?.dernieres_formations && stats.dernieres_formations.length > 0 && (
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Continuer l'apprentissage</h5>
              <Button 
                variant="link" 
                onClick={() => navigate('/apprenant/mes-formations')}
              >
                Voir tout
              </Button>
            </Card.Header>
            <Card.Body>
              <Row>
                {stats.dernieres_formations.map((formation) => (
                  <Col md={4} key={formation.id} className="mb-3">
                    <Card className="h-100 border hover-shadow cursor-pointer" onClick={() => navigate(`/apprenant/formations/${formation.id}`)}>
                      {formation.image && (
                        <Card.Img 
                          variant="top" 
                          src={`${import.meta.env.VITE_API_URL}/storage/${formation.image}`}
                          style={{ height: '150px', objectFit: 'cover' }}
                        />
                      )}
                      <Card.Body>
                        <Badge bg="info" className="mb-2">{formation.domaine}</Badge>
                        <h6 className="fw-bold mb-2">{formation.titre}</h6>
                        <p className="text-muted small mb-3">{formation.formateur}</p>
                        <ProgressBar 
                          now={formation.progres} 
                          variant="success"
                          className="mb-2"
                          style={{ height: '6px' }}
                        />
                        <small className="text-muted">{formation.progres.toFixed(0)}% complété</small>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Empty State */}
        {(!stats?.dernieres_formations || stats.dernieres_formations.length === 0) && (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-5">
              <div className="text-center text-muted">
                <BookOpen size={64} className="mb-3 opacity-50" />
                <h4>Commencez votre voyage d'apprentissage</h4>
                <p className="mb-4">Explorez notre catalogue et trouvez la formation parfaite pour vous !</p>
                <Button variant="primary" size="lg" onClick={() => navigate('/apprenant/catalogue')}>
                  Explorer le catalogue
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Domaines d'intérêt */}
        {user?.domaines && user.domaines.length > 0 && (
          <Card className="border-0 shadow-sm mt-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Vos domaines d'intérêt</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                {user.domaines.map((domaine) => (
                  <Badge key={domaine.id} bg="info" className="fs-6 px-3 py-2">
                    {domaine.name}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>

      <style>{`
        .hover-card {
          transition: all 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .hover-shadow {
          transition: all 0.3s ease;
        }
        .hover-shadow:hover {
          box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default ApprenantDashboard;