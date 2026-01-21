import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ProgressBar, Badge, Nav, Form, InputGroup } from 'react-bootstrap';
import { BookOpen, Clock, Award, Search, Filter, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const MesFormations = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, en_cours, terminees
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFormations();
  }, []);

  useEffect(() => {
    filterFormations();
  }, [formations, activeTab, searchTerm]);

  const fetchFormations = async () => {
    try {
      const response = await api.get('/apprenant/mes-formations');
      setFormations(response.data.formations);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const filterFormations = () => {
    let filtered = formations;

    // Filtre par statut
    if (activeTab === 'en_cours') {
      filtered = filtered.filter(f => f.progres < 100);
    } else if (activeTab === 'terminees') {
      filtered = filtered.filter(f => f.progres >= 100);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.formation.domaine.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFormations(filtered);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const enCours = formations.filter(f => f.progres < 100).length;
  const terminees = formations.filter(f => f.progres >= 100).length;

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <Container fluid className="py-3">
          <h4 className="mb-0 fw-bold">Mes Formations</h4>
          <small className="text-muted">Toutes vos formations inscrites</small>
        </Container>
      </div>

      <Container fluid className="py-4">
        {/* Stats */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <BookOpen className="text-primary" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Total</h6>
                    <h3 className="mb-0">{formations.length}</h3>
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
                    <Clock className="text-info" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">En cours</h6>
                    <h3 className="mb-0 text-info">{enCours}</h3>
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
                    <Award className="text-success" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Terminées</h6>
                    <h3 className="mb-0 text-success">{terminees}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <Nav variant="pills" activeKey={activeTab} onSelect={setActiveTab}>
                  <Nav.Item>
                    <Nav.Link eventKey="all">Toutes ({formations.length})</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="en_cours">En cours ({enCours})</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="terminees">Terminées ({terminees})</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Formations Grid */}
        {filteredFormations.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <BookOpen size={64} className="text-muted mb-3 opacity-50" />
              <h5 className="text-muted mb-3">Aucune formation trouvée</h5>
              {formations.length === 0 && (
                <>
                  <p className="text-muted mb-4">Commencez votre apprentissage dès maintenant !</p>
                  <Button variant="primary" onClick={() => navigate('/apprenant/catalogue')}>
                    Explorer le catalogue
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {filteredFormations.map((item) => (
              <Col lg={4} md={6} key={item.inscription_id} className="mb-4">
                <Card className="h-100 border-0 shadow-sm hover-card">
                  {item.formation.image && (
                    <div style={{ position: 'relative' }}>
                      <Card.Img
                        variant="top"
                        src={`${import.meta.env.VITE_API_URL}/storage/${item.formation.image}`}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      {item.is_completed && (
                        <Badge 
                          bg="success" 
                          className="position-absolute top-0 end-0 m-3"
                        >
                          <Award size={14} className="me-1" />
                          Terminé
                        </Badge>
                      )}
                    </div>
                  )}
                  <Card.Body>
                    <div className="mb-2">
                      <Badge bg="info">{item.formation.domaine.name}</Badge>
                    </div>
                    <h5 className="fw-bold mb-2">{item.formation.titre}</h5>
                    <p className="text-muted small mb-3">
                      Par {item.formation.formateur.name}
                    </p>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Progression</small>
                        <small className="fw-bold text-success">
                          {item.chapitres_completes}/{item.total_chapitres} chapitres
                        </small>
                      </div>
                      <ProgressBar
                        now={item.progres}
                        variant={item.progres >= 100 ? 'success' : 'primary'}
                        style={{ height: '8px' }}
                        className="rounded-pill"
                      />
                      <div className="text-center mt-2">
                        <small className="text-muted">{item.progres.toFixed(1)}%</small>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between text-muted small mb-3">
                      <span>
                        <Clock size={14} className="me-1" />
                        Dernière activité
                      </span>
                      <span>
                        {new Date(item.derniere_activite).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-white border-top">
                    <Button
                      variant={item.is_completed ? 'outline-success' : 'primary'}
                      className="w-100"
                      onClick={() => navigate(`/apprenant/formations/${item.formation.id}`)}
                    >
                      {item.is_completed ? (
                        <>Revoir le cours</>
                      ) : (
                        <>
                          Continuer
                          <ArrowRight size={18} className="ms-2" />
                        </>
                      )}
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
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
      `}</style>
    </div>
  );
};

export default MesFormations;