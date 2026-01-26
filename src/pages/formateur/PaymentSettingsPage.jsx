import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { DollarSign, Save, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PaymentSettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    payment_phone: '',
    payment_phone_country: 'bj'
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.payment_phone) {
      setFormData({
        payment_phone: user.payment_phone,
        payment_phone_country: user.payment_phone_country || 'bj'
      });
      setSaved(true);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/formateur/payment-settings', formData);
      updateUser(response.data.user);
      setSaved(true);
      toast.success('Informations de paiement enregistrées !');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <div className="d-flex align-items-center">
                  <DollarSign size={24} className="me-2 text-success" />
                  <div>
                    <h4 className="mb-0">Paramètres de paiement</h4>
                    <small className="text-muted">
                      Configurez votre numéro de téléphone pour recevoir vos revenus
                    </small>
                  </div>
                </div>
              </Card.Header>

              <Card.Body className="p-4">
                {saved && (
                  <Alert variant="success" className="mb-4">
                    <CheckCircle size={20} className="me-2" />
                    Vos informations de paiement sont configurées !
                  </Alert>
                )}

                <Alert variant="info" className="mb-4">
                  <Shield size={20} className="me-2" />
                  <strong>Paiements sécurisés via FedaPay</strong>
                  <p className="mb-0 mt-2 small">
                    Vos revenus seront versés directement sur votre compte Mobile Money 
                    après chaque vente de formation. Commission plateforme : 10%
                  </p>
                </Alert>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Pays *</Form.Label>
                    <Form.Select
                      value={formData.payment_phone_country}
                      onChange={(e) => setFormData({ ...formData, payment_phone_country: e.target.value })}
                      required
                    >
                      <option value="bj">🇧🇯 Bénin (+229)</option>
                      <option value="tg">🇹🇬 Togo (+228)</option>
                      <option value="ci">🇨🇮 Côte d'Ivoire (+225)</option>
                      <option value="sn">🇸🇳 Sénégal (+221)</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Numéro de téléphone Mobile Money *</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="XX XX XX XX"
                      value={formData.payment_phone}
                      onChange={(e) => setFormData({ ...formData, payment_phone: e.target.value })}
                      required
                    />
                    <Form.Text className="text-muted">
                      Ce numéro sera utilisé pour recevoir vos paiements (MTN Money, Moov Money, etc.)
                    </Form.Text>
                  </Form.Group>

                  <div className="bg-light p-3 rounded mb-4">
                    <h6 className="fw-bold mb-2">📊 Comment ça marche ?</h6>
                    <ul className="mb-0 small">
                      <li>Un apprenant achète votre formation</li>
                      <li>Le paiement est traité par FedaPay (sécurisé)</li>
                      <li>La plateforme retient 10% de commission</li>
                      <li>Vous recevez 90% du montant sur votre Mobile Money</li>
                    </ul>
                  </div>

                  <Alert variant="warning" className="small">
                    <strong>⚠️ Important :</strong> Assurez-vous que ce numéro est actif et 
                    appartient bien à votre compte Mobile Money pour recevoir les paiements.
                  </Alert>

                  <Button variant="success" type="submit" size="lg" className="w-100" disabled={loading}>
                    <Save size={20} className="me-2" />
                    {loading ? 'Enregistrement...' : 'Enregistrer mes informations'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            {/* Exemple de calcul */}
            <Card className="border-0 shadow-sm mt-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">💰 Exemple de calcul</h5>
              </Card.Header>
              <Card.Body>
                <Table borderless className="mb-0">
                  <tbody>
                    <tr>
                      <td>Prix de votre formation :</td>
                      <td className="text-end fw-bold">10,000 FCFA</td>
                    </tr>
                    <tr className="text-muted">
                      <td>Commission plateforme (10%) :</td>
                      <td className="text-end">- 1,000 FCFA</td>
                    </tr>
                    <tr className="border-top">
                      <td><strong>Vous recevez :</strong></td>
                      <td className="text-end text-success"><strong>9,000 FCFA</strong></td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PaymentSettingsPage;