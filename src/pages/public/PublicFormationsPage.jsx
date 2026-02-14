import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { Search, Filter, BookOpen, Users, Star, Clock, DollarSign, ArrowRight, LogIn } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PublicFormationsPage = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    domaine_id: '',
    is_free: '',
    sort_by: 'recent'
  });
  const [pagination, setPagination] = useState(null);

  const [imageErrors, setImageErrors] = useState({});

const handleImageError = (formationId) => {
  setImageErrors(prev => ({ ...prev, [formationId]: true }));
};

  useEffect(() => {
    fetchDomaines();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchFormations();
  }, [filters]);

  const fetchDomaines = async () => {
    try {
      const response = await api.get('/domaines');
      setDomaines(response.data.domaines);
    } catch (error) {
      console.error('Erreur domaines:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/public/formations/stats/general');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const fetchFormations = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        page
      });
      
      const response = await api.get(`/public/formations?${params}`);
      
      if (response.data.success) {
        setFormations(response.data.formations.data);
        setPagination(response.data.formations);
      }
    } catch (error) {
      console.error('Erreur formations:', error);
      toast.error('Erreur lors du chargement des formations');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFormationClick = (lienPublic) => {
    // Rediriger vers la page de détails (accessible sans login)
    navigate(`/formations/${lienPublic}`);
  };

  if (loading && formations.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Hero Section */}
      <div className="py-5 text-white" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="display-5 fw-bold mb-3">Catalogue de Formations</h1>
              <p className="lead mb-0 opacity-90">
                Découvrez {pagination?.total || 0} formations pour développer vos compétences. 
                {stats && ` ${stats.total_gratuit} formations gratuites disponibles.`}
              </p>
            </Col>
            <Col lg={4} className="mt-4 mt-lg-0">
              <div className="d-flex justify-content-lg-end">
                <Button 
                  variant="light" 
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="px-4 py-2"
                >
                  <LogIn size={20} className="me-2" />
                  S'inscrire gratuitement
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Stats rapides */}
      {stats && (
        <Container className="py-4">
          <Row>
            <Col md={3} className="mb-3">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <h3 className="text-primary mb-1">{stats.total_formations}</h3>
                  <small className="text-muted">Formations disponibles</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <h3 className="text-success mb-1">{stats.total_gratuit}</h3>
                  <small className="text-muted">Formations gratuites</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <h3 className="text-info mb-1">{stats.total_formateurs}+</h3>
                  <small className="text-muted">Formateurs experts</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <h3 className="text-warning mb-1">{stats.total_apprenants}+</h3>
                  <small className="text-muted">Étudiants actifs</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}

      <Container className="py-4">
        {/* Alert pour visiteurs */}
        <Alert variant="info" className="mb-4">
          <div className="d-flex align-items-center">
            <LogIn size={24} className="me-3" />
            <div className="flex-grow-1">
              <strong>Vous n'êtes pas encore inscrit ?</strong>
              <p className="mb-0 mt-1">
                Créez un compte gratuit pour accéder aux formations et commencer à apprendre dès maintenant.
              </p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => navigate('/register')}
              className="ms-3"
            >
              S'inscrire
            </Button>
          </div>
        </Alert>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Rechercher une formation..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={filters.domaine_id}
                  onChange={(e) => handleFilterChange('domaine_id', e.target.value)}
                >
                  <option value="">Tous les domaines</option>
                  {domaines.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filters.is_free}
                  onChange={(e) => handleFilterChange('is_free', e.target.value)}
                >
                  <option value="">Tous</option>
                  <option value="1">Gratuit</option>
                  <option value="0">Payant</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                >
                  <option value="recent">Plus récentes</option>
                  <option value="popular">Plus populaires</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Results */}
        <div className="mb-3">
          <h5 className="text-muted">
            {pagination?.total || 0} formation(s) trouvée(s)
          </h5>
        </div>

        {formations.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <BookOpen size={64} className="text-muted mb-3 opacity-50" />
              <h5 className="text-muted">Aucune formation trouvée</h5>
              <p className="text-muted">Essayez de modifier vos filtres</p>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {formations.map((formation) => (
              <Col lg={4} md={6} key={formation.id} className="mb-4">
                <Card className="h-100 border-0 shadow-sm hover-card">
                  {formation.is_free && (
                    <div className="position-absolute top-0 start-0 m-3" style={{ zIndex: 1 }}>
                      <Badge bg="success" className="text-white">
                        <Star size={14} className="me-1" />
                        GRATUIT
                      </Badge>
                    </div>
                  )}
                  
                 {formation.image && !imageErrors[formation.id] ? (
                      <Card.Img
                        variant="top"
                        src={`${import.meta.env.VITE_API_URL}/storage/${formation.image}`}
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={() => handleImageError(formation.id)}
                      />
                    ) : (
                      <div 
                        className="d-flex align-items-center justify-content-center text-white"
                        style={{ 
                          height: '200px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                      >
                        <BookOpen size={80} className="opacity-50" />
                      </div>
                    )}
                                      
                  <Card.Body>
                    <div className="mb-2">
                      <Badge bg="info">{formation.domaine.name}</Badge>
                      {!formation.is_free && (
                        <Badge bg="warning" className="ms-2 text-dark">
                          {parseFloat(formation.prix).toLocaleString()} FCFA
                        </Badge>
                      )}
                    </div>

                    <h5 className="fw-bold mb-2">{formation.titre}</h5>
                    <p className="text-muted small mb-2">
                      Par {formation.formateur.name}
                    </p>
                    <p className="text-muted small mb-3" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {formation.description}
                    </p>

                    <div className="d-flex justify-content-between text-muted small mb-3">
                      <span>
                        <Users size={14} className="me-1" />
                        {formation.inscriptions_count} inscrit(s)
                      </span>
                      {formation.duree_estimee && (
                        <span>
                          <Clock size={14} className="me-1" />
                          {formation.duree_estimee}h
                        </span>
                      )}
                    </div>
                  </Card.Body>

                  <Card.Footer className="bg-white border-top">
                    <Button
                      variant={formation.is_free ? "success" : "primary"}
                      className="w-100"
                      onClick={() => handleFormationClick(formation.lien_public)}
                    >
                      {formation.is_free ? (
                        <>Voir les détails</>
                      ) : (
                        <>
                          <DollarSign size={18} className="me-2" />
                          Voir les détails
                        </>
                      )}
                      <ArrowRight size={18} className="ms-2" />
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <nav>
              <ul className="pagination">
                <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => fetchFormations(pagination.current_page - 1)}
                  >
                    Précédent
                  </button>
                </li>
                {[...Array(pagination.last_page)].map((_, index) => (
                  <li 
                    key={index} 
                    className={`page-item ${pagination.current_page === index + 1 ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => fetchFormations(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => fetchFormations(pagination.current_page + 1)}
                  >
                    Suivant
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

        {/* CTA Section */}
        <Card className="border-0 shadow-sm mt-5" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <Card.Body className="p-5 text-center text-white">
            <h3 className="fw-bold mb-3">Prêt à commencer votre apprentissage ?</h3>
            <p className="lead mb-4 opacity-90">
              Rejoignez des milliers d'apprenants qui développent leurs compétences chaque jour.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Button 
                variant="light" 
                size="lg"
                onClick={() => navigate('/register')}
                className="px-5 py-2"
              >
                Créer un compte gratuit
              </Button>
              <Button 
                variant="outline-light" 
                size="lg"
                onClick={() => navigate('/login')}
                className="px-5 py-2"
              >
                Se connecter
              </Button>
            </div>
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

export default PublicFormationsPage;