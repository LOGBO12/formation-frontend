import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Form, Button, Badge, Spinner, Alert 
} from 'react-bootstrap';
import { 
  Send, ArrowLeft, Shield, Users, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CommunauteView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [communaute, setCommunaute] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh messages every 5 seconds
   const interval = setInterval(() => {
      fetchMessages(false); // Silent refresh
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchData = async () => {
    try {
      console.log('🔵 Fetching communauté data...', { id });
      setError(null);
      
      const [comRes, msgRes] = await Promise.all([
        api.get(`/communautes/${id}`),
        api.get(`/communautes/${id}/messages`)
      ]);

      console.log('✅ Communauté loaded:', comRes.data);
      console.log('✅ Messages loaded:', msgRes.data.messages.data?.length || 0);

      if (comRes.data.success) {
        setCommunaute(comRes.data.communaute);
      }
      
      if (msgRes.data.success) {
        setMessages(msgRes.data.messages.data || []);
      }
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      console.error('❌ Response:', error.response);
      
      const errorMsg = error.response?.data?.message || 'Erreur lors du chargement';
      setError(errorMsg);
      toast.error(errorMsg);
      
      // Si 403, rediriger
      if (error.response?.status === 403) {
        setTimeout(() => navigate(-1), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (showToast = true) => {
    try {
      const msgRes = await api.get(`/communautes/${id}/messages`);
      if (msgRes.data.success) {
        setMessages(msgRes.data.messages.data || []);
      }
    } catch (error) {
      if (showToast) {
        console.error('Erreur refresh messages:', error);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setSending(true);
    
    try {
      console.log('📤 Sending message...', { message: messageContent });
      
      const response = await api.post(`/communautes/${id}/messages`, {
        message: messageContent
      });

      console.log('✅ Message sent:', response.data);

      if (response.data.success) {
        setNewMessage('');
        
        // Ajouter le message immédiatement à la liste
        setMessages(prev => [...prev, response.data.message]);
        
        // Refresh complet pour être sûr
        setTimeout(() => fetchMessages(false), 500);
        
        toast.success('Message envoyé');
      }
    } catch (error) {
      console.error('❌ Erreur envoi:', error);
      console.error('❌ Response:', error.response);
      
      const errorMsg = error.response?.data?.message || 'Erreur lors de l\'envoi';
      toast.error(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = messageDate.toDateString() === now.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    const timeString = messageDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (isToday) {
      return timeString;
    } else if (isYesterday) {
      return `Hier ${timeString}`;
    } else {
      return messageDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' ' + timeString;
    }
  };

  const isMyMessage = (message) => {
    return message.user?.id === user?.id;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Alert variant="danger" className="text-center">
          <AlertCircle size={48} className="mb-3" />
          <h5>{error}</h5>
          <Button variant="outline-danger" onClick={() => navigate(-1)} className="mt-3">
            Retour
          </Button>
        </Alert>
      </div>
    );
  }

  if (!communaute) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Alert variant="warning">Communauté introuvable</Alert>
      </div>
    );
  }

  return (
    <div className="vh-100 d-flex flex-column" style={{ backgroundColor: '#e5ddd5' }}>
      {/* Header WhatsApp Style */}
      <div className="bg-success text-white shadow-sm p-3">
        <Container>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Button 
                variant="link" 
                className="text-white p-0 me-3"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={24} />
              </Button>
              <div 
                className="bg-white rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ width: 40, height: 40 }}
              >
                <Users size={20} className="text-success" />
              </div>
              <div>
                <h6 className="mb-0 fw-bold">{communaute.nom}</h6>
                <small className="opacity-75">
                  {communaute.total_membres} membre{communaute.total_membres > 1 ? 's' : ''}
                </small>
              </div>
            </div>

            <div className="d-flex gap-2">
              {communaute.mon_role === 'admin' && (
                <Button
                  variant="link"
                  className="text-white"
                  onClick={() => navigate(`/formateur/communaute/${id}/moderation`)}
                  title="Modération"
                >
                  <Shield size={20} />
                </Button>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Messages mutés warning */}
      {communaute.is_muted && (
        <Alert variant="warning" className="mb-0 rounded-0 text-center small py-2">
          <AlertCircle size={16} className="me-2" />
          Vous ne pouvez pas envoyer de messages dans cette communauté
        </Alert>
      )}

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-grow-1 overflow-auto p-3" 
        style={{ 
          backgroundImage: 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icGF0dGVybiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48cGF0aCBkPSJNMCAwSDQwVjQwSDB6IiBmaWxsPSIjZTVkZGQ1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==)',
          backgroundColor: '#e5ddd5'
        }}
      >
        <Container>
          {messages.length === 0 ? (
            <div className="text-center text-muted py-5">
              <Users size={48} className="mb-3 opacity-50" />
              <p>Aucun message pour le moment</p>
              <small>Soyez le premier à envoyer un message !</small>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`d-flex mb-3 ${isMyMessage(message) ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`rounded px-3 py-2 shadow-sm ${
                    isMyMessage(message)
                      ? 'bg-success text-white'
                      : 'bg-white text-dark'
                  }`}
                  style={{ 
                    maxWidth: '70%', 
                    minWidth: '200px',
                    wordBreak: 'break-word'
                  }}
                >
                  {/* Auteur (si pas mon message) */}
                  {!isMyMessage(message) && (
                    <div 
                      className="fw-bold mb-1" 
                      style={{ 
                        fontSize: '0.85rem', 
                        color: '#075e54' 
                      }}
                    >
                      {message.user?.name || 'Utilisateur'}
                    </div>
                  )}
                  
                  {/* Badge annonce */}
                  {message.is_announcement && (
                    <Badge bg="warning" className="mb-2">
                      📢 Annonce
                    </Badge>
                  )}
                  
                  {/* Badge épinglé */}
                  {message.is_pinned && (
                    <Badge bg="info" className="mb-2 ms-2">
                      📌 Épinglé
                    </Badge>
                  )}
                  
                  {/* Contenu du message */}
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {message.message}
                  </div>
                  
                  {/* Heure */}
                  <div 
                    className="text-end mt-1" 
                    style={{ 
                      fontSize: '0.7rem',
                      opacity: 0.7
                    }}
                  >
                    {formatMessageTime(message.created_at)}
                    {message.is_edited && ' (modifié)'}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </Container>
      </div>

      {/* Input Area */}
      <div className="bg-light p-3 shadow">
        <Container>
          <Form onSubmit={handleSendMessage}>
            <div className="d-flex gap-2 align-items-center">
              <Form.Control
                as="textarea"
                rows={1}
                placeholder={communaute.is_muted ? "Vous êtes muté" : "Écrivez votre message..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending || communaute.is_muted}
                className="border-0 shadow-sm"
                style={{
                  resize: 'none',
                  borderRadius: '25px',
                  paddingLeft: '20px',
                  paddingRight: '20px',
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || sending || communaute.is_muted}
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 48, height: 48 }}
                variant="success"
              >
                {sending ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <Send size={20} />
                )}
              </Button>
            </div>
          </Form>
        </Container>
      </div>
    </div>
  );
};

export default CommunauteView;