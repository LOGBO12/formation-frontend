import { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Row, Col, Alert } from 'react-bootstrap';
import { DollarSign, Download, Eye, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const MesPaiementsPage = () => {
  const navigate = useNavigate();
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchPaiements();
  }, []);

  const fetchPaiements = async (page = 1) => {
    try {
      const response = await api.get(`/paiements/mes-paiements?page=${page}`);
      setPaiements(response.data.paiements.data || []);
      setPagination(response.data.paiements);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      complete: { bg: 'success', label: 'Payé', icon: CheckCircle },
      en_attente: { bg: 'warning', label: 'En attente', icon: Clock },
      echoue: { bg: 'danger', label: 'Échoué', icon: XCircle },
      rembourse: { bg: 'info', label: 'Remboursé', icon: DollarSign },
    };
    return badges[statut] || { bg: 'secondary', label: statut, icon: CreditCard };
  };

  const calculateStats = () => {
    return {
      total: paiements.reduce((sum, p) => sum + (p.statut === 'complete' ? parseFloat(p.montant) : 0), 0),
      count: paiements.filter(p => p.statut === 'complete').length,
      pending: paiements.filter(p => p.statut === 'en_attente').length,
    };
  };

  const stats = calculateStats();

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
          <h3 className="fw-bold mb-1">Mes Paiements</h3>
          <p className="text-muted mb-0">Historique de vos transactions</p>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={4} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                    <DollarSign className="text-success" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Total Dépensé</h6>
                    <h3 className="mb-0">{stats.total.toLocaleString()}</h3>
                    <small className="text-success">FCFA</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <CheckCircle className="text-primary" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Paiements Réussis</h6>
                    <h3 className="mb-0">{stats.count}</h3>
                    <small className="text-primary">transactions</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                    <Clock className="text-warning" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">En Attente</h6>
                    <h3 className="mb-0">{stats.pending}</h3>
                    <small className="text-warning">paiements</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Info Box */}
        <Alert variant="info" className="mb-4">
          <CreditCard size={20} className="me-2" />
          <strong>Paiements sécurisés via FedaPay</strong>
          <p className="mb-0 mt-2 small">
            Tous vos paiements sont traités de manière sécurisée par FedaPay. 
            Vous pouvez payer par Mobile Money (MTN, Moov, Orange) ou par carte bancaire.
          </p>
        </Alert>

        {/* Historique */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Historique des transactions</h5>
            <Button variant="outline-primary" size="sm">
              <Download size={16} className="me-2" />
              Exporter
            </Button>
          </Card.Header>
          <Card.Body>
            {paiements.length === 0 ? (
              <div className="text-center py-5">
                <CreditCard size={64} className="text-muted mb-3 opacity-50" />
                <h5 className="text-muted">Aucun paiement</h5>
                <p className="text-muted mb-4">
                  Vous n'avez pas encore effectué de paiement
                </p>
                <Button variant="primary" onClick={() => navigate('/apprenant/catalogue')}>
                  Explorer le catalogue
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Formation</th>
                      <th>Montant</th>
                      <th>Méthode</th>
                      <th>Statut</th>
                      <th>Transaction ID</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paiements.map((paiement) => {
                      const badge = getStatutBadge(paiement.statut);
                      const Icon = badge.icon;

                      return (
                        <tr key={paiement.id}>
                          <td>
                            <small>
                              {new Date(paiement.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </small>
                          </td>
                          <td>
                            <strong>{paiement.formation?.titre}</strong>
                          </td>
                          <td>
                            <strong>{parseFloat(paiement.montant).toLocaleString()} FCFA</strong>
                          </td>
                          <td>
                            <Badge bg="secondary">
                              {paiement.methode_paiement || 'FedaPay'}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={badge.bg}>
                              <Icon size={14} className="me-1" />
                              {badge.label}
                            </Badge>
                          </td>
                          <td>
                            <small className="text-muted font-monospace">
                              {paiement.fedapay_transaction_id?.substring(0, 12) || 'N/A'}...
                            </small>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                // TODO: Voir détails du paiement
                              }}
                            >
                              <Eye size={16} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <nav>
                  <ul className="pagination">
                    <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => fetchPaiements(pagination.current_page - 1)}
                      >
                        Précédent
                      </button>
                    </li>
                    
                    {[...Array(pagination.last_page)].map((_, index) => (
                      <li 
                        key={index} 
                        className={`page-item ${pagination.current_page === index + 1 ? 'active' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => fetchPaiements(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => fetchPaiements(pagination.current_page + 1)}
                      >
                        Suivant
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default MesPaiementsPage;