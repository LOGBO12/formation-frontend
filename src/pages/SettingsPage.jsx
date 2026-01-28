import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Nav } from 'react-bootstrap';
import { Lock, Bell, Shield, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('security');
  const [loading, setLoading] = useState(false);

  // Sécurité - Changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notifications
  const [notificationSettings, setNotificationSettings] = useState({
    email_formations: true,
    email_communaute: true,
    email_marketing: false,
  });

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      await api.post('/profile/change-password', passwordData);
      toast.success('Mot de passe mis à jour avec succès !');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/profile/update-notifications', notificationSettings);
      toast.success('Préférences enregistrées !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible !'
    )) {
      return;
    }

    const confirmation = window.prompt(
      'Tapez "SUPPRIMER" pour confirmer la suppression de votre compte :'
    );

    if (confirmation !== 'SUPPRIMER') {
      toast.error('Suppression annulée');
      return;
    }

    setLoading(true);

    try {
      await api.delete('/profile/delete-account');
      toast.success('Compte supprimé avec succès');
      logout();
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-vh-100 bg-light">
      <Container className="py-5">
        <Row>
          {/* Sidebar */}
          <Col lg={3} className="mb-4 mb-lg-0">
            <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
              <Card.Body className="p-0">
                <Nav className="flex-column">
                  <Nav.Link
                    active={activeTab === 'security'}
                    onClick={() => setActiveTab('security')}
                    className="d-flex align-items-center p-3 border-bottom"
                  >
                    <Lock size={18} className="me-2" />
                    Sécurité
                  </Nav.Link>
                  <Nav.Link
                    active={activeTab === 'notifications'}
                    onClick={() => setActiveTab('notifications')}
                    className="d-flex align-items-center p-3 border-bottom"
                  >
                    <Bell size={18} className="me-2" />
                    Notifications
                  </Nav.Link>
                  <Nav.Link
                    active={activeTab === 'privacy'}
                    onClick={() => setActiveTab('privacy')}
                    className="d-flex align-items-center p-3 border-bottom"
                  >
                    <Shield size={18} className="me-2" />
                    Confidentialité
                  </Nav.Link>
                  <Nav.Link
                    active={activeTab === 'danger'}
                    onClick={() => setActiveTab('danger')}
                    className="d-flex align-items-center p-3 text-danger"
                  >
                    <Trash2 size={18} className="me-2" />
                    Zone dangereuse
                  </Nav.Link>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          {/* Content */}
          <Col lg={9}>
            {/* Sécurité */}
            {activeTab === 'security' && (
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                  <h5 className="mb-0">
                    <Lock size={20} className="me-2" />
                    Sécurité et Mot de passe
                  </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <Alert variant="info" className="mb-4">
                    <strong>Conseils de sécurité :</strong>
                    <ul className="mb-0 mt-2">
                      <li>Utilisez un mot de passe unique de 8 caractères minimum</li>
                      <li>Mélangez majuscules, minuscules, chiffres et symboles</li>
                      <li>Ne partagez jamais votre mot de passe</li>
                    </ul>
                  </Alert>

                  <Form onSubmit={handlePasswordSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mot de passe actuel *</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPasswords.current ? 'text' : 'password'}
                          name="current_password"
                          value={passwordData.current_password}
                          onChange={handlePasswordChange}
                          required
                        />
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-50 translate-middle-y"
                          onClick={() => togglePasswordVisibility('current')}
                          style={{ zIndex: 10 }}
                        >
                          {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Nouveau mot de passe *</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPasswords.new ? 'text' : 'password'}
                          name="new_password"
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          minLength={8}
                          required
                        />
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-50 translate-middle-y"
                          onClick={() => togglePasswordVisibility('new')}
                          style={{ zIndex: 10 }}
                        >
                          {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                      </div>
                      <Form.Text className="text-muted">
                        Minimum 8 caractères
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Confirmer le nouveau mot de passe *</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPasswords.confirm ? 'text' : 'password'}
                          name="new_password_confirmation"
                          value={passwordData.new_password_confirmation}
                          onChange={handlePasswordChange}
                          minLength={8}
                          required
                        />
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-50 translate-middle-y"
                          onClick={() => togglePasswordVisibility('confirm')}
                          style={{ zIndex: 10 }}
                        >
                          {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                      </div>
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="me-2" />
                          Changer le mot de passe
                        </>
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                  <h5 className="mb-0">
                    <Bell size={20} className="me-2" />
                    Préférences de notifications
                  </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <Form onSubmit={handleNotificationSubmit}>
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3">Notifications par email</h6>
                      
                      <Form.Check
                        type="switch"
                        id="email_formations"
                        label="Nouvelles formations disponibles"
                        checked={notificationSettings.email_formations}
                        onChange={() => handleNotificationChange('email_formations')}
                        className="mb-3"
                      />

                      <Form.Check
                        type="switch"
                        id="email_communaute"
                        label="Messages de la communauté"
                        checked={notificationSettings.email_communaute}
                        onChange={() => handleNotificationChange('email_communaute')}
                        className="mb-3"
                      />

                      <Form.Check
                        type="switch"
                        id="email_marketing"
                        label="Newsletters et offres promotionnelles"
                        checked={notificationSettings.email_marketing}
                        onChange={() => handleNotificationChange('email_marketing')}
                        className="mb-3"
                      />
                    </div>

                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="me-2" />
                          Enregistrer les préférences
                        </>
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {/* Confidentialité */}
            {activeTab === 'privacy' && (
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                  <h5 className="mb-0">
                    <Shield size={20} className="me-2" />
                    Confidentialité et données
                  </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">Vos données</h6>
                    <p className="text-muted">
                      Nous respectons votre vie privée et protégeons vos données personnelles
                      conformément au RGPD.
                    </p>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">Télécharger mes données</h6>
                    <p className="text-muted mb-3">
                      Vous pouvez télécharger une copie de toutes vos données.
                    </p>
                    <Button variant="outline-primary">
                      Télécharger mes données
                    </Button>
                  </div>

                  <div>
                    <h6 className="fw-bold mb-3">Politique de confidentialité</h6>
                    <p className="text-muted mb-3">
                      Consultez notre politique de confidentialité pour en savoir plus sur
                      la gestion de vos données.
                    </p>
                    <Button variant="outline-secondary">
                      Voir la politique
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Zone dangereuse */}
            {activeTab === 'danger' && (
              <Card className="border-danger shadow-sm">
                <Card.Header className="bg-danger bg-opacity-10 border-danger">
                  <h5 className="mb-0 text-danger">
                    <Trash2 size={20} className="me-2" />
                    Zone dangereuse
                  </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <Alert variant="danger">
                    <Alert.Heading>⚠️ Attention !</Alert.Heading>
                    <p className="mb-0">
                      Les actions ci-dessous sont <strong>irréversibles</strong>. 
                      Assurez-vous de bien comprendre les conséquences avant de continuer.
                    </p>
                  </Alert>

                  <div className="border border-danger rounded p-4">
                    <h6 className="fw-bold mb-2">Supprimer mon compte</h6>
                    <p className="text-muted mb-3">
                      Une fois votre compte supprimé, toutes vos données seront définitivement
                      effacées. Cette action ne peut pas être annulée.
                    </p>
                    <Button
                      variant="danger"
                      onClick={handleDeleteAccount}
                      disabled={loading}
                    >
                      <Trash2 size={18} className="me-2" />
                      Supprimer mon compte
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SettingsPage;