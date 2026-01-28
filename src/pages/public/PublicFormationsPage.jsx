import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Alert } from 'react-bootstrap';
import { Search, Filter, BookOpen, Users, Star, Clock, DollarSign, ArrowRight, LogIn } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PublicFormationsPage = () => {
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

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les domaines
      const domainesRes = await api.get('/domaines');
      setDomaines(domainesRes.data.domaines);

      // Pour le moment, simuler des formations publiques
      const formationsRes = await api.get('/domaines');
      
      // Données de démonstration
      const mockFormations = [
        {
          id: 1,
          titre: "Maîtriser React.js de A à Z",
          description: "Apprenez React.js de zéro jusqu'à devenir un expert. Création d'applications modernes et performantes.",
          prix: 25000,
          is_free: false,
          image: null,
          formateur: { name: "Jean Dupont" },
          domaine: { name: "Développement Web", id: 1 },
          inscriptions_count: 156,
          duree_estimee: 40,
          lien_public: "react-masterclass-2024"
        },
        {
          id: 2,
          titre: "Introduction au Design UX/UI",
          description: "Découvrez les principes fondamentaux du design d'expérience utilisateur et d'interface.",
          prix: 0,
          is_free: true,
          image: null,
          formateur: { name: "Marie Martin" },
          domaine: { name: "Design", id: 2 },
          inscriptions_count: 423,
          duree_estimee: 15,
          lien_public: "ux-ui-intro-free"
        },
        {
          id: 3,
          titre: "Marketing Digital pour Débutants",
          description: "Apprenez les bases du marketing digital : SEO, réseaux sociaux, email marketing et plus encore.",
          prix: 18000,
          is_free: false,
          image: null,
          formateur: { name: "Pierre Dubois" },
          domaine: { name: "Marketing", id: 3 },
          inscriptions_count: 289,
          duree_estimee: 25,
          lien_public: "marketing-digital-basics"
        },
        {
          id: 4,
          titre: "Python pour l'Analyse de Données",
          description: "Formation complète sur Python appliqué à la data science : pandas, numpy, matplotlib, et machine learning.",
          prix: 30000,
          is_free: false,
          image: null,
          formateur: { name: "Sophie Bernard" },
          domaine: { name: "Data Science", id: 4 },
          inscriptions_count: 198,
          duree_estimee: 50,
          lien_public: "python-data-analysis"
        },
        {
          id: 5,
          titre: "Photographie pour Débutants",
          description: "Maîtrisez les bases de la photographie : composition, lumière, réglages et post-traitement.",
          prix: 0,
          is_free: true,
          image: null,
          formateur: { name: "Luc Petit" },
          domaine: { name: "Photographie", id: 5 },
          inscriptions_count: 567,
          duree_estimee: 12,
          lien_public: "photo-basics-free"
        },
        {
          id: 6,
          titre: "Gestion de Projet Agile",
          description: "Apprenez les méthodologies agiles (Scrum, Kanban) pour gérer vos projets efficacement.",
          prix: 22000,
          is_free: false,
          image: null,
          formateur: { name: "Claire Roux" },
          domaine: { name: "Business", id: 6 },
          inscriptions_count: 234,
          duree_estimee: 20,
          lien_public: "agile-project-management"
        }
      ];

      setFormations(mockFormations);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredFormations = formations.filter(formation => {
    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!formation.titre.toLowerCase().includes(searchLower) &&
          !formation.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Filtre par domaine
    if (filters.domaine_id && formation.domaine.id !== parseInt(filters.domaine_id)) {
      return false;
    }

    // Filtre gratuit/payant
    if (filters.is_free !== '') {
      if (filters.is_free === '1' && !formation.is_free) return false;
      if (filters.is_free === '0' && formation.is_free) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sort_by) {
      case 'popular':
        return b.inscriptions_count - a.inscriptions_count;
      case 'price_asc':
        return a.prix - b.prix;
      case 'price_desc':
        return b.prix - a.prix;
      default:
        return 0;
    }
  });

  const handleFormationClick = (formation) => {
    navigate('/login', { 
      state: { 
        from: `/formations/${formation.lien_public}`,
        message: 'Connectez-vous pour accéder à cette formation' 
      } 
    });
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
      {/* Hero Section - CORRIGÉ avec meilleur alignement */}
      <div className="py-5 text-white" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="display-5 fw-bold mb-3">Catalogue de Formations</h1>
              <p className="lead mb-0 opacity-90">
                Découvrez nos {formations.length} formations pour développer vos compétences. 
                Formations gratuites et payantes disponibles.
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
      <Container className="py-4">
        <Row>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <h3 className="text-primary mb-1">{formations.length}</h3>
                <small className="text-muted">Formations disponibles</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <h3 className="text-success mb-1">
                  {formations.filter(f => f.is_free).length}
                </h3>
                <small className="text-muted">Formations gratuites</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <h3 className="text-info mb-1">200+</h3>
                <small className="text-muted">Formateurs experts</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <h3 className="text-warning mb-1">5000+</h3>
                <small className="text-muted">Étudiants actifs</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

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
            {filteredFormations.length} formation(s) trouvée(s)
          </h5>
        </div>

        {filteredFormations.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <BookOpen size={64} className="text-muted mb-3 opacity-50" />
              <h5 className="text-muted">Aucune formation trouvée</h5>
              <p className="text-muted">Essayez de modifier vos filtres</p>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {filteredFormations.map((formation) => (
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
                  
                  {/* Image placeholder */}
                  <div 
                    className="d-flex align-items-center justify-content-center text-white"
                    style={{ 
                      height: '200px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    <BookOpen size={80} className="opacity-50" />
                  </div>
                  
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
                      onClick={() => handleFormationClick(formation)}
                    >
                      {formation.is_free ? (
                        <>Commencer gratuitement</>
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