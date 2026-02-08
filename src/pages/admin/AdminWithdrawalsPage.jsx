import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal, Alert, InputGroup } from 'react-bootstrap';
import { DollarSign, Clock, CheckCircle, XCircle, Eye, Trash2, Filter, Search } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminWithdrawalsPage = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  
  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Forms
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/withdrawals', {
        params: { status: statusFilter }
      });

      if (response.data.success) {
        setWithdrawals(response.data.withdrawals.data);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedWithdrawal) return;

    try {
      setProcessing(true);
      const response = await api.post(`/admin/withdrawals/${selectedWithdrawal.id}/approve`, {
        admin_notes: approveNotes
      });

      if (response.data.success) {
        toast.success('Demande approuvée avec succès');
        setShowApproveModal(false);
        setApproveNotes('');
        fetchWithdrawals();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'approbation');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectNotes.trim()) {
      toast.error('Veuillez indiquer la raison du rejet');
      return;
    }

    try {
      setProcessing(true);
      const response = await api.post(`/admin/withdrawals/${selectedWithdrawal.id}/reject`, {
        admin_notes: rejectNotes
      });

      if (response.data.success) {
        toast.success('Demande rejetée');
        setShowRejectModal(false);
        setRejectNotes('');
        fetchWithdrawals();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du rejet');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkAsCompleted = async (withdrawal) => {
    if (!window.confirm(`Confirmer que le paiement de ${withdrawal.montant_demande} FCFA a été effectué sur ${withdrawal.phone_number} ?`)) {
      return;
    }

    try {
      const response = await api.post(`/admin/withdrawals/${withdrawal.id}/complete`);

      if (response.data.success) {
        toast.success('✅ Retrait marqué comme complété');
        fetchWithdrawals();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) return;

    try {
      const response = await api.delete(`/admin/withdrawals/${id}`);
      
      if (response.data.success) {
        toast.success('Demande supprimée');
        fetchWithdrawals();
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const openApproveModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowApproveModal(true);
  };

  const openRejectModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowRejectModal(true);
  };

  const openDetailsModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (statut) => {
    const badges = {
      pending: { bg: 'warning', label: 'En attente' },
      approved: { bg: 'info', label: 'Approuvé' },
      completed: { bg: 'success', label: 'Complété' },
      rejected: { bg: 'danger', label: 'Rejeté' },
      failed: { bg: 'danger', label: 'Échoué' },
    };
    return badges[statut] || badges.pending;
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold mb-0">
            <DollarSign className="me-2" size={32} />
            Gestion des Retraits
          </h2>
          <p className="text-muted">Approuvez ou rejetez les demandes de retrait des formateurs</p>
        </Col>
      </Row>

      {/* Stats */}
      {stats && (
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">Total demandes</small>
                    <h3 className="fw-bold mb-0">{stats.total}</h3>
                  </div>
                  <DollarSign size={40} className="text-primary opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">En attente</small>
                    <h3 className="fw-bold mb-0 text-warning">{stats.pending}</h3>
                    <small className="text-muted">{formatMontant(stats.montant_pending)} FCFA</small>
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
                    <small className="text-muted">Approuvés</small>
                    <h3 className="fw-bold mb-0 text-info">{stats.approved}</h3>
                  </div>
                  <CheckCircle size={40} className="text-info opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">Complétés</small>
                    <h3 className="fw-bold mb-0 text-success">{stats.completed}</h3>
                    <small className="text-muted">{formatMontant(stats.montant_completed)} FCFA</small>
                  </div>
                  <CheckCircle size={40} className="text-success opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtres */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center">
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
                    <option value="pending">En attente</option>
                    <option value="approved">Approuvés</option>
                    <option value="completed">Complétés</option>
                    <option value="rejected">Rejetés</option>
                  </Form.Select>
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Button variant="primary" className="w-100" onClick={fetchWithdrawals}>
                Actualiser
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {withdrawals.length === 0 ? (
            <div className="text-center py-5">
              <DollarSign size={64} className="text-muted mb-3 opacity-50" />
              <p className="text-muted">Aucune demande de retrait</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Date</th>
                  <th>Formateur</th>
                  <th>Montant</th>
                  <th>Solde dispo.</th>
                  <th>Numéro</th>
                  <th>Statut</th>
                  <th>Traité par</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => {
                  const badge = getStatusBadge(withdrawal.statut);

                  return (
                    <tr key={withdrawal.id}>
                      <td className="text-muted small">
                        {formatDistanceToNow(new Date(withdrawal.created_at), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </td>
                      <td>
                        <strong>{withdrawal.formateur?.name}</strong>
                        <br />
                        <small className="text-muted">{withdrawal.formateur?.email}</small>
                      </td>
                      <td>
                        <strong className="text-success">
                          {formatMontant(withdrawal.montant_demande)} FCFA
                        </strong>
                      </td>
                      <td>
                        <small className="text-muted">
                          {formatMontant(withdrawal.solde_disponible)} FCFA
                        </small>
                      </td>
                      <td>
                        <small className="text-muted">
                          {withdrawal.phone_country.toUpperCase()} {withdrawal.phone_number}
                        </small>
                      </td>
                      <td>
                        <Badge bg={badge.bg}>{badge.label}</Badge>
                      </td>
                      <td>
                        <small className="text-muted">
                          {withdrawal.processed_by?.name || '-'}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openDetailsModal(withdrawal)}
                          >
                            <Eye size={16} />
                          </Button>
                          
                          {withdrawal.statut === 'pending' && (
                            <>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => openApproveModal(withdrawal)}
                              >
                                <CheckCircle size={16} />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => openRejectModal(withdrawal)}
                              >
                                <XCircle size={16} />
                              </Button>
                            </>
                          )}

                          {withdrawal.statut === 'approved' && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleMarkAsCompleted(withdrawal)}
                              title="Marquer comme payé"
                            >
                              ✓ Payé
                            </Button>
                          )}

                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(withdrawal.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal Approuver */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <CheckCircle size={24} className="me-2 text-success" />
            Approuver la demande
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedWithdrawal && (
            <>
              <Alert variant="info">
                <strong>Formateur :</strong> {selectedWithdrawal.formateur?.name}
                <br />
                <strong>Montant :</strong> {formatMontant(selectedWithdrawal.montant_demande)} FCFA
                <br />
                <strong>Numéro :</strong> {selectedWithdrawal.phone_country.toUpperCase()} {selectedWithdrawal.phone_number}
              </Alert>

              <Form.Group>
                <Form.Label>Notes (optionnel)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Ajouter une note pour le formateur..."
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                />
              </Form.Group>

              <Alert variant="warning" className="mt-3 mb-0 small">
                <strong>⚠️ Important :</strong> Assurez-vous d'effectuer le paiement Mobile Money sur le numéro indiqué, 
                puis marquez la demande comme "Complétée" une fois le paiement effectué.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleApprove} disabled={processing}>
            {processing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Traitement...
              </>
            ) : (
              <>
                <CheckCircle size={18} className="me-2" />
                Approuver
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Rejeter */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <XCircle size={24} className="me-2 text-danger" />
            Rejeter la demande
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedWithdrawal && (
            <>
              <Alert variant="warning">
                <strong>Formateur :</strong> {selectedWithdrawal.formateur?.name}
                <br />
                <strong>Montant :</strong> {formatMontant(selectedWithdrawal.montant_demande)} FCFA
              </Alert>

              <Form.Group>
                <Form.Label>Raison du rejet *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Expliquez pourquoi vous rejetez cette demande..."
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  required
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={processing || !rejectNotes.trim()}>
            {processing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Traitement...
              </>
            ) : (
              <>
                <XCircle size={18} className="me-2" />
                Rejeter
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Détails */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Détails de la demande</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedWithdrawal && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Formateur :</strong>
                  <p>{selectedWithdrawal.formateur?.name}</p>
                </Col>
                <Col md={6}>
                  <strong>Email :</strong>
                  <p>{selectedWithdrawal.formateur?.email}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Montant demandé :</strong>
                  <p className="text-success fw-bold">{formatMontant(selectedWithdrawal.montant_demande)} FCFA</p>
                </Col>
                <Col md={6}>
                  <strong>Solde disponible :</strong>
                  <p>{formatMontant(selectedWithdrawal.solde_disponible)} FCFA</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Numéro Mobile Money :</strong>
                  <p>{selectedWithdrawal.phone_country.toUpperCase()} {selectedWithdrawal.phone_number}</p>
                </Col>
                <Col md={6}>
                  <strong>Statut :</strong>
                  <p>
                    <Badge bg={getStatusBadge(selectedWithdrawal.statut).bg}>
                      {getStatusBadge(selectedWithdrawal.statut).label}
                    </Badge>
                  </p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Date de demande :</strong>
                  <p>{new Date(selectedWithdrawal.created_at).toLocaleString('fr-FR')}</p>
                </Col>
                {selectedWithdrawal.processed_at && (
                  <Col md={6}>
                    <strong>Date de traitement :</strong>
                    <p>{new Date(selectedWithdrawal.processed_at).toLocaleString('fr-FR')}</p>
                  </Col>
                )}
              </Row>

              {selectedWithdrawal.processed_by && (
                <Row className="mb-3">
                  <Col md={12}>
                    <strong>Traité par :</strong>
                    <p>{selectedWithdrawal.processed_by.name}</p>
                  </Col>
                </Row>
              )}

              {selectedWithdrawal.admin_notes && (
                <Alert variant="info">
                  <strong>Notes administrateur :</strong>
                  <p className="mb-0 mt-2">{selectedWithdrawal.admin_notes}</p>
                </Alert>
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
    </Container>
  );
};

export default AdminWithdrawalsPage;