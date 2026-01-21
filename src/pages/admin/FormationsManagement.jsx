import { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Form, InputGroup, Row, Col, Modal } from 'react-bootstrap';
import { Search, ArrowLeft, Filter, Eye, Trash2, ToggleLeft, ToggleRight, Users, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FormationsManagement = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [domaineFilter, setDomaineFilter] = useState('all');
  const [statutFilter, setStatutFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [domaines, setDomaines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterFormations();
  }, [formations, searchTerm, domaineFilter, statutFilter, typeFilter]);

  const fetchData = async () => {
    try {
      const [formationsRes, domainesRes] = await Promise.all([
        api.get('/admin/formations'),
        api.get('/domaines')
      ]);
      setFormations(formationsRes.data.formations);
      setDomaines(domainesRes.data.domaines);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const filterFormations = () => {
    let filtered = formations;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(formation =>
        formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formation.formateur?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par domaine
    if (domaineFilter !== 'all') {
      filtered = filtered.filter(f => f.domaine_id === parseInt(domaineFilter));
    }

    // Filtre par statut
    if (statutFilter !== 'all') {
      filtered = filtered.filter(f => f.statut === statutFilter);
    }

    // Filtre par type (gratuit/payant)
    if (typeFilter !== 'all') {
      filtered = filtered.filter(f => 
        typeFilter === 'gratuit' ? f.is_free : !f.is_free
      );
    }

    setFilteredFormations(filtered);
  };

  const handleDeleteFormation = async (formationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.')) {
      return;
    }

    try {
      await api.delete(`/admin/formations/${formationId}`);
      toast.success('Formation supprimée');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleStatut = async (formationId, currentStatut) => {
    const newStatut = currentStatut === 'publie' ? 'archive' : 'publie';
    
    try {
      await api.patch(`/admin/formations/${formationId}/statut`, { statut: newStatut });
      toast.success('Statut mis à jour');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const showDetails = (formation) => {
    setSelectedFormation(formation);
    setShowDetailsModal(true);
  };

  const getStatutBadge = (statut) => {
    const badges = {
      brouillon: { bg: 'secondary', label: 'Brouillon' },
      publie: { bg: 'success', label: 'Publié' },
      archive: { bg: 'warning', label: 'Archivé' }
    };
    return badges[statut] || { bg: 'secondary', label: statut };
  };

  // Calcul des statistiques
  const stats = {
    total: formations.length,
    publiees: formations.filter(f => f.statut === 'publie').length,
    brouillons: formations.filter(f => f.statut === 'brouillon').length,
    gratuites: formations.filter(f => f.is_free).length,
    payantes: formations.filter(f => !f.is_free).length,
    totalApprenants: formations.reduce((sum, f) => sum + (f.inscriptions_count || 0), 0),
    totalRevenus: formations.reduce((sum, f) => {
      if (!f.is_free && f.inscriptions_count) {
        return sum + (f.prix * f.inscriptions_count);
      }
      return sum;
    }, 0)
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
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <Container fluid className="py-3">
          <div className="d-flex align-items-center">
            <Button variant="link" onClick={() => navigate('/dashboard/admin')} className="me-3">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h4 className="mb-0 fw-bold">Gestion des Formations</h4>
              <small className="text-muted">Superviser toutes les formations de la plateforme</small>
            </div>
          </div>
        </Container>
      </div>

      <Container fluid className="py-4">
        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-2">Total Formations</h6>
                    <h3 className="mb-0">{stats.total}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-2 rounded">
                    <span className="text-primary fw-bold">{stats.publiees}</span>
                  </div>
                </div>
                <small className="text-muted">{stats.publiees} publiées</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-2">Gratuites / Payantes</h6>
                    <h3 className="mb-0">{stats.gratuites} / {stats.payantes}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-2 rounded">
                    <DollarSign className="text-success" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-2">Total Apprenants</h6>
                    <h3 className="mb-0">{stats.totalApprenants}</h3>
                  </div>
                  <div className="bg-info bg-opacity-10 p-2 rounded">
                    <Users className="text-info" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Revenus Estimés</h6>
                <h3 className="mb-0">{(stats.totalRevenus / 1000).toFixed(0)}K</h3>
                <small className="text-muted">FCFA</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filtres */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={3} className="mb-3 mb-md-0">
                <Form.Label>Rechercher</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Titre ou formateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={2} className="mb-3 mb-md-0">
                <Form.Label>Domaine</Form.Label>
                <Form.Select value={domaineFilter} onChange={(e) => setDomaineFilter(e.target.value)}>
                  <option value="all">Tous</option>
                  {domaines.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2} className="mb-3 mb-md-0">
                <Form.Label>Statut</Form.Label>
                <Form.Select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}>
                  <option value="all">Tous</option>
                  <option value="publie">Publié</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="archive">Archivé</option>
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
              <Col md={3}>
                <Button
                  variant="outline-secondary"
                  className="w-100"
                  onClick={() => {
                    setSearchTerm('');
                    setDomaineFilter('all');
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

        {/* Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Formation</th>
                    <th>Formateur</th>
                    <th>Domaine</th>
                    <th>Prix</th>
                    <th>Statut</th>
                    <th>Apprenants</th>
                    <th>Création</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFormations.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <p className="text-muted mb-0">Aucune formation trouvée</p>
                      </td>
                    </tr>
                  ) : (
                    filteredFormations.map((formation) => {
                      const badge = getStatutBadge(formation.statut);
                      return (
                        <tr key={formation.id}>
                          <td>
                            <div>
                              <strong className="d-block">{formation.titre}</strong>
                              <small className="text-muted">
                                {formation.modules?.length || 0} module(s)
                              </small>
                            </div>
                          </td>
                          <td>
                            <div className="text-muted small">
                              {formation.formateur?.name || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <Badge bg="info" className="px-2 py-1">
                              {formation.domaine?.name || 'N/A'}
                            </Badge>
                          </td>
                          <td>
                            {formation.is_free ? (
                              <Badge bg="success">Gratuit</Badge>
                            ) : (
                              <span className="fw-bold">{formation.prix} FCFA</span>
                            )}
                          </td>
                          <td>
                            <Badge bg={badge.bg}>{badge.label}</Badge>
                          </td>
                          <td className="text-center">
                            <span className="fw-bold">{formation.inscriptions_count || 0}</span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(formation.created_at).toLocaleDateString('fr-FR')}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => showDetails(formation)}
                                title="Voir détails"
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleToggleStatut(formation.id, formation.statut)}
                                title={formation.statut === 'publie' ? 'Archiver' : 'Publier'}
                              >
                                {formation.statut === 'publie' ? (
                                  <ToggleRight size={16} />
                                ) : (
                                  <ToggleLeft size={16} />
                                )}
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteFormation(formation.id)}
                                title="Supprimer"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination info */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                Affichage de {filteredFormations.length} formation(s) sur {formations.length}
              </small>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Modal Détails */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Détails de la Formation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFormation && (
            <>
              <Row className="mb-4">
                <Col md={8}>
                  <h5 className="fw-bold mb-3">{selectedFormation.titre}</h5>
                  <p className="text-muted">{selectedFormation.description}</p>
                </Col>
                <Col md={4}>
                  {selectedFormation.image && (
                    <img 
                      src={`${import.meta.env.VITE_API_URL}/storage/${selectedFormation.image}`} 
                      alt={selectedFormation.titre}
                      className="img-fluid rounded"
                    />
                  )}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Formateur:</strong>
                  <p className="mb-2">{selectedFormation.formateur?.name}</p>
                </Col>
                <Col md={6}>
                  <strong>Domaine:</strong>
                  <p className="mb-2">{selectedFormation.domaine?.name}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <strong>Prix:</strong>
                  <p className="mb-2">
                    {selectedFormation.is_free ? 'Gratuit' : `${selectedFormation.prix} FCFA`}
                  </p>
                </Col>
                <Col md={4}>
                  <strong>Durée estimée:</strong>
                  <p className="mb-2">{selectedFormation.duree_estimee || 'N/A'} heures</p>
                </Col>
                <Col md={4}>
                  <strong>Statut:</strong>
                  <p className="mb-2">
                    <Badge bg={getStatutBadge(selectedFormation.statut).bg}>
                      {getStatutBadge(selectedFormation.statut).label}
                    </Badge>
                  </p>
                </Col>
              </Row>

              <hr />

              <Row>
                <Col md={6}>
                  <strong>Modules:</strong>
                  <p className="mb-2">{selectedFormation.modules?.length || 0}</p>
                </Col>
                <Col md={6}>
                  <strong>Apprenants inscrits:</strong>
                  <p className="mb-2">{selectedFormation.inscriptions_count || 0}</p>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <strong>Date de création:</strong>
                  <p className="mb-2">
                    {new Date(selectedFormation.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </Col>
                <Col md={6}>
                  <strong>Dernière modification:</strong>
                  <p className="mb-2">
                    {new Date(selectedFormation.updated_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </Col>
              </Row>

              {selectedFormation.lien_public && (
                <>
                  <hr />
                  <strong>Lien public:</strong>
                  <div className="bg-light p-2 rounded mt-2">
                    <code className="small">
                      {window.location.origin}/formations/lien/{selectedFormation.lien_public}
                    </code>
                  </div>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FormationsManagement;