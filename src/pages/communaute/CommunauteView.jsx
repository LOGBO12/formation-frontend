import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Form, Button, Badge, Modal, 
  Dropdown, OverlayTrigger, Tooltip, Spinner 
} from 'react-bootstrap';
import { 
  Send, ImageIcon, Video, Mic, FileText, Paperclip,
  Smile, MoreVertical, Reply, ArrowLeft, Shield, Users,
  ThumbsUp, Heart, Laugh, AlertCircle, PartyPopper, Flame, Hand
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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchData = async () => {
    try {
      const [comRes, msgRes] = await Promise.all([
        api.get(`/communautes/${id}`),
        api.get(`/communautes/${id}/messages`)
      ]);

      setCommunaute(comRes.data.communaute);
      setMessages(msgRes.data.messages.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await api.post(`/communautes/${id}/messages`, {
        message: newMessage.trim()
      });

      setNewMessage('');
      fetchData(); // Recharger les messages
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
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
                  {communaute.total_membres} membres
                </small>
              </div>
            </div>

            {user?.role === 'formateur' && (
              <Button
                variant="link"
                className="text-white"
                onClick={() => navigate(`/formateur/communaute/${id}/moderation`)}
              >
                <Shield size={20} />
              </Button>
            )}
          </div>
        </Container>
      </div>

      {/* Messages Area - WhatsApp Style */}
      <div className="flex-grow-1 overflow-auto" style={{ backgroundImage: 'url(/whatsapp-bg.png)' }}>
        <Container className="py-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted py-5">
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
                  style={{ maxWidth: '70%', minWidth: '200px' }}
                >
                  {!isMyMessage(message) && (
                    <div className="fw-bold mb-1" style={{ fontSize: '0.85rem', color: '#075e54' }}>
                      {message.user?.name}
                    </div>
                  )}
                  
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {message.message}
                  </div>
                  
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

      {/* Input Area - WhatsApp Style */}
      <div className="bg-light p-3 shadow">
        <Container>
          <Form onSubmit={handleSendMessage}>
            <div className="d-flex gap-2 align-items-center">
              <Form.Control
                as="textarea"
                rows={1}
                placeholder="Écrivez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
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
                disabled={!newMessage.trim() || sending}
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