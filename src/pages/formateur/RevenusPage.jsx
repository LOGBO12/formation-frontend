import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, Button, Modal, Form } from 'react-bootstrap';
import { DollarSign, TrendingUp, Clock, Download, Eye, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const RevenusPage = () => {
  const navigate = useNavigate();
  const [paiements, setPaiements] = useState([]);
  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    payment_phone: '',
    payment_phone_country: 'bj'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [revenusRes, settingsRes] = await Promise.all([
        api.get('/formateur/paiements-recus'),
        api.get('/formateur/payment-settings')
      ]);

      setPaiements(revenusRes.data.paiements.data || []);
      setStatistiques(revenusRes.data.statistiques);
      
      if (settingsRes.data.payment_phone) {
        setPaymentSettings({
          payment_phone: settingsRes.data.payment_phone,
          payment_phone_country: settingsRes.data.payment_phone_country
        });
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.post('/formateur/payment-settings/update', paymentSettings);
      toast.success('Paramètres mis à jour !');
      setShowSettingsModal(false);
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
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
            <h3 className="fw-bold mb-1">Mes Revenus</h3>
            <p className="text-muted mb-0">Gérez vos paiements et revenus</p>
          </div>
          <Button variant="outline-primary" onClick={() => setShowSettingsModal(true)}>
            <Settings size={18} className="me-2" />
            Paramètres de paiement
          </Button>
        </div>

        {/* Alert si pas de numéro configuré */}
        {!paymentSettings.payment_phone && (
          <Alert variant="warning" className="mb-4">
            <strong>⚠️ Action requise :</strong> Configurez votre numéro de téléphone pour recevoir vos paiements.
            <Button 
              variant="warning" 
              size="sm" 
              className="ms-3"
              onClick={() => setShowSettingsModal(true)}
            >
              Configurer maintenant
            </Button>
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={4} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                    <DollarSign className="text-success" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Revenus Bruts</h6>
                    <h3 className="mb-0">{(statistiques?.total_brut || 0).toLocaleString()}</h3>
                    <small className="text-success">FCFA</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                    <TrendingUp className="text-warning" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Commission Plateforme (10%)</h6>
                    <h3 className="mb-0">{(statistiques?.total_commission || 0).toLocaleString()}</h3>
                    <small className="text-warning">FCFA</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <DollarSign className="text-primary" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Revenus Nets</h6>
                    <h3 className="mb-0 text-primary">{(statistiques?.total_net || 0).toLocaleString()}</h3>
                    <small className="text-primary">FCFA (à recevoir)</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Info Box */}
        <Card className="border-0 shadow-sm mb-4 bg-light">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <h6 className="fw-bold mb-2">💰 Comment fonctionnent les paiements ?</h6>
                <ul className="mb-0 small">
                  <li>Les apprenants paient directement via FedaPay (Mobile Money, Carte bancaire)</li>
                  <li>La plateforme retient 10% de commission automatiquement</li>
                  <li>Vous recevez 90% du montant sur votre Mobile Money sous 24-48h</li>
                  <li>Les paiements sont sécurisés et traçables</li>
                </ul>
              </Col>
              <Col md={4} className="text-end">
                {paymentSettings.payment_phone && (
                  <div>
                    <small className="text-muted d-block">Numéro de réception :</small>
                    <strong className="text-success">{paymentSettings.payment_phone}</strong>
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Historique des paiements */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Historique des paiements</h5>
            <Button variant="outline-primary" size="sm">
              <Download size={16} className="me-2" />
              Exporter
            </Button>
          </Card.Header>
          <Card.Body>
            {paiements.length === 0 ? (
              <div className="text-center py-5">
                <Clock size={64} className="text-muted mb-3 opacity-50" />
                <h5 className="text-muted">Aucun paiement pour le moment</h5>
                <p className="text-muted">
                  Les paiements de vos apprenants apparaîtront ici
                </p>
              </div>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Formation</th>
                    <th>Apprenant</th>
                    <th>Montant Brut</th>
                    <th>Commission</th>
                    <th>Montant Net</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paiements.map((paiement) => {
                    const commission = (paiement.formation?.commission_admin || 10) / 100 * paiement.montant;
                    const net = paiement.montant - commission;

                    return (
                      <tr key={paiement.id}>
                        <td>
                          <small>
                            {new Date(paiement.date_paiement || paiement.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </small>
                        </td>
                        <td>
                          <strong>{paiement.formation?.titre}</strong>
                        </td>
                        <td>
                          <small>{paiement.user?.name}</small>
                        </td>
                        <td>
                          <strong>{paiement.montant.toLocaleString()} FCFA</strong>
                        </td>
                        <td className="text-muted">
                          -{commission.toLocaleString()} FCFA
                        </td>
                        <td>
                          <strong className="text-success">
                            {net.toLocaleString()} FCFA
                          </strong>
                        </td>
                        <td>
                          <Badge bg={paiement.statut === 'complete' ? 'success' : 'warning'}>
                            {paiement.statut === 'complete' ? 'Payé' : 'En attente'}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {/* Voir détails */}}
                          >
                            <Eye size={16} />
                          </Button>
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

      {/* Modal Paramètres de paiement */}
      <Modal show={showSettingsModal} onHide={() => setShowSettingsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Settings size={24} className="me-2" />
            Paramètres de paiement
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveSettings}>
          <Modal.Body>
            <Alert variant="info" className="small mb-3">
              Configurez votre numéro Mobile Money pour recevoir vos revenus automatiquement.
            </Alert>

            <Form.Group className="mb-3">
              <Form.Label>Pays *</Form.Label>
              <Form.Select
                value={paymentSettings.payment_phone_country}
                onChange={(e) => setPaymentSettings({ 
                  ...paymentSettings, 
                  payment_phone_country: e.target.value 
                })}
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
                value={paymentSettings.payment_phone}
                onChange={(e) => setPaymentSettings({ 
                  ...paymentSettings, 
                  payment_phone: e.target.value 
                })}
                required
              />
              <Form.Text className="text-muted">
                MTN Money, Moov Money, Orange Money, etc.
              </Form.Text>
            </Form.Group>

            <Alert variant="warning" className="small mb-0">
              <strong>Important :</strong> Assurez-vous que ce numéro est actif pour recevoir les paiements.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSettingsModal(false)}>
              Annuler
            </Button>
            <Button variant="success" type="submit">
              Enregistrer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default RevenusPage;