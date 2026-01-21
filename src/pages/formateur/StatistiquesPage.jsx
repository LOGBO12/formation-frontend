import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import { DollarSign, Users, BookOpen, TrendingUp, Award, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const StatistiquesPage = () => {
  const [stats, setStats] = useState(null);
  const [revenus, setRevenus] = useState(null);
  const [apprenants, setApprenants] = useState(null);
  const [inscriptionsGraph, setInscriptionsGraph] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      const [statsRes, revenusRes, apprenantsRes, graphRes] = await Promise.all([
        api.get('/statistiques'),
        api.get('/statistiques/revenus'),
        api.get('/statistiques/apprenants'),
        api.get('/statistiques/graphique-inscriptions'),
      ]);

      setStats(statsRes.data.statistiques);
      setRevenus(revenusRes.data);
      setApprenants(apprenantsRes.data);
      setInscriptionsGraph(graphRes.data.graphique || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-warning" role="status"></div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Container fluid className="py-4">
        {/* Header */}
        <div className="mb-4">
          <h3 className="fw-bold mb-1">Statistiques Détaillées</h3>
          <p className="text-muted mb-0">Analysez vos performances et revenus</p>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                    <BookOpen className="text-success" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Formations</h6>
                    <h3 className="mb-0">{stats?.total_formations || 0}</h3>
                    <small className="text-success">{stats?.formations_publiees || 0} publiées</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <Users className="text-primary" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Apprenants</h6>
                    <h3 className="mb-0">{stats?.total_apprenants || 0}</h3>
                    <small className="text-primary">Total unique</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                    <DollarSign className="text-warning" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Revenus Total</h6>
                    <h3 className="mb-0">{(stats?.revenus_total || 0).toLocaleString()}</h3>
                    <small className="text-warning">FCFA</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
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

        {/* Graphiques */}
        <Row className="mb-4">
          <Col lg={8} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Évolution des inscriptions</h5>
              </Card.Header>
              <Card.Body>
                {inscriptionsGraph.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={inscriptionsGraph}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#28a745" 
                        strokeWidth={2}
                        name="Inscriptions"
                      />
                    </LineChart>
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
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Répartition des formations</h5>
              </Card.Header>
              <Card.Body className="d-flex align-items-center justify-content-center">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Publiées', value: stats?.formations_publiees || 0 },
                        { name: 'Brouillons', value: stats?.formations_brouillon || 0 },
                        { name: 'Archivées', value: stats?.formations_archivees || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((entry, index) => (
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

        {/* Revenus par formation */}
        <Row className="mb-4">
          <Col lg={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Revenus par formation</h5>
              </Card.Header>
              <Card.Body>
                {revenus?.revenus_par_formation && revenus.revenus_par_formation.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenus.revenus_par_formation}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="formation_titre" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenus" fill="#ffc107" name="Revenus (FCFA)" />
                        <Bar dataKey="nombre_ventes" fill="#0d6efd" name="Nombre de ventes" />
                      </BarChart>
                    </ResponsiveContainer>

                    <Table responsive hover className="mt-4">
                      <thead>
                        <tr>
                          <th>Formation</th>
                          <th>Revenus</th>
                          <th>Ventes</th>
                          <th>Moy./vente</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenus.revenus_par_formation.map((item, index) => (
                          <tr key={index}>
                            <td className="fw-semibold">{item.formation_titre}</td>
                            <td className="text-success fw-bold">{item.revenus.toLocaleString()} FCFA</td>
                            <td>{item.nombre_ventes}</td>
                            <td>
                              {item.nombre_ventes > 0 
                                ? Math.round(item.revenus / item.nombre_ventes).toLocaleString()
                                : 0} FCFA
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-light">
                          <td className="fw-bold">TOTAL</td>
                          <td className="fw-bold text-success">{revenus.revenus_total?.toLocaleString()} FCFA</td>
                          <td colSpan="2"></td>
                        </tr>
                      </tfoot>
                    </Table>
                  </>
                ) : (
                  <div className="text-center py-5">
                    <DollarSign size={48} className="text-muted mb-3" />
                    <p className="text-muted">Aucun revenu pour le moment</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Apprenants par formation */}
        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Statistiques des apprenants par formation</h5>
              </Card.Header>
              <Card.Body>
                {apprenants?.apprenants_par_formation && apprenants.apprenants_par_formation.length > 0 ? (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Formation</th>
                        <th>Total</th>
                        <th>Actifs</th>
                        <th>Bloqués</th>
                        <th>En attente</th>
                        <th>Progression moy.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apprenants.apprenants_par_formation.map((item, index) => (
                        <tr key={index}>
                          <td className="fw-semibold">{item.formation_titre}</td>
                          <td>
                            <Award className="text-primary me-2" size={16} />
                            {item.total_apprenants}
                          </td>
                          <td className="text-success">{item.apprenants_actifs}</td>
                          <td className="text-danger">{item.apprenants_bloques}</td>
                          <td className="text-warning">{item.demandes_en_attente}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress flex-grow-1" style={{ height: 8 }}>
                                <div 
                                  className="progress-bar bg-primary" 
                                  style={{ width: `${item.progression_moyenne}%` }}
                                ></div>
                              </div>
                              <span className="ms-2 small">{Math.round(item.progression_moyenne)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-light">
                        <td className="fw-bold">TOTAL</td>
                        <td className="fw-bold">{apprenants.total_apprenants_unique}</td>
                        <td colSpan="4"></td>
                      </tr>
                    </tfoot>
                  </Table>
                ) : (
                  <div className="text-center py-5">
                    <Users size={48} className="text-muted mb-3" />
                    <p className="text-muted">Aucun apprenant pour le moment</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StatistiquesPage;