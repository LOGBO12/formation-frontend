import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { Mail, Trash2, Download, Search, TrendingUp, Users, UserCheck, UserX } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminNewsletterPage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, [statusFilter]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/newsletter/subscribers`, {
        params: {
          status: statusFilter,
          search: searchTerm
        }
      });
      
      if (response.data.success) {
        setSubscribers(response.data.subscribers.data);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des abonnés');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${email} ?`)) return;

    try {
      const response = await api.delete(`/admin/newsletter/subscribers/${id}`);
      if (response.data.success) {
        toast.success('Abonné supprimé');
        fetchSubscribers();
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/newsletter/export');
      
      if (response.data.success) {
        const emails = response.data.emails.join('\n');
        const blob = new Blob([emails], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success(`${response.data.count} emails exportés`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-0">
                <Mail className="me-2" size={32} />
                Gestion Newsletter
              </h2>
              <p className="text-muted">Gérez les abonnés à votre newsletter</p>
            </div>
            <Button variant="success" onClick={handleExport}>
              <Download size={18} className="me-2" />
              Exporter les emails
            </Button>
          </div>
        </Col>
      </Row>

      {/* Statistiques */}
      {stats && (
        <>
          <Row className="mb-4">
            <Col md={3} className="mb-3">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted">Total</small>
                      <h3 className="fw-bold mb-0">{stats.total}</h3>
                    </div>
                    <Users size={40} className="text-primary opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted">Actifs</small>
                      <h3 className="fw-bold mb-0 text-success">{stats.active}</h3>
                    </div>
                    <UserCheck size={40} className="text-success opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted">Inactifs</small>
                      <h3 className="fw-bold mb-0 text-danger">{stats.inactive}</h3>
                    </div>
                    <UserX size={40} className="text-danger opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted">Ce mois</small>
                      <h3 className="fw-bold mb-0 text-info">{stats.this_month}</h3>
                    </div>
                    <TrendingUp size={40} className="text-info opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Graphique des inscriptions */}
          <Row className="mb-4">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="fw-bold mb-3">Évolution des inscriptions</h5>
                  <Row>
                    <Col md={4}>
                      <div className="text-center p-3 bg-light rounded">
                        <small className="text-muted d-block mb-1">Aujourd'hui</small>
                        <h4 className="fw-bold mb-0 text-primary">{stats.today}</h4>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center p-3 bg-light rounded">
                        <small className="text-muted d-block mb-1">Cette semaine</small>
                        <h4 className="fw-bold mb-0 text-success">{stats.this_week}</h4>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center p-3 bg-light rounded">
                        <small className="text-muted d-block mb-1">Ce mois</small>
                        <h4 className="fw-bold mb-0 text-info">{stats.this_month}</h4>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

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
                    placeholder="Rechercher par email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="primary" className="w-100" onClick={fetchSubscribers}>
                Actualiser
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Liste des abonnés */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Chargement...</p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-center py-5">
              <Mail size={64} className="text-muted mb-3 opacity-50" />
              <p className="text-muted">Aucun abonné trouvé</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Email</th>
                  <th>Date d'inscription</th>
                  <th>Statut</th>
                  <th>IP</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td>
                      <strong>{subscriber.email}</strong>
                    </td>
                    <td className="text-muted small">
                      {formatDistanceToNow(new Date(subscriber.subscribed_at), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </td>
                    <td>
                      <Badge bg={subscriber.is_active ? 'success' : 'danger'}>
                        {subscriber.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="text-muted small">
                      {subscriber.ip_address || 'N/A'}
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(subscriber.id, subscriber.email)}
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

      {/* Info */}
      <Alert variant="info" className="mt-4">
        <strong>💡 Conseil:</strong> Utilisez le bouton "Exporter les emails" pour télécharger la liste complète des abonnés actifs. Vous pourrez ensuite l'utiliser dans votre outil d'email marketing préféré.
      </Alert>
    </Container>
  );
};

export default AdminNewsletterPage;