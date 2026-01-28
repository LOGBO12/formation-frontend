import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { DollarSign, TrendingUp, Users, BookOpen, Download, Filter, Search, Calendar } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminRevenusPage = () => {
  const [paiements, setPaiements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [filterStatus, dateFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/revenus', {
        params: {
          status: filterStatus,
          period: dateFilter,
          search: searchTerm
        }
      });
      
      if (response.data.success) {
        setPaiements(response.data.paiements);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des revenus');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { variant: 'success', label: 'Complété' },
      pending: { variant: 'warning', label: 'En attente' },
      failed: { variant: 'danger', label: 'Échoué' },
      refunded: { variant: 'secondary', label: 'Remboursé' }
    };
    return badges[status] || badges.pending;
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(montant);
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/revenus/export', {
        params: {
          status: filterStatus,
          period: dateFilter
        }
      });
      
      if (response.data.success) {
        // Créer un CSV
        const csv = response.data.data.map(row => Object.values(row).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revenus-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success('Export réussi');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  const filteredPaiements = paiements.filter(p => {
    if (searchTerm === '') return true;
    return (
      p.apprenant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.formation?.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.formateur?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold mb-0">
                  <DollarSign className="me-2" size={32} />
                  Revenus de la Plateforme
                </h2>
                <p className="text-muted">Vue d'ensemble des paiements et revenus</p>
              </div>
              <Button variant="success" onClick={handleExport}>
                <Download size={18} className="me-2" />
                Exporter
              </Button>
            </div>
          </Col>
        </Row>

        {/* Statistiques */}
        {stats && (
          <>
            <Row className="mb-4">
              <Col md={3} className="mb-3">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Revenu Total</small>
                        <h3 className="fw-bold mb-0 text-success">
                          {formatMontant(stats.total_revenus)}
                        </h3>
                        <small className="text-muted">Tous les temps</small>
                      </div>
                      <DollarSign size={40} className="text-success opacity-50" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-3">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Ce mois</small>
                        <h3 className="fw-bold mb-0 text-primary">
                          {formatMontant(stats.revenu_mois)}
                        </h3>
                        <small className={stats.evolution_mois > 0 ? 'text-success' : 'text-danger'}>
                          {stats.evolution_mois > 0 ? '+' : ''}{stats.evolution_mois}%
                        </small>
                      </div>
                      <TrendingUp size={40} className="text-primary opacity-50" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-3">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Transactions</small>
                        <h3 className="fw-bold mb-0 text-info">
                          {stats.total_transactions}
                        </h3>
                        <small className="text-muted">Total</small>
                      </div>
                      <Users size={40} className="text-info opacity-50" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-3">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Commission (10%)</small>
                        <h3 className="fw-bold mb-0 text-warning">
                          {formatMontant(stats.total_revenus * 0.1)}
                        </h3>
                        <small className="text-muted">Notre part</small>
                      </div>
                      <BookOpen size={40} className="text-warning opacity-50" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Graphique des revenus par mois */}
            <Row className="mb-4">
              <Col>
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <h5 className="fw-bold mb-3">Évolution des revenus</h5>
                    <Row>
                      <Col md={4}>
                        <div className="text-center p-3 bg-light rounded">
                          <small className="text-muted d-block mb-1">Aujourd'hui</small>
                          <h4 className="fw-bold mb-0 text-success">
                            {formatMontant(stats.revenu_aujourd_hui || 0)}
                          </h4>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="text-center p-3 bg-light rounded">
                          <small className="text-muted d-block mb-1">Cette semaine</small>
                          <h4 className="fw-bold mb-0 text-primary">
                            {formatMontant(stats.revenu_semaine || 0)}
                          </h4>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="text-center p-3 bg-light rounded">
                          <small className="text-muted d-block mb-1">Ce mois</small>
                          <h4 className="fw-bold mb-0 text-info">
                            {formatMontant(stats.revenu_mois)}
                          </h4>
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
              <Col md={4}>
                <Form.Group>
                  <div className="input-group">
                    <span className="input-group-text">
                      <Search size={20} />
                    </span>
                    <Form.Control
                      type="text"
                      placeholder="Rechercher par nom, formation..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <div className="input-group">
                    <span className="input-group-text">
                      <Filter size={20} />
                    </span>
                    <Form.Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="completed">Complétés</option>
                      <option value="pending">En attente</option>
                      <option value="failed">Échoués</option>
                      <option value="refunded">Remboursés</option>
                    </Form.Select>
                  </div>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <div className="input-group">
                    <span className="input-group-text">
                      <Calendar size={20} />
                    </span>
                    <Form.Select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    >
                      <option value="all">Toutes les périodes</option>
                      <option value="today">Aujourd'hui</option>
                      <option value="week">Cette semaine</option>
                      <option value="month">Ce mois</option>
                      <option value="year">Cette année</option>
                    </Form.Select>
                  </div>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button variant="primary" className="w-100" onClick={fetchData}>
                  Actualiser
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Liste des paiements */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Chargement...</p>
              </div>
            ) : filteredPaiements.length === 0 ? (
              <div className="text-center py-5">
                <DollarSign size={64} className="text-muted mb-3 opacity-50" />
                <p className="text-muted">Aucun paiement trouvé</p>
              </div>
            ) : (
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Date</th>
                    <th>Apprenant</th>
                    <th>Formation</th>
                    <th>Formateur</th>
                    <th className="text-end">Montant</th>
                    <th className="text-end">Commission (10%)</th>
                    <th>Statut</th>
                    <th>Méthode</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPaiements.map((paiement) => (
                    <tr key={paiement.id}>
                      <td className="text-muted small">
                        {formatDistanceToNow(new Date(paiement.created_at), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </td>
                      <td>
                        <strong>{paiement.apprenant?.name || 'N/A'}</strong>
                        <br />
                        <small className="text-muted">{paiement.apprenant?.email}</small>
                      </td>
                      <td>{paiement.formation?.titre || 'N/A'}</td>
                      <td>{paiement.formateur?.name || 'N/A'}</td>
                      <td className="text-end">
                        <strong className="text-success">
                          {formatMontant(paiement.montant)}
                        </strong>
                      </td>
                      <td className="text-end">
                        <strong className="text-primary">
                          {formatMontant(paiement.montant * 0.1)}
                        </strong>
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(paiement.statut).variant}>
                          {getStatusBadge(paiement.statut).label}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="info">{paiement.methode_paiement || 'Mobile Money'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Info commission */}
        <Alert variant="info" className="mt-4">
          <strong>💡 Politique de commission:</strong> La plateforme prélève 10% sur chaque vente. Les formateurs reçoivent 90% du montant.
        </Alert>
      </Container>
  );
};

export default AdminRevenusPage;