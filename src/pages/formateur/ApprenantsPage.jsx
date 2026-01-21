import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, InputGroup, Button, Modal, ProgressBar } from 'react-bootstrap';
import { Search, Filter, Eye, UserCheck, UserX, Clock, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ApprenantsPage = () => {
  const [apprenants, setApprenants] = useState([]);
  const [filteredApprenants, setFilteredApprenants] = useState([]);
  const [formations, setFormations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formationFilter, setFormationFilter] = useState('all');
  const [statutFilter, setStatutFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApprenant, setSelectedApprenant] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterApprenants();
  }, [apprenants, searchTerm, formationFilter, statutFilter]);

  const fetchData = async () => {
    try {
      // Récupérer toutes les formations du formateur
      const formationsRes = await api.get('/formations');
      setFormations(formationsRes.data.formations);

      // Récupérer tous les apprenants de toutes les formations
      const apprenantsPromises = formationsRes.data.formations.map(f =>
        api.get(`/formations/${f.id}/apprenants`)
      );
      
      const apprenantsResponses = await Promise.all(apprenantsPromises);
      
      // Combiner et dédupliquer les apprenants
      const allApprenants = [];
      apprenantsResponses.forEach((res, index) => {
        res.data.inscriptions.forEach(inscription => {
          allApprenants.push({
            ...inscription,
            formation: formationsRes.data.formations[index],
          });
        });
      });

      setApprenants(allApprenants);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const filterApprenants = () => {
    let filtered = apprenants;

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (formationFilter !== 'all') {
      filtered = filtered.filter(a => a.formation_id === parseInt(formationFilter));
    }

    if (statutFilter !== 'all') {
      filtered = filtered.filter(a => a.statut === statutFilter);
    }

    setFilteredApprenants(filtered);
  };

  const handleAction = async (inscriptionId, action) => {
    try {
      await api.post(`/inscriptions/${inscriptionId}/${action}`);
      toast.success(`Action "${action}" effectuée`);
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de l\'action');
    }
  };

  const showDetails = (apprenant) => {
    setSelectedApprenant(apprenant);
    setShowDetailModal(true);
  };

  const getStatutBadge = (statut, isBlocked) => {
    if (isBlocked) return { bg: 'danger', label: 'Bloqué' };
    
    const badges = {
      en_attente: { bg: 'warning', label: 'En attente' },
      active: { bg: 'success', label: 'Actif' },
      approuvee: { bg: 'success', label: 'Approuvé' },
      rejetee: { bg: 'danger', label: 'Rejeté' },
    };
    return badges[statut] || { bg: 'secondary', label: statut };
  };

  const stats = {
    total: apprenants.length,
    actifs: apprenants.filter(a => a.statut === 'active' && !a.is_blocked).length,
    enAttente: apprenants.filter(a => a.statut === 'en_attente').length,
    bloques: apprenants.filter(a => a.is_blocked).length,
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
      <Container fluid className="py-4">
        {/* Header */}
        <div className="mb-4">
          <h3 className="fw-bold mb-1">Mes Apprenants</h3>
          <p className="text-muted mb-0">Gérez les inscriptions et suivez la progression</p>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <UserCheck className="text-primary" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Total</h6>
                    <h3 className="mb-0">{stats.total}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                    <CheckCircle className="text-success" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Actifs</h6>
                    <h3 className="mb-0 text-success">{stats.actifs}</h3>
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
                    <Clock className="text-warning" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">En attente</h6>
                    <h3 className="mb-0 text-warning">{stats.enAttente}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-danger bg-opacity-10 p-3 rounded me-3">
                    <UserX className="text-danger" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Bloqués</h6>
                    <h3 className="mb-0 text-danger">{stats.bloques}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={4} className="mb-3 mb-md-0">
                <Form.Label>Rechercher</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3} className="mb-3 mb-md-0">
                <Form.Label>Formation</Form.Label>
                <Form.Select value={formationFilter} onChange={(e) => setFormationFilter(e.target.value)}>
                  <option value="all">Toutes les formations</option>
                  {formations.map(f => (
                    <option key={f.id} value={f.id}>{f.titre}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3} className="mb-3 mb-md-0">
                <Form.Label>Statut</Form.Label>
                <Form.Select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}>
                  <option value="all">Tous les statuts</option>
                  <option value="en_attente">En attente</option>
                  <option value="active">Actif</option>
                  <option value="bloque">Bloqué</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-secondary"
                  className="w-100"
                  onClick={() => {
                    setSearchTerm('');
                    setFormationFilter('all');
                    setStatutFilter('all');
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
            {filteredApprenants.length === 0 ? (
              <div className="text-center py-5">
                <UserCheck size={64} className="mb-3 opacity-50" />
                <h4>Aucun apprenant</h4>
                <p className="text-muted">
                  {searchTerm || formationFilter !== 'all' || statutFilter !== 'all'
                    ? 'Aucun apprenant ne correspond à vos critères'
                    : 'Aucun apprenant inscrit pour le moment'}
                </p>
              </div>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Apprenant</th>
                    <th>Formation</th>
                    <th>Inscription</th>
                    <th>Statut</th>
                    <th>Progression</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApprenants.map((inscription) => {
                    const badge = getStatutBadge(inscription.statut, inscription.is_blocked);
                    return (
                      <tr key={inscription.id}>
                        <td>
                          <div>
                            <strong>{inscription.user?.name}</strong>
                            <br />
                            <small className="text-muted">{inscription.user?.email}</small>
                          </div>
                        </td>
                        <td>
                          <span className="fw-semibold">{inscription.formation?.titre}</span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {new Date(inscription.created_at).toLocaleDateString('fr-FR')}
                          </small>
                        </td>
                        <td>
                          <Badge bg={badge.bg}>{badge.label}</Badge>
                        </td>
                        <td>
                          <div style={{ minWidth: 100 }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted">{Math.round(inscription.progres)}%</small>
                            </div>
                            <ProgressBar 
                              now={inscription.progres} 
                              variant={inscription.progres === 100 ? 'success' : 'primary'}
                              style={{ height: 6 }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => showDetails(inscription)}
                              title="Voir détails"
                            >
                              <Eye size={16} />
                            </Button>
                            {inscription.statut === 'en_attente' && (
                              <>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleAction(inscription.id, 'approuver')}
                                  title="Approuver"
                                >
                                  <CheckCircle size={16} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleAction(inscription.id, 'rejeter')}
                                  title="Rejeter"
                                >
                                  <UserX size={16} />
                                </Button>
                              </>
                            )}
                            {inscription.statut === 'active' && !inscription.is_blocked && (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleAction(inscription.id, 'bloquer')}
                                title="Bloquer"
                              >
                                <UserX size={16} />
                              </Button>
                            )}
                            {inscription.is_blocked && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleAction(inscription.id, 'debloquer')}
                                title="Débloquer"
                              >
                                <UserCheck size={16} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}

            {filteredApprenants.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-muted">
                  Affichage de {filteredApprenants.length} apprenant(s) sur {apprenants.length}
                </small>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Modal Détails */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Détails de l'apprenant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApprenant && (
            <>
              <h5 className="mb-3">{selectedApprenant.user?.name}</h5>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Email:</strong>
                  <p>{selectedApprenant.user?.email}</p>
                </Col>
                <Col md={6}>
                  <strong>Formation:</strong>
                  <p>{selectedApprenant.formation?.titre}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Date d'inscription:</strong>
                  <p>{new Date(selectedApprenant.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </Col>
                <Col md={6}>
                  <strong>Statut:</strong>
                  <p>
                    <Badge bg={getStatutBadge(selectedApprenant.statut, selectedApprenant.is_blocked).bg}>
                      {getStatutBadge(selectedApprenant.statut, selectedApprenant.is_blocked).label}
                    </Badge>
                  </p>
                </Col>
              </Row>

              <div className="mb-3">
                <strong>Progression:</strong>
                <div className="mt-2">
                  <ProgressBar 
                    now={selectedApprenant.progres} 
                    label={`${Math.round(selectedApprenant.progres)}%`}
                    variant={selectedApprenant.progres === 100 ? 'success' : 'primary'}
                  />
                </div>
              </div>

              {selectedApprenant.date_completion && (
                <div>
                  <strong>Date de complétion:</strong>
                  <p>{new Date(selectedApprenant.date_completion).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ApprenantsPage;