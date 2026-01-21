import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { BookOpen, Users, DollarSign, Clock, Plus, TrendingUp, BarChart3, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FormateurDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        api.get('/statistiques'),
        api.get('/statistiques/graphique-inscriptions')
      ]);
      
      setStats(statsRes.data.statistiques);
      setRecentActivities(activitiesRes.data.graphique || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-success" role="status"></div>
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
              <Col>
                <h3 className="mb-2">Bienvenue, {user?.name} ! 👋</h3>
                <p className="mb-0">Voici un aperçu de votre activité</p>
              </Col>
              <Col xs="auto">
                <Button 
                  variant="light" 
                  size="lg" 
                  onClick={() => navigate('/formateur/formations/create')}
                >
                  <Plus size={20} className="me-2" />
                  Nouvelle Formation
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
                  <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                    <BookOpen className="text-success" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Mes Formations</h6>
                    <h3 className="mb-0">{stats?.total_formations || 0}</h3>
                    <small className="text-success">
                      {stats?.formations_publiees || 0} publiées
                    </small>
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
                    <Users className="text-primary" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Total Apprenants</h6>
                    <h3 className="mb-0">{stats?.total_apprenants || 0}</h3>
                    <small className="text-primary">
                      Tous vos cours
                    </small>
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
                    <DollarSign className="text-warning" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Revenus</h6>
                    <h3 className="mb-0">{(stats?.revenus_total || 0).toLocaleString()}</h3>
                    <small className="text-warning">FCFA</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100 hover-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                    <Clock className="text-info" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">En attente</h6>
                    <h3 className="mb-0">{stats?.demandes_en_attente || 0}</h3>
                    <small className="text-info">Demandes</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card 
              className="border-0 shadow-sm h-100 hover-card cursor-pointer"
              onClick={() => navigate('/formateur/formations')}
            >
              <Card.Body className="text-center py-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 70, height: 70 }}>
                  <BookOpen className="text-success" size={32} />
                </div>
                <h5 className="fw-bold mb-2">Mes Formations</h5>
                <p className="text-muted small mb-0">Gérer mes cours</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card 
              className="border-0 shadow-sm h-100 hover-card cursor-pointer"
              onClick={() => navigate('/formateur/apprenants')}
            >
              <Card.Body className="text-center py-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 70, height: 70 }}>
                  <UserCheck className="text-primary" size={32} />
                </div>
                <h5 className="fw-bold mb-2">Apprenants</h5>
                <p className="text-muted small mb-0">Gérer les inscriptions</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card 
              className="border-0 shadow-sm h-100 hover-card cursor-pointer"
              onClick={() => navigate('/formateur/statistiques')}
            >
              <Card.Body className="text-center py-4">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 70, height: 70 }}>
                  <BarChart3 className="text-warning" size={32} />
                </div>
                <h5 className="fw-bold mb-2">Statistiques</h5>
                <p className="text-muted small mb-0">Analyses détaillées</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card 
              className="border-0 shadow-sm h-100 hover-card cursor-pointer"
              onClick={() => navigate('/formateur/formations/create')}
            >
              <Card.Body className="text-center py-4">
                <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 70, height: 70 }}>
                  <Plus className="text-info" size={32} />
                </div>
                <h5 className="fw-bold mb-2">Créer</h5>
                <p className="text-muted small mb-0">Nouvelle formation</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Activity Chart */}
        <Row>
          <Col lg={8} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Évolution des inscriptions</h5>
              </Card.Header>
              <Card.Body>
                {recentActivities.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={recentActivities}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#28a745" 
                        fill="#28a74533" 
                        name="Inscriptions"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5">
                    <TrendingUp size={48} className="text-muted mb-3" />
                    <p className="text-muted">Pas encore de données</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Vos domaines</h5>
              </Card.Header>
              <Card.Body>
                {user?.domaines && user.domaines.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {user.domaines.map((domaine) => (
                      <span key={domaine.id} className="badge bg-success fs-6 px-3 py-2">
                        {domaine.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">Aucun domaine sélectionné</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .hover-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default FormateurDashboard;