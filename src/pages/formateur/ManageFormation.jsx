import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Nav, Badge, Table, Modal, Form } from 'react-bootstrap';
import { ArrowLeft, Edit, Trash2, Plus, Users, BarChart3, Share2, Eye } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ManageFormation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formation, setFormation] = useState(null);
  const [modules, setModules] = useState([]);
  const [apprenants, setApprenants] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('contenu');
  const [loading, setLoading] = useState(true);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showStatutModal, setShowStatutModal] = useState(false);
  const [newModule, setNewModule] = useState({ titre: '', description: '' });
  const [newStatut, setNewStatut] = useState('');

  useEffect(() => {
    fetchFormation();
  }, [id]);

const fetchFormation = async () => {
  try {
    console.log('🔵 Fetching formation, ID:', id);
    const [formationRes, statsRes] = await Promise.all([
      api.get(`/formations/${id}`),
      api.get(`/formations/${id}/statistiques`),
    ]);

    console.log('✅ Formation:', formationRes.data);
    console.log('✅ Stats:', statsRes.data);

    setFormation(formationRes.data.formation);
    setModules(formationRes.data.formation.modules || []);
    setStats(statsRes.data.statistiques);
    setNewStatut(formationRes.data.formation.statut);

    if (activeTab === 'apprenants') {
      fetchApprenants();
    }
  } catch (error) {
    console.error('❌ Erreur fetchFormation:', error);
    console.error('❌ Response:', error.response);
    toast.error('Erreur lors du chargement');
    navigate('/dashboard/formateur');
  } finally {
    setLoading(false); // CRITIQUE : Toujours mettre loading à false
  }
};
  const fetchApprenants = async () => {
    try {
      const response = await api.get(`/formations/${id}/apprenants`);
      setApprenants(response.data.inscriptions);
    } catch (error) {
      toast.error('Erreur lors du chargement des apprenants');
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/formations/${id}/modules`, newModule);
      toast.success('Module créé avec succès');
      setShowModuleModal(false);
      setNewModule({ titre: '', description: '' });
      fetchFormation();
    } catch (error) {
      toast.error('Erreur lors de la création du module');
    }
  };

  const handleChangeStatut = async () => {
    try {
      await api.patch(`/formations/${id}/statut`, { statut: newStatut });
      toast.success('Statut mis à jour');
      setShowStatutModal(false);
      fetchFormation();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) return;

    try {
      await api.delete(`/modules/${moduleId}`);
      toast.success('Module supprimé');
      fetchFormation();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const copyFormationLink = () => {
    const link = `${window.location.origin}/formations/lien/${formation.lien_public}`;
    navigator.clipboard.writeText(link);
    toast.success('Lien copié dans le presse-papier !');
  };

  const getStatutBadge = (statut) => {
    const badges = {
      brouillon: 'secondary',
      publie: 'success',
      archive: 'warning',
    };
    return badges[statut] || 'secondary';
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
      <nav className="navbar navbar-dark bg-success shadow-sm">
        <Container fluid>
          <Button variant="link" className="text-white" onClick={() => navigate('/dashboard/formateur')}>
            <ArrowLeft size={20} className="me-2" />
            Retour
          </Button>
          <span className="navbar-brand mb-0 h1">{formation.titre}</span>
          <div style={{ width: 100 }}></div>
        </Container>
      </nav>

      <Container fluid className="py-4">
        {/* En-tête Formation */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <div className="d-flex align-items-center mb-3">
                  <h3 className="mb-0 me-3">{formation.titre}</h3>
                  <Badge bg={getStatutBadge(formation.statut)}>
                    {formation.statut}
                  </Badge>
                </div>
                <p className="text-muted mb-2">{formation.description}</p>
                <div className="d-flex gap-3">
                  <span className="text-muted">
                    <strong>Domaine:</strong> {formation.domaine?.name}
                  </span>
                  <span className="text-muted">
                    <strong>Prix:</strong> {formation.is_free ? 'Gratuit' : `${formation.prix} FCFA`}
                  </span>
                  {formation.duree_estimee && (
                    <span className="text-muted">
                      <strong>Durée:</strong> {formation.duree_estimee}h
                    </span>
                  )}
                </div>
                <Nav.Item>
                  <Nav.Link active={activeTab === 'communaute'} onClick={() => setActiveTab('communaute')}>
                    Communauté
                  </Nav.Link>
                </Nav.Item>
              </Col>
              <Col md={4} className="text-end">
                <Button variant="outline-primary" className="me-2" onClick={() => setShowStatutModal(true)}>
                  Changer le statut
                </Button>
                <Button variant="outline-success" onClick={copyFormationLink}>
                  <Share2 size={18} className="me-2" />
                  Partager
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Stats rapides */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h4 className="mb-1">{stats?.total_apprenants || 0}</h4>
                <small className="text-muted">Apprenants</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h4 className="mb-1">{modules.length}</h4>
                <small className="text-muted">Modules</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h4 className="mb-1">{stats?.total_revenus || 0} FCFA</h4>
                <small className="text-muted">Revenus</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h4 className="mb-1">{Math.round(stats?.progression_moyenne || 0)}%</h4>
                <small className="text-muted">Progression moy.</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Nav variant="tabs" className="mb-4">
                  {activeTab === 'communaute' && (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              {formation.communaute ? (
                <div>
                  <h4 className="mb-3">💬 Communauté de la formation</h4>
                  <p className="text-muted mb-4">
                    Interagissez avec vos apprenants et gérez la communauté
                  </p>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={() => navigate(`/communaute/${formation.communaute.id}`)}
                    className="me-3"
                  >
                    Voir la communauté
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="lg"
                    onClick={() => navigate(`/formateur/communaute/${formation.communaute.id}/moderation`)}
                  >
                    Modération
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-muted">La communauté sera créée automatiquement lors de la première inscription.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
          <Nav.Item>
            <Nav.Link active={activeTab === 'contenu'} onClick={() => setActiveTab('contenu')}>
              Contenu
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeTab === 'apprenants'} onClick={() => { setActiveTab('apprenants'); fetchApprenants(); }}>
              Apprenants ({stats?.total_apprenants || 0})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeTab === 'statistiques'} onClick={() => setActiveTab('statistiques')}>
              Statistiques
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Contenu des tabs */}
        {activeTab === 'contenu' && (
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Modules et Chapitres</h5>
              <Button variant="success" onClick={() => setShowModuleModal(true)}>
                <Plus size={18} className="me-2" />
                Ajouter un module
              </Button>
            </Card.Header>
            <Card.Body>
              {modules.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">Aucun module. Commencez par en créer un !</p>
                </div>
              ) : (
                modules.map((module, index) => (
                  <Card key={module.id} className="mb-3">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Module {index + 1}:</strong> {module.titre}
                      </div>
                      <div>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => navigate(`/formateur/modules/${module.id}`)}
                        >
                          Gérer
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteModule(module.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </Card.Header>
                    {module.chapitres && module.chapitres.length > 0 && (
                      <Card.Body>
                        <small className="text-muted">{module.chapitres.length} chapitre(s)</small>
                      </Card.Body>
                    )}
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        )}

        {activeTab === 'apprenants' && (
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Liste des apprenants</h5>
            </Card.Header>
            <Card.Body>
              {apprenants.length === 0 ? (
                <div className="text-center py-5">
                  <Users size={64} className="mb-3 opacity-50" />
                  <p className="text-muted">Aucun apprenant inscrit</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Statut</th>
                      <th>Progression</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apprenants.map((inscription) => (
                      <tr key={inscription.id}>
                        <td>{inscription.user?.name}</td>
                        <td>{inscription.user?.email}</td>
                        <td>
                          <Badge bg={inscription.is_blocked ? 'danger' : 'success'}>
                            {inscription.is_blocked ? 'Bloqué' : inscription.statut}
                          </Badge>
                        </td>
                        <td>{Math.round(inscription.progres)}%</td>
                        <td>
                          <Button variant="outline-primary" size="sm">
                            Voir détails
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        )}

        {activeTab === 'statistiques' && (
          <Row>
            <Col md={6}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Aperçu financier</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <h6 className="text-muted">Revenus totaux</h6>
                    <h3>{stats?.total_revenus || 0} FCFA</h3>
                  </div>
                  <div>
                    <h6 className="text-muted">Type de formation</h6>
                    <p>{formation.is_free ? 'Gratuit' : `Payant - ${formation.prix} FCFA`}</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Apprenants</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <h6 className="text-muted">Total</h6>
                    <h3>{stats?.total_apprenants || 0}</h3>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Actifs: </small>
                    <strong>{stats?.inscriptions_actives || 0}</strong>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">En attente: </small>
                    <strong>{stats?.inscriptions_en_attente || 0}</strong>
                  </div>
                  <div>
                    <small className="text-muted">Bloqués: </small>
                    <strong>{stats?.inscriptions_bloquees || 0}</strong>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      {/* Modal Nouveau Module */}
      <Modal show={showModuleModal} onHide={() => setShowModuleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nouveau Module</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateModule}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Titre du module *</Form.Label>
              <Form.Control
                type="text"
                value={newModule.titre}
                onChange={(e) => setNewModule({ ...newModule, titre: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newModule.description}
                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModuleModal(false)}>
              Annuler
            </Button>
            <Button variant="success" type="submit">
              Créer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Changer Statut */}
      <Modal show={showStatutModal} onHide={() => setShowStatutModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Changer le statut</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nouveau statut</Form.Label>
            <Form.Select value={newStatut} onChange={(e) => setNewStatut(e.target.value)}>
              <option value="brouillon">Brouillon</option>
              <option value="publie">Publié</option>
              <option value="archive">Archivé</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatutModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleChangeStatut}>
            Confirmer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageFormation;