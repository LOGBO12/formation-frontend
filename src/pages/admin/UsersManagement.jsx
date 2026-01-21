import { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { Search, UserX, UserCheck, ArrowLeft, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const UsersManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      // À implémenter côté backend
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par rôle
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user =>
        statusFilter === 'active' ? user.is_active : !user.is_active
      );
    }

    setFilteredUsers(filtered);
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      toast.success('Statut mis à jour');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      super_admin: { bg: 'danger', label: 'Super Admin' },
      formateur: { bg: 'success', label: 'Formateur' },
      apprenant: { bg: 'primary', label: 'Apprenant' }
    };
    return badges[role] || { bg: 'secondary', label: role };
  };

  const stats = {
    total: users.length,
    formateurs: users.filter(u => u.role === 'formateur').length,
    apprenants: users.filter(u => u.role === 'apprenant').length,
    actifs: users.filter(u => u.is_active).length
  };

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
              <h4 className="mb-0 fw-bold">Gestion des Utilisateurs</h4>
              <small className="text-muted">Gérer tous les comptes utilisateurs</small>
            </div>
          </div>
        </Container>
      </div>

      <Container fluid className="py-4">
        {/* Stats */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Total Utilisateurs</h6>
                <h3 className="mb-0">{stats.total}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Formateurs</h6>
                <h3 className="mb-0 text-success">{stats.formateurs}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Apprenants</h6>
                <h3 className="mb-0 text-primary">{stats.apprenants}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Actifs</h6>
                <h3 className="mb-0 text-info">{stats.actifs}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filtres */}
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
                <Form.Label>Rôle</Form.Label>
                <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="all">Tous les rôles</option>
                  <option value="formateur">Formateurs</option>
                  <option value="apprenant">Apprenants</option>
                  <option value="super_admin">Admins</option>
                </Form.Select>
              </Col>
              <Col md={3} className="mb-3 mb-md-0">
                <Form.Label>Statut</Form.Label>
                <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-secondary"
                  className="w-100"
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                    setStatusFilter('all');
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
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Inscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const badge = getRoleBadge(user.role);
                  return (
                    <tr key={user.id}>
                      <td>
                        <div>
                          <strong>{user.name}</strong>
                          <div className="text-muted small">{user.email}</div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={badge.bg}>{badge.label}</Badge>
                      </td>
                      <td>
                        <Badge bg={user.is_active ? 'success' : 'danger'}>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <Button
                          variant={user.is_active ? 'outline-danger' : 'outline-success'}
                          size="sm"
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.is_active ? (
                            <><UserX size={16} className="me-1" /> Désactiver</>
                          ) : (
                            <><UserCheck size={16} className="me-1" /> Activer</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default UsersManagement;