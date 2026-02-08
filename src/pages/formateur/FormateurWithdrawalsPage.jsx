import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Table, Badge, Modal, InputGroup } from 'react-bootstrap';
import { DollarSign, TrendingUp, Clock, AlertCircle, CheckCircle, Send } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const FormateurWithdrawalsPage = () => {
  const [stats, setStats] = useState(null);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [allWithdrawals, setAllWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requesting, setRequesting] = useState(false);
  
  const [requestForm, setRequestForm] = useState({
    montant_demande: '',
    phone_number: '',
    phone_country: 'bj',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balanceRes, historyRes] = await Promise.all([
        api.get('/formateur/withdrawals/balance'),
        api.get('/formateur/withdrawals/history')
      ]);

      if (balanceRes.data.success) {
        setStats(balanceRes.data.stats);
        setRecentWithdrawals(balanceRes.data.recent_withdrawals);
      }

      if (historyRes.data.success) {
        setAllWithdrawals(historyRes.data.withdrawals.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestWithdrawal = async (e) => {
    e.preventDefault();
    
    const montant = parseFloat(requestForm.montant_demande);

    if (montant < 1000) {
      toast.error('Le montant minimum de retrait est de 1,000 FCFA');
      return;
    }

    if (montant > stats.solde_disponible) {
      toast.error(`Solde insuffisant. Vous avez ${stats.solde_disponible.toLocaleString()} FCFA disponible.`);
      return;
    }

    try {
      setRequesting(true);
      const response = await api.post('/formateur/withdrawals/request', requestForm);

      if (response.data.success) {
        toast.success('Demande de retrait envoyée avec succès !');
        setShowRequestModal(false);
        setRequestForm({ montant_demande: '', phone_number: '', phone_country: 'bj' });
        fetchData();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erreur lors de la demande';
      toast.error(errorMsg);
    } finally {
      setRequesting(false);
    }
  };

  const handleCancelWithdrawal = async (withdrawalId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) return;

    try {
      const response = await api.post(`/formateur/withdrawals/${withdrawalId}/cancel`);
      
      if (response.data.success) {
        toast.success('Demande annulée');
        fetchData();
      }
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const getStatusBadge = (statut) => {
    const badges = {
      pending: { bg: 'warning', label: 'En attente', icon: Clock },
      approved: { bg: 'info', label: 'Approuvé', icon: CheckCircle },
      completed: { bg: 'success', label: 'Complété', icon: CheckCircle },
      rejected: { bg: 'danger', label: 'Rejeté', icon: AlertCircle },
      failed: { bg: 'danger', label: 'Échoué', icon: AlertCircle },
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
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Container fluid className="py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">💰 Mes Retraits</h3>
            <p className="text-muted mb-0">Gérez vos retraits et revenus</p>
          </div>
          <Button 
            variant="success" 
            size="lg"
            onClick={() => setShowRequestModal(true)}
            disabled={!stats || stats.solde_disponible < 1000}
          >
            <Send size={20} className="me-2" />
            Demander un retrait
          </Button>
        </div>

        {/* Alert si solde insuffisant */}
        {stats && stats.solde_disponible < 1000 && (
          <Alert variant="info" className="mb-4">
            <AlertCircle size={20} className="me-2" />
            <strong>Solde insuffisant :</strong> Le montant minimum de retrait est de 1,000 FCFA. 
            Continuez à vendre des formations pour augmenter votre solde !
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <Row className="mb-4">
            <Col md={3} className="mb-3">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                      <DollarSign className="text-success" size={32} />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1 small">Revenus Totaux</h6>
                      <h3 className="mb-0">{formatMontant(stats.total_revenus)}</h3>
                      <small className="text-success">FCFA (90%)</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3} className="mb-3">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                      <TrendingUp className="text-warning" size={32} />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1 small">Déjà Retirés</h6>
                      <h3 className="mb-0">{formatMontant(stats.total_retraits)}</h3>
                      <small className="text-warning">FCFA</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3} className="mb-3">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                      <DollarSign className="text-primary" size={32} />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1 small">Solde Disponible</h6>
                      <h3 className="mb-0 text-primary">{formatMontant(stats.solde_disponible)}</h3>
                      <small className="text-primary">FCFA</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3} className="mb-3">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                      <Clock className="text-info" size={32} />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1 small">En Attente</h6>
                      <h3 className="mb-0 text-info">{formatMontant(stats.retraits_en_attente || 0)}</h3>
                      <small className="text-info">FCFA</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Info Box */}
        <Card className="border-0 shadow-sm mb-4 bg-light">
          <Card.Body>
            <h6 className="fw-bold mb-2">ℹ️ Comment fonctionnent les retraits ?</h6>
            <Row>
              <Col md={6}>
                <ul className="mb-0 small">
                  <li><strong>Montant minimum :</strong> 1,000 FCFA par retrait</li>
                  <li><strong>Délai de traitement :</strong> 24-48h après approbation</li>
                  <li><strong>Méthode de paiement :</strong> Mobile Money (MTN, Moov, etc.)</li>
                </ul>
              </Col>
              <Col md={6}>
                <ul className="mb-0 small">
                  <li><strong>Frais :</strong> Aucun frais de retrait</li>
                  <li><strong>Statut :</strong> Suivi en temps réel</li>
                  <li><strong>Sécurité :</strong> Vérification par l'administrateur</li>
                </ul>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Historique des retraits */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-bottom">
            <h5 className="mb-0">Historique des retraits</h5>
          </Card.Header>
          <Card.Body>
            {allWithdrawals.length === 0 ? (
              <div className="text-center py-5">
                <Clock size={64} className="text-muted mb-3 opacity-50" />
                <h5 className="text-muted">Aucun retrait pour le moment</h5>
                <p className="text-muted">
                  Vos demandes de retrait apparaîtront ici
                </p>
              </div>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Numéro</th>
                    <th>Statut</th>
                    <th>Traité par</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allWithdrawals.map((withdrawal) => {
                    const badge = getStatusBadge(withdrawal.statut);
                    const Icon = badge.icon;

                    return (
                      <tr key={withdrawal.id}>
                        <td>
                          <small>
                            {formatDistanceToNow(new Date(withdrawal.created_at), {
                              addSuffix: true,
                              locale: fr
                            })}
                          </small>
                        </td>
                        <td>
                          <strong className="text-success">
                            {formatMontant(withdrawal.montant_demande)} FCFA
                          </strong>
                        </td>
                        <td>
                          <small className="text-muted">{withdrawal.phone_number}</small>
                        </td>
                        <td>
                          <Badge bg={badge.bg} className="d-flex align-items-center gap-1" style={{width: 'fit-content'}}>
                            <Icon size={14} />
                            {badge.label}
                          </Badge>
                        </td>
                        <td>
                          <small className="text-muted">
                            {withdrawal.processed_by ? withdrawal.processed_by.name : '-'}
                          </small>
                        </td>
                        <td>
                          {withdrawal.statut === 'pending' && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleCancelWithdrawal(withdrawal.id)}
                            >
                              Annuler
                            </Button>
                          )}
                          {withdrawal.admin_notes && (
                            <small className="text-muted d-block mt-1">
                              Note: {withdrawal.admin_notes}
                            </small>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Modal Demande de retrait */}
      <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Send size={24} className="me-2" />
            Demander un retrait
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRequestWithdrawal}>
          <Modal.Body>
            <Alert variant="info" className="small mb-3">
              <strong>Solde disponible :</strong> {stats && formatMontant(stats.solde_disponible)} FCFA
            </Alert>

            <Form.Group className="mb-3">
              <Form.Label>Montant à retirer (FCFA) *</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <DollarSign size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="Ex: 5000"
                  value={requestForm.montant_demande}
                  onChange={(e) => setRequestForm({ ...requestForm, montant_demande: e.target.value })}
                  min="1000"
                  step="100"
                  required
                />
                <InputGroup.Text>FCFA</InputGroup.Text>
              </InputGroup>
              <Form.Text className="text-muted">
                Montant minimum : 1,000 FCFA
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Pays *</Form.Label>
              <Form.Select
                value={requestForm.phone_country}
                onChange={(e) => setRequestForm({ ...requestForm, phone_country: e.target.value })}
                required
              >
                <option value="bj">🇧🇯 Bénin (+229)</option>
                <option value="tg">🇹🇬 Togo (+228)</option>
                <option value="ci">🇨🇮 Côte d'Ivoire (+225)</option>
                <option value="sn">🇸🇳 Sénégal (+221)</option>
                <option value="ml">🇲🇱 Mali (+223)</option>
                <option value="bf">🇧🇫 Burkina Faso (+226)</option>
                <option value="ne">🇳🇪 Niger (+227)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Numéro Mobile Money *</Form.Label>
              <Form.Control
                type="tel"
                placeholder="XX XX XX XX"
                value={requestForm.phone_number}
                onChange={(e) => setRequestForm({ ...requestForm, phone_number: e.target.value })}
                required
              />
              <Form.Text className="text-muted">
                Le numéro sur lequel vous souhaitez recevoir l'argent
              </Form.Text>
            </Form.Group>

            <Alert variant="warning" className="small mb-0">
              <strong>Important :</strong> Vérifiez bien votre numéro. L'argent sera envoyé sur ce numéro après validation.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRequestModal(false)}>
              Annuler
            </Button>
            <Button variant="success" type="submit" disabled={requesting}>
              {requesting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send size={18} className="me-2" />
                  Envoyer la demande
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default FormateurWithdrawalsPage;