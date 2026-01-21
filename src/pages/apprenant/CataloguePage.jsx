import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { Search, Filter, BookOpen, Users, Star, DollarSign, Heart } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CataloguePage = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    domaine_id: '',
    is_free: '',
    sort_by: 'recent'
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchDomaines();
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

  const fetchFormations = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        page
      });
      
      const response = await api.get(`/apprenant/catalogue?${params}`);
      setFormations(response.data.formations.data);
      setPagination(response.data.formations);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleInscription = async (formationId) => {
    try {
      await api.post(`/inscriptions/formations/${formationId}/demander`);
      toast.success('Demande envoyée avec succès !');
      fetchFormations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  if (loading && formations.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-gradient text-white py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Container>
          <h2 className="fw-bold mb-2">Catalogue des Formations</h2>
          <p className="mb-0">Découvrez des milliers de formations pour développer vos compétences</p>
        </Container>
      </div>

      <Container className="py-4">
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
            {pagination?.total || 0} formation(s) disponible(s)
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
                  {formation.is_recommended && (
                    <div className="position-absolute top-0 start-0 m-3" style={{ zIndex: 1 }}>
                      <Badge bg="warning" className="text-dark">
                        <Star size={14} className="me-1" />
                        Recommandé
                      </Badge>
                    </div>
                  )}
                  
                  {formation.image && (
                    <Card.Img
                      variant="top"
                      src={`${import.meta.env.VITE_API_URL}/storage/${formation.image}`}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  
                  <Card.Body>
                    <div className="mb-2">
                      <Badge bg="info">{formation.domaine.name}</Badge>
                      {formation.is_free ? (
                        <Badge bg="success" className="ms-2">Gratuit</Badge>
                      ) : (
                        <Badge bg="warning" className="ms-2 text-dark">
                          {formation.prix} FCFA
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
                          📚 {formation.duree_estimee}h
                        </span>
                      )}
                    </div>
                  </Card.Body>

                  <Card.Footer className="bg-white border-top">
                    <div className="d-grid gap-2">
                      <Button
                        variant="primary"
                        onClick={() => handleInscription(formation.id)}
                      >
                        {formation.is_free ? "S'inscrire gratuitement" : "Demander l'accès"}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => navigate(`/formations/${formation.lien_public}`)}
                      >
                        Voir détails
                      </Button>
                    </div>
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

export default CataloguePage;