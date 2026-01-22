import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ProgressBar, Badge, Accordion } from 'react-bootstrap';
import { TrendingUp, Award, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ProgressionPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [progressionDetails, setProgressionDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgression();
  }, []);

  const fetchProgression = async () => {
    try {
      const response = await api.get('/apprenant/progression');
      setStats(response.data.statistiques);
      setProgressionDetails(response.data.progression_par_formation);
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

  // Données pour le graphique en camembert
  const pieData = stats ? [
    { name: 'Terminées', value: stats.formations_terminees, color: '#28a745' },
    { name: 'En cours', value: stats.formations_en_cours, color: '#007bff' }
  ] : [];

  // Données pour le graphique à barres
  const barData = progressionDetails.map(p => ({
    name: p.formation_titre.length > 20 ? p.formation_titre.substring(0, 20) + '...' : p.formation_titre,
    progres: parseFloat(p.progres_global || 0)
  }));

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <Container fluid className="py-3">
          <h4 className="mb-0 fw-bold">Ma Progression</h4>
          <small className="text-muted">Suivez votre évolution et vos accomplissements</small>
        </Container>
      </div>

      <Container fluid className="py-4">
        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <BookOpen className="text-primary" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Total</h6>
                    <h3 className="mb-0">{stats?.total_formations || 0}</h3>
                    <small className="text-muted">formations</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                    <Clock className="text-info" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">En cours</h6>
                    <h3 className="mb-0 text-info">{stats?.formations_en_cours || 0}</h3>
                    <small className="text-muted">formations</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                    <Award className="text-success" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Terminées</h6>
                    <h3 className="mb-0 text-success">{stats?.formations_terminees || 0}</h3>
                    <small className="text-muted">formations</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                    <TrendingUp className="text-warning" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Moyenne</h6>
                    <h3 className="mb-0 text-warning">{stats?.progression_moyenne || 0}%</h3>
                    <small className="text-muted">progression</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Graphiques */}
        <Row className="mb-4">
          <Col md={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Répartition des formations</h5>
              </Card.Header>
              <Card.Body className="d-flex align-items-center justify-content-center">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted">Aucune donnée disponible</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Chapitres complétés</h5>
              </Card.Header>
              <Card.Body className="d-flex flex-column justify-content-center">
                <div className="text-center mb-4">
                  <h2 className="display-4 fw-bold text-primary">
                    {stats?.total_chapitres_completes || 0}
                  </h2>
                  <p className="text-muted mb-0">
                    sur {stats?.total_chapitres || 0} chapitres
                  </p>
                </div>
                <ProgressBar
                  now={stats?.total_chapitres > 0 ? (stats.total_chapitres_completes / stats.total_chapitres) * 100 : 0}
                  variant="primary"
                  style={{ height: '20px' }}
                  className="rounded-pill"
                  label={`${stats?.total_chapitres > 0 ? Math.round((stats.total_chapitres_completes / stats.total_chapitres) * 100) : 0}%`}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Progression par formation */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white">
            <h5 className="mb-0">Progression par formation</h5>
          </Card.Header>
          <Card.Body>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="progres" fill="#007bff" name="Progression (%)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center py-4">Aucune formation inscrite</p>
            )}
          </Card.Body>
        </Card>

        {/* Détails par formation */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white">
            <h5 className="mb-0">Détails par formation</h5>
          </Card.Header>
          <Card.Body>
            {progressionDetails.length === 0 ? (
              <p className="text-muted text-center py-4">Aucune formation inscrite</p>
            ) : (
              <Accordion>
                {progressionDetails.map((formation, index) => {
                  const progresGlobal = parseFloat(formation.progres_global || 0);
                  
                  return (
                    <Accordion.Item eventKey={index.toString()} key={formation.formation_id}>
                      <Accordion.Header>
                        <div className="d-flex justify-content-between align-items-center w-100 me-3">
                          <div>
                            <strong>{formation.formation_titre}</strong>
                            <div className="text-muted small">{formation.domaine}</div>
                          </div>
                          <div className="text-end">
                            <Badge bg={progresGlobal >= 100 ? 'success' : 'primary'}>
                              {progresGlobal.toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Progression globale</span>
                            <span className="fw-bold">
                              {formation.chapitres_completes}/{formation.total_chapitres} chapitres
                            </span>
                          </div>
                          <ProgressBar
                            now={progresGlobal}
                            variant={progresGlobal >= 100 ? 'success' : 'primary'}
                            style={{ height: '10px' }}
                            className="rounded-pill"
                          />
                        </div>

                        <h6 className="fw-bold mb-3">Modules</h6>
                        {formation.modules.map(module => {
                          const progresModule = parseFloat(module.progres || 0);
                          
                          return (
                            <div key={module.module_id} className="mb-3 p-3 bg-light rounded">
                              <div className="d-flex justify-content-between mb-2">
                                <strong>{module.module_titre}</strong>
                                <Badge bg={progresModule >= 100 ? 'success' : 'info'}>
                                  {progresModule.toFixed(0)}%
                                </Badge>
                              </div>
                              <div className="d-flex align-items-center mb-2">
                                <CheckCircle
                                  size={16}
                                  className={progresModule >= 100 ? 'text-success' : 'text-muted'}
                                />
                                <span className="ms-2 small text-muted">
                                  {module.chapitres_completes}/{module.total_chapitres} chapitres complétés
                                </span>
                              </div>
                              <ProgressBar
                                now={progresModule}
                                variant={progresModule >= 100 ? 'success' : 'info'}
                                style={{ height: '6px' }}
                                className="rounded-pill"
                              />
                            </div>
                          );
                        })}

                        <div className="mt-3 text-muted small">
                          <div>📅 Inscrit le: {new Date(formation.date_inscription).toLocaleDateString('fr-FR')}</div>
                          <div>🕐 Dernière activité: {new Date(formation.derniere_activite).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ProgressionPage;