import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { Mail, Eye, Check, X, Search, Filter, Trash2, MessageSquare, Clock } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [statusFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/contacts`, {
        params: {
          status: statusFilter,
          search: searchTerm
        }
      });
      
      if (response.data.success) {
        setContacts(response.data.submissions.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleViewContact = async (id) => {
    try {
      const response = await api.get(`/admin/contacts/${id}`);
      if (response.data.success) {
        setSelectedContact(response.data.submission);
        setAdminNotes(response.data.submission.admin_notes || '');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement du contact');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setProcessing(true);
      const response = await api.patch(`/admin/contacts/${id}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        toast.success('Statut mis à jour');
        fetchContacts();
        if (selectedContact?.id === id) {
          setSelectedContact(response.data.submission);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkAsResolved = async () => {
    if (!selectedContact) return;

    try {
      setProcessing(true);
      const response = await api.post(`/admin/contacts/${selectedContact.id}/respond`, {
        admin_notes: adminNotes
      });
      
      if (response.data.success) {
        toast.success('Contact marqué comme résolu');
        setShowModal(false);
        fetchContacts();
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la résolution');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette soumission ?')) return;

    try {
      const response = await api.delete(`/admin/contacts/${id}`);
      if (response.data.success) {
        toast.success('Contact supprimé');
        fetchContacts();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { variant: 'primary', label: 'Nouveau' },
      in_progress: { variant: 'warning', label: 'En cours' },
      resolved: { variant: 'success', label: 'Résolu' }
    };
    return badges[status] || badges.new;
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    in_progress: contacts.filter(c => c.status === 'in_progress').length,
    resolved: contacts.filter(c => c.status === 'resolved').length
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold mb-0">
            <MessageSquare className="me-2" size={32} />
            Gestion des Contacts
          </h2>
          <p className="text-muted">Gérez les messages reçus via le formulaire de contact</p>
        </Col>
      </Row>

      {/* Statistiques */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Total</small>
                  <h3 className="fw-bold mb-0">{stats.total}</h3>
                </div>
                <Mail size={40} className="text-primary opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Nouveaux</small>
                  <h3 className="fw-bold mb-0 text-primary">{stats.new}</h3>
                </div>
                <Mail size={40} className="text-primary opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">En cours</small>
                  <h3 className="fw-bold mb-0 text-warning">{stats.in_progress}</h3>
                </div>
                <Clock size={40} className="text-warning opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Résolus</small>
                  <h3 className="fw-bold mb-0 text-success">{stats.resolved}</h3>
                </div>
                <Check size={40} className="text-success opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtres */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <Form.Group>
                <div className="input-group">
                  <span className="input-group-text">
                    <Search size={20} />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Rechercher par nom, email ou sujet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <div className="input-group">
                  <span className="input-group-text">
                    <Filter size={20} />
                  </span>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="new">Nouveaux</option>
                    <option value="in_progress">En cours</option>
                    <option value="resolved">Résolus</option>
                  </Form.Select>
                </div>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button variant="primary" className="w-100" onClick={fetchContacts}>
                Actualiser
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Liste des contacts */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Chargement...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-5">
              <Mail size={64} className="text-muted mb-3 opacity-50" />
              <p className="text-muted">Aucun contact trouvé</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Date</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Sujet</th>
                  <th>Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className="text-muted small">
                      {formatDistanceToNow(new Date(contact.created_at), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </td>
                    <td>
                      <strong>{contact.name}</strong>
                    </td>
                    <td>
                      <a href={`mailto:${contact.email}`} className="text-decoration-none">
                        {contact.email}
                      </a>
                    </td>
                    <td>{contact.subject}</td>
                    <td>
                      <Badge bg={getStatusBadge(contact.status).variant}>
                        {getStatusBadge(contact.status).label}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewContact(contact.id)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(contact.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de détails */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Détails du Contact</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedContact && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Nom:</strong>
                  <p>{selectedContact.name}</p>
                </Col>
                <Col md={6}>
                  <strong>Email:</strong>
                  <p>
                    <a href={`mailto:${selectedContact.email}`}>
                      {selectedContact.email}
                    </a>
                  </p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Sujet:</strong>
                  <p>{selectedContact.subject}</p>
                </Col>
                <Col md={6}>
                  <strong>Date:</strong>
                  <p>{new Date(selectedContact.created_at).toLocaleString('fr-FR')}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <strong>Message:</strong>
                  <Card className="bg-light mt-2">
                    <Card.Body>
                      <p className="mb-0 white-space-pre-wrap">{selectedContact.message}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <strong>Statut actuel:</strong>
                  <div className="mt-2">
                    <Badge bg={getStatusBadge(selectedContact.status).variant} className="me-2">
                      {getStatusBadge(selectedContact.status).label}
                    </Badge>
                    {selectedContact.status !== 'resolved' && (
                      <div className="btn-group mt-2">
                        {selectedContact.status !== 'in_progress' && (
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleUpdateStatus(selectedContact.id, 'in_progress')}
                            disabled={processing}
                          >
                            Marquer en cours
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
              {selectedContact.status !== 'resolved' && (
                <Row>
                  <Col>
                    <strong>Notes administratives:</strong>
                    <Form.Group className="mt-2">
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Ajoutez des notes sur cette soumission..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}
              {selectedContact.responded_by && (
                <Alert variant="info" className="mt-3">
                  <strong>Résolu par:</strong> {selectedContact.responded_by.name}
                  <br />
                  <strong>Date:</strong> {new Date(selectedContact.responded_at).toLocaleString('fr-FR')}
                  {selectedContact.admin_notes && (
                    <>
                      <br />
                      <strong>Notes:</strong> {selectedContact.admin_notes}
                    </>
                  )}
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fermer
          </Button>
          {selectedContact && selectedContact.status !== 'resolved' && (
            <Button
              variant="success"
              onClick={handleMarkAsResolved}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Traitement...
                </>
              ) : (
                <>
                  <Check size={18} className="me-2" />
                  Marquer comme résolu
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminContactsPage;