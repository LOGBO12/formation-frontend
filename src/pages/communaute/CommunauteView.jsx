import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Badge, Alert, Modal } from 'react-bootstrap';
import { ArrowLeft, Send, Pin, Trash2, Users, Settings, Megaphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CommunauteView = () => {
  const { id } = useParams(); // ID de la communauté
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [communaute, setCommunaute] = useState(null);
  const [messages, setMessages] = useState([]);
  const [membres, setMembres] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAnnonce, setIsAnnonce] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMembresModal, setShowMembresModal] = useState(false);
  const [userIsMuted, setUserIsMuted] = useState(false);

  useEffect(() => {
    fetchData();
    // Auto-refresh toutes les 15 secondes
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchData = async () => {
    try {
      const [communauteRes, messagesRes, membresRes] = await Promise.all([
        api.get(`/communautes/${id}`),
        api.get(`/communautes/${id}/messages`),
        api.get(`/communautes/${id}/membres`),
      ]);

      setCommunaute(communauteRes.data.communaute);
      setMessages(messagesRes.data.messages);
      setMembres(membresRes.data.membres);

      // Vérifier si l'utilisateur est muté
      const currentMembre = membresRes.data.membres.find(m => m.id === user.id);
      setUserIsMuted(currentMembre?.pivot?.is_muted || false);
    } catch (error) {
      toast.error('Erreur lors du chargement');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/communautes/${id}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Erreur refresh messages:', error);
    }
  };

  const isFormateur = () => {
    return membres.find(m => m.id === user.id)?.pivot?.role === 'admin';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      toast.error('Le message ne peut pas être vide');
      return;
    }

    if (userIsMuted) {
      toast.error('Vous ne pouvez pas envoyer de messages');
      return;
    }

    setSending(true);

    try {
      const endpoint = isAnnonce 
        ? `/communautes/${id}/annonces` 
        : `/communautes/${id}/messages`;
      
      await api.post(endpoint, { message: newMessage });
      
      toast.success(isAnnonce ? 'Annonce publiée' : 'Message envoyé');
      setNewMessage('');
      setIsAnnonce(false);
      fetchMessages();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const handlePinMessage = async (messageId, isPinned) => {
    try {
      const endpoint = isPinned 
        ? `/messages/${messageId}/desepingler` 
        : `/messages/${messageId}/epingler`;
      
      await api.post(endpoint);
      toast.success(isPinned ? 'Message désépinglé' : 'Message épinglé');
      fetchMessages();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Supprimer ce message ?')) return;

    try {
      await api.delete(`/messages/${messageId}`);
      toast.success('Message supprimé');
      fetchMessages();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getMessagesByType = () => {
    const pinned = messages.filter(m => m.is_pinned);
    const announcements = messages.filter(m => m.is_announcement && !m.is_pinned);
    const regular = messages.filter(m => !m.is_pinned && !m.is_announcement);
    
    return { pinned, announcements, regular };
  };

  const formatDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMs = now - messageDate;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return messageDate.toLocaleDateString('fr-FR');
  };

  const MessageCard = ({ message, showPin = true }) => {
    const isAuthor = message.user_id === user.id;
    const isAdmin = isFormateur();
    const canDelete = isAuthor || isAdmin;
    const canPin = isAdmin && showPin;

    return (
      <Card className="mb-3 border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div className="d-flex align-items-center">
              <div 
                className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-2"
                style={{ width: 40, height: 40 }}
              >
                {message.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong>{message.user?.name}</strong>
                {membres.find(m => m.id === message.user_id)?.pivot?.role === 'admin' && (
                  <Badge bg="success" className="ms-2">Formateur</Badge>
                )}
                {message.is_announcement && (
                  <Badge bg="danger" className="ms-2">
                    <Megaphone size={12} className="me-1" />
                    Annonce
                  </Badge>
                )}
                {message.is_pinned && (
                  <Badge bg="warning" className="ms-2">
                    <Pin size={12} className="me-1" />
                    Épinglé
                  </Badge>
                )}
                <div className="text-muted small">{formatDate(message.created_at)}</div>
              </div>
            </div>

            <div className="d-flex gap-2">
              {canPin && (
                <Button
                  variant={message.is_pinned ? "warning" : "outline-warning"}
                  size="sm"
                  onClick={() => handlePinMessage(message.id, message.is_pinned)}
                  title={message.is_pinned ? "Désépingler" : "Épingler"}
                >
                  <Pin size={16} />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDeleteMessage(message.id)}
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </div>

          <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
            {message.message}
          </p>
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  const { pinned, announcements, regular } = getMessagesByType();

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-primary shadow-sm">
        <Container fluid>
          <Button variant="link" className="text-white" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} className="me-2" />
            Retour
          </Button>
          <span className="navbar-brand mb-0 h1">
            💬 {communaute?.nom}
          </span>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-light" 
              size="sm"
              onClick={() => setShowMembresModal(true)}
            >
              <Users size={18} className="me-1" />
              {membres.length}
            </Button>
            {isFormateur() && (
              <Button 
                variant="outline-light" 
                size="sm"
                onClick={() => navigate(`/formateur/communaute/${id}/moderation`)}
              >
                <Settings size={18} />
              </Button>
            )}
          </div>
        </Container>
      </nav>

      <Container className="py-4">
        <Row>
          <Col lg={8} className="mx-auto">
            {/* Info Communauté */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body>
                <h5>{communaute?.formation?.titre}</h5>
                <p className="text-muted mb-0">{communaute?.description}</p>
              </Card.Body>
            </Card>

            {/* Message si muté */}
            {userIsMuted && (
              <Alert variant="warning" className="mb-4">
                <strong>Vous êtes en mode silencieux.</strong> Vous ne pouvez pas envoyer de messages.
              </Alert>
            )}

            {/* Messages épinglés */}
            {pinned.length > 0 && (
              <div className="mb-4">
                <h6 className="text-muted mb-3">
                  <Pin size={18} className="me-2" />
                  Messages épinglés
                </h6>
                {pinned.map(message => (
                  <MessageCard key={message.id} message={message} />
                ))}
              </div>
            )}

            {/* Annonces */}
            {announcements.length > 0 && (
              <div className="mb-4">
                <h6 className="text-muted mb-3">
                  <Megaphone size={18} className="me-2" />
                  Annonces
                </h6>
                {announcements.map(message => (
                  <MessageCard key={message.id} message={message} showPin={false} />
                ))}
              </div>
            )}

            {/* Messages normaux */}
            <div className="mb-4">
              <h6 className="text-muted mb-3">💬 Messages</h6>
              {regular.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <Card.Body className="text-center py-5">
                    <p className="text-muted">Aucun message pour le moment</p>
                    <p className="text-muted small">Soyez le premier à envoyer un message !</p>
                  </Card.Body>
                </Card>
              ) : (
                regular.map(message => (
                  <MessageCard key={message.id} message={message} showPin={false} />
                ))
              )}
            </div>

            {/* Formulaire d'envoi */}
            {!userIsMuted && (
              <Card className="border-0 shadow-sm sticky-bottom">
                <Card.Body>
                  <Form onSubmit={handleSendMessage}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Écrivez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sending}
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        {isFormateur() && (
                          <Form.Check
                            type="checkbox"
                            label="📢 Publier comme annonce"
                            checked={isAnnonce}
                            onChange={(e) => setIsAnnonce(e.target.checked)}
                          />
                        )}
                      </div>
                      <Button 
                        type="submit" 
                        variant="primary"
                        disabled={sending || !newMessage.trim()}
                      >
                        <Send size={18} className="me-2" />
                        {sending ? 'Envoi...' : 'Envoyer'}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      {/* Modal Liste des Membres */}
      <Modal show={showMembresModal} onHide={() => setShowMembresModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Membres de la communauté</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {membres.map(membre => (
            <div key={membre.id} className="d-flex align-items-center justify-content-between py-2 border-bottom">
              <div className="d-flex align-items-center">
                <div 
                  className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3"
                  style={{ width: 35, height: 35 }}
                >
                  {membre.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{membre.name}</strong>
                  {membre.pivot.role === 'admin' && (
                    <Badge bg="success" className="ms-2">Formateur</Badge>
                  )}
                  {membre.pivot.is_muted && (
                    <Badge bg="danger" className="ms-2">Muté</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMembresModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CommunauteView;