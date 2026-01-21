import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup, ButtonGroup } from 'react-bootstrap';
import { Plus, Search, Filter, Eye, Edit, Trash2, BarChart3 } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FormationsPage = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFormations();
  }, []);

  useEffect(() => {
    filterFormations();
  }, [formations, searchTerm, statutFilter, typeFilter]);

  const fetchFormations = async () => {
    try {
      const response = await api.get('/formations');
      setFormations(response.data.formations);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const filterFormations = () => {
    let filtered = formations;

    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.titre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statutFilter !== 'all') {
      filtered = filtered.filter(f => f.statut === statutFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(f => 
        typeFilter === 'gratuit' ? f.is_free : !f.is_free
      );
    }

    setFilteredFormations(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return;

    try {
      await api.delete(`/formations/${id}`);
      toast.success('Formation supprimée');
      fetchFormations();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
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

  const stats = {
    total: formations.length,
    publiees: formations.filter(f => f.statut === 'publie').length,
    brouillons: formations.filter(f => f.statut === 'brouillon').length,
    archives: formations.filter(f => f.statut === 'archive').length,
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
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Mes Formations</h3>
            <p className="text-muted mb-0">Gérez toutes vos formations</p>
          </div>
          <Button 
            variant="success" 
            size="lg"
            onClick={() => navigate('/formateur/formations/create')}
          >
            <Plus size={20} className="me-2" />
            Nouvelle Formation
          </Button>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Total</h6>
                <h3 className="mb-0">{stats.total}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Publiées</h6>
                <h3 className="mb-0 text-success">{stats.publiees}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Brouillons</h6>
                <h3 className="mb-0 text-secondary">{stats.brouillons}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Archivées</h6>
                <h3 className="mb-0 text-warning">{stats.archives}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={5} className="mb-3 mb-md-0">
                <Form.Label>Rechercher</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Titre de la formation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3} className="mb-3 mb-md-0">
                <Form.Label>Statut</Form.Label>
                <Form.Select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}>
                  <option value="all">Tous les statuts</option>
                  <option value="publie">Publiées</option>
                  <option value="brouillon">Brouillons</option>
                  <option value="archive">Archivées</option>
                </Form.Select>
              </Col>
              <Col md={2} className="mb-3 mb-md-0">
                <Form.Label>Type</Form.Label>
                <Form.Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="all">Tous</option>
                  <option value="gratuit">Gratuit</option>
                  <option value="payant">Payant</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-secondary"
                  className="w-100"
                  onClick={() => {
                    setSearchTerm('');
                    setStatutFilter('all');
                    setTypeFilter('all');
                  }}
                >
                  <Filter size={18} className="me-2" />
                  Réinitialiser
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Formations Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body>
            {filteredFormations.length === 0 ? (
              <div className="text-center py-5">
                <Plus size={64} className="mb-3 opacity-50" />
                <h4>Aucune formation</h4>
                <p className="text-muted mb-4">
                  {searchTerm || statutFilter !== 'all' || typeFilter !== 'all' 
                    ? 'Aucune formation ne correspond à vos critères' 
                    : 'Créez votre première formation pour commencer'}
                </p>
                <Button 
                  variant="success" 
                  onClick={() => navigate('/formateur/formations/create')}
                >
                  <Plus size={18} className="me-2" />
                  Créer une formation
                </Button>
              </div>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Domaine</th>
                    <th>Prix</th>
                    <th>Statut</th>
                    <th>Modules</th>
                    <th>Apprenants</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFormations.map((formation) => (
                    <tr key={formation.id}>
                      <td>
                        <strong>{formation.titre}</strong>
                        <br />
                        <small className="text-muted">
                          {formation.description?.substring(0, 60)}...
                        </small>
                      </td>
                      <td>{formation.domaine?.name}</td>
                      <td>
                        {formation.is_free ? (
                          <Badge bg="success">Gratuit</Badge>
                        ) : (
                          <span className="fw-bold">{formation.prix} FCFA</span>
                        )}
                      </td>
                      <td>
                        <Badge bg={getStatutBadge(formation.statut)}>
                          {formation.statut}
                        </Badge>
                      </td>
                      <td className="text-center">{formation.modules?.length || 0}</td>
                      <td className="text-center">{formation.inscriptions_count || 0}</td>
                      <td>
                        <ButtonGroup size="sm">
                          <Button
                            variant="outline-primary"
                            onClick={() => navigate(`/formateur/formations/${formation.id}`)}
                            title="Gérer"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="outline-info"
                            onClick={() => navigate(`/formateur/formations/${formation.id}/stats`)}
                            title="Statistiques"
                          >
                            <BarChart3 size={16} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            onClick={() => handleDelete(formation.id)}
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            {filteredFormations.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-muted">
                  Affichage de {filteredFormations.length} formation(s) sur {formations.length}
                </small>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default FormationsPage;