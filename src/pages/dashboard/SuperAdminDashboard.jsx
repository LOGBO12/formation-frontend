 /** import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Badge } from 'react-bootstrap';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [domaines, setDomaines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDomaine, setEditingDomaine] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDomaines();
  }, []);

  const fetchDomaines = async () => {
    try {
      const response = await api.get('/admin/domaines');
      setDomaines(response.data.domaines);
    } catch (err) {
      toast.error('Erreur lors du chargement des domaines');
    }
  };

  const handleOpenModal = (domaine = null) => {
    if (domaine) {
      setEditingDomaine(domaine);
      setFormData({
        name: domaine.name,
        description: domaine.description || '',
        icon: domaine.icon || '',
      });
    } else {
      setEditingDomaine(null);
      setFormData({ name: '', description: '', icon: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDomaine(null);
    setFormData({ name: '', description: '', icon: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingDomaine) {
        await api.put(`/admin/domaines/${editingDomaine.id}`, formData);
        toast.success('Domaine mis à jour avec succès');
      } else {
        await api.post('/admin/domaines', formData);
        toast.success('Domaine créé avec succès');
      }
      fetchDomaines();
      handleCloseModal();
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce domaine ?')) return;

    try {
      await api.delete(`/admin/domaines/${id}`);
      toast.success('Domaine supprimé');
      fetchDomaines();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/admin/domaines/${id}/toggle`);
      toast.success('Statut mis à jour');
      fetchDomaines();
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="min-vh-100 bg-light">

      <Container fluid className="py-4">
        {/* Stats Cards 
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Total Domaines</h6>
                <h3 className="mb-0">{domaines.length}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Domaines Actifs</h6>
                <h3 className="mb-0 text-success">
                  {domaines.filter((d) => d.is_active).length}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Domaines Inactifs</h6>
                <h3 className="mb-0 text-danger">
                  {domaines.filter((d) => !d.is_active).length}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Formateurs</h6>
                <h3 className="mb-0">0</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Gestion des Domaines 
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Gestion des Domaines</h5>
              <Button variant="primary" onClick={() => handleOpenModal()}>
                <Plus size={18} className="me-2" />
                Nouveau Domaine
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Icône</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {domaines.map((domaine) => (
                  <tr key={domaine.id}>
                    <td className="fw-bold">{domaine.name}</td>
                    <td className="text-muted">{domaine.description}</td>
                    <td>{domaine.icon}</td>
                    <td>
                      <Badge bg={domaine.is_active ? 'success' : 'danger'}>
                        {domaine.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleOpenModal(domaine)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleToggleStatus(domaine.id)}
                      >
                        {domaine.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(domaine.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* Modal Création/Edition 
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingDomaine ? 'Modifier le domaine' : 'Nouveau domaine'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nom *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Icône</Form.Label>
              <Form.Control
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="code, palette, etc."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;   */