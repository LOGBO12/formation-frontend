import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Nav, Table, Badge } from 'react-bootstrap';
import { BookOpen, Users, DollarSign, BarChart3, Plus, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FormateurDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [formations, setFormations] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  console.log('🔵 Dashboard mounted, user:', user);
  fetchData();
}, []);

const fetchData = async () => {
  console.log('🔵 fetchData START');
  try {
    console.log('🔵 Fetching stats...');
    const statsRes = await api.get('/statistiques');
    console.log('✅ Stats OK:', statsRes.data);
    setStats(statsRes.data.statistiques);

    console.log('🔵 Fetching formations...');
    const formationsRes = await api.get('/formations');
    console.log('✅ Formations OK:', formationsRes.data);
    setFormations(formationsRes.data.formations);

    console.log('🔵 Fetching demandes...');
    const demandesRes = await api.get('/statistiques/demandes-en-attente');
    console.log('✅ Demandes OK:', demandesRes.data);
    setDemandes(demandesRes.data.demandes || []);

    console.log('✅ fetchData COMPLETE');
  } catch (error) {
    console.error('❌ Erreur fetchData:', error);
    toast.error('Erreur lors du chargement des données');
  } finally {
    setLoading(false);
  }
};

  const getStatutBadge = (statut) => {
    const badges = {
      brouillon: 'secondary',
      publie: 'success',
      archive: 'warning',
    };
    return badges[statut] || 'secondary';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
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
                <p className="mb-0">Gérez vos formations et suivez vos apprenants</p>
              </Col>
              <Col xs="auto">
                <Button variant="light" size="lg" onClick={() => navigate('/formateur/formations/create')}>
                  <Plus size={20} className="me-2" />
                  Nouvelle Formation
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                    <BookOpen className="text-success" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Mes Formations</h6>
                    <h4 className="mb-0">{stats?.total_formations || 0}</h4>
                    <small className="text-success">
                      {stats?.formations_publiees || 0} publiées
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <Users className="text-primary" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Total Apprenants</h6>
                    <h4 className="mb-0">{stats?.total_apprenants || 0}</h4>
                    <small className="text-primary">
                      Tous vos cours
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                    <DollarSign className="text-warning" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Revenus</h6>
                    <h4 className="mb-0">{stats?.revenus_total || 0} FCFA</h4>
                    <small className="text-warning">
                      Total généré
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                    <Clock className="text-info" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">En attente</h6>
                    <h4 className="mb-0">{stats?.demandes_en_attente || 0}</h4>
                    <small className="text-info">
                      Demandes d'accès
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Navigation Tabs */}
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
              Vue d'ensemble
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeTab === 'formations'} onClick={() => setActiveTab('formations')}>
              Mes Formations
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeTab === 'demandes'} onClick={() => setActiveTab('demandes')}>
              Demandes ({demandes.length})
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Content Area */}
        {activeTab === 'overview' && (
          <Row>
            <Col md={8}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Formations récentes</h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Titre</th>
                        <th>Statut</th>
                        <th>Apprenants</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formations.slice(0, 5).map((formation) => (
                        <tr key={formation.id}>
                          <td className="fw-bold">{formation.titre}</td>
                          <td>
                            <Badge bg={getStatutBadge(formation.statut)}>
                              {formation.statut}
                            </Badge>
                          </td>
                          <td>{formation.inscriptions_count || 0}</td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => navigate(`/formateur/formations/${formation.id}`)}
                            >
                              Gérer
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
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
        )}

        {activeTab === 'formations' && (
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Toutes mes formations</h5>
              <Button variant="success" onClick={() => navigate('/formateur/formations/create')}>
                <Plus size={18} className="me-2" />
                Nouvelle Formation
              </Button>
            </Card.Header>
            <Card.Body>
              {formations.length === 0 ? (
                <div className="text-center py-5">
                  <BookOpen size={64} className="mb-3 opacity-50" />
                  <h4>Aucune formation</h4>
                  <p className="text-muted">Créez votre première formation !</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Domaine</th>
                      <th>Prix</th>
                      <th>Statut</th>
                      <th>Apprenants</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formations.map((formation) => (
                      <tr key={formation.id}>
                        <td className="fw-bold">{formation.titre}</td>
                        <td>{formation.domaine?.name}</td>
                        <td>{formation.is_free ? 'Gratuit' : `${formation.prix} FCFA`}</td>
                        <td>
                          <Badge bg={getStatutBadge(formation.statut)}>
                            {formation.statut}
                          </Badge>
                        </td>
                        <td>{formation.inscriptions_count || 0}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => {
                              console.log('🔵 Clic sur Gérer, formation ID:', formation.id);
                              navigate(`/formateur/formations/${formation.id}`);
                            }}
                          >
                            Gérer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        )}

        {activeTab === 'demandes' && (
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Demandes d'accès en attente</h5>
            </Card.Header>
            <Card.Body>
              {demandes.length === 0 ? (
                <div className="text-center py-5">
                  <Clock size={64} className="mb-3 opacity-50" />
                  <h4>Aucune demande</h4>
                  <p className="text-muted">Toutes les demandes ont été traitées</p>
                </div>
              ) : (
                <p className="text-muted">Fonctionnalité à implémenter</p>
              )}
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default FormateurDashboard;