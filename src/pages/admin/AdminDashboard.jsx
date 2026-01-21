import { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { 
  Users, 
  BookOpen, 
  FolderOpen, 
  TrendingUp,
  UserCheck,
  DollarSign,
  Activity
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 1250,
    total_formateurs: 89,
    total_apprenants: 1156,
    total_formations: 342,
    total_domaines: 12,
    revenus_total: 2450000,
    formations_actives: 298,
    users_actifs_mois: 856
  });

  // Données pour le graphique d'inscriptions
  const inscriptionsData = [
    { mois: 'Jan', formateurs: 12, apprenants: 145 },
    { mois: 'Fév', formateurs: 15, apprenants: 178 },
    { mois: 'Mar', formateurs: 18, apprenants: 203 },
    { mois: 'Avr', formateurs: 22, apprenants: 189 },
    { mois: 'Mai', formateurs: 28, apprenants: 256 },
    { mois: 'Juin', formateurs: 35, apprenants: 312 }
  ];

  // Données pour le graphique de formations par domaine
  const formationsParDomaine = [
    { name: 'Développement', value: 89 },
    { name: 'Design', value: 67 },
    { name: 'Marketing', value: 54 },
    { name: 'Business', value: 45 },
    { name: 'Langues', value: 38 },
    { name: 'Autres', value: 49 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Données pour l'activité récente
  const activiteRecente = [
    { jour: 'Lun', connexions: 245, inscriptions: 12 },
    { jour: 'Mar', connexions: 289, inscriptions: 18 },
    { jour: 'Mer', connexions: 312, inscriptions: 15 },
    { jour: 'Jeu', connexions: 278, inscriptions: 22 },
    { jour: 'Ven', connexions: 356, inscriptions: 28 },
    { jour: 'Sam', connexions: 198, inscriptions: 8 },
    { jour: 'Dim', connexions: 167, inscriptions: 5 }
  ];

  return (
    <div className="min-vh-100 bg-light">
      <Container fluid className="py-4">
        {/* En-tête */}
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Dashboard Administrateur</h2>
          <p className="text-muted">Vue d'ensemble de la plateforme</p>
        </div>

        {/* Statistiques principales */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">Total Utilisateurs</p>
                    <h3 className="fw-bold mb-0">{stats.total_users.toLocaleString()}</h3>
                    <small className="text-success">
                      <TrendingUp size={14} className="me-1" />
                      +12% ce mois
                    </small>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <Users className="text-primary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">Formations</p>
                    <h3 className="fw-bold mb-0">{stats.total_formations}</h3>
                    <small className="text-success">
                      {stats.formations_actives} actives
                    </small>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <BookOpen className="text-success" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">Domaines Actifs</p>
                    <h3 className="fw-bold mb-0">{stats.total_domaines}</h3>
                    <small className="text-muted">
                      Catégories disponibles
                    </small>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <FolderOpen className="text-warning" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">Revenus Totaux</p>
                    <h3 className="fw-bold mb-0">{(stats.revenus_total / 1000).toFixed(0)}K</h3>
                    <small className="text-success">
                      FCFA
                    </small>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <DollarSign className="text-info" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Statistiques secondaires */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-4">
                <UserCheck size={32} className="text-success mb-2" />
                <h4 className="fw-bold mb-1">{stats.total_formateurs}</h4>
                <small className="text-muted">Formateurs</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-4">
                <Users size={32} className="text-primary mb-2" />
                <h4 className="fw-bold mb-1">{stats.total_apprenants}</h4>
                <small className="text-muted">Apprenants</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-4">
                <Activity size={32} className="text-info mb-2" />
                <h4 className="fw-bold mb-1">{stats.users_actifs_mois}</h4>
                <small className="text-muted">Actifs ce mois</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-4">
                <TrendingUp size={32} className="text-success mb-2" />
                <h4 className="fw-bold mb-1">68%</h4>
                <small className="text-muted">Taux de rétention</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Graphiques */}
        <Row className="mb-4">
          <Col lg={8} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Évolution des inscriptions</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={inscriptionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="formateurs" stroke="#28a745" strokeWidth={2} name="Formateurs" />
                    <Line type="monotone" dataKey="apprenants" stroke="#007bff" strokeWidth={2} name="Apprenants" />
                  </LineChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Formations par domaine</h5>
              </Card.Header>
              <Card.Body className="d-flex align-items-center justify-content-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={formationsParDomaine}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {formationsParDomaine.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Activité de la semaine */}
        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Activité de la semaine</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={activiteRecente}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="jour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="connexions" fill="#007bff" name="Connexions" />
                    <Bar dataKey="inscriptions" fill="#28a745" name="Nouvelles inscriptions" />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Actions rapides */}
        <Row className="mt-4">
          <Col md={4} className="mb-3">
            <Card className="border-0 shadow-sm bg-primary text-white">
              <Card.Body className="text-center py-4">
                <FolderOpen size={40} className="mb-3" />
                <h5 className="fw-bold mb-2">Gérer les Domaines</h5>
                <p className="mb-0 small">Créer, modifier ou désactiver des catégories</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="border-0 shadow-sm bg-success text-white">
              <Card.Body className="text-center py-4">
                <Users size={40} className="mb-3" />
                <h5 className="fw-bold mb-2">Gérer les Utilisateurs</h5>
                <p className="mb-0 small">Voir et modérer tous les comptes</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="border-0 shadow-sm bg-info text-white">
              <Card.Body className="text-center py-4">
                <BookOpen size={40} className="mb-3" />
                <h5 className="fw-bold mb-2">Gérer les Formations</h5>
                <p className="mb-0 small">Superviser toutes les formations</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SuperAdminDashboard;