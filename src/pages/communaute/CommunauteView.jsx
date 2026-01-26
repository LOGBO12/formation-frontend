import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Form, Button, Badge, Spinner, Alert, Modal, Dropdown 
} from 'react-bootstrap';
import { 
  Send, ArrowLeft, Shield, Users, AlertCircle, Paperclip, 
  Image, Video, Mic, FileText, Pin, Trash2, Edit2, 
  Reply, MoreVertical, Smile, Download
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
  
  // États pour les fichiers
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [messageType, setMessageType] = useState('text');
  
  // États pour les réponses
  const [replyingTo, setReplyingTo] = useState(null);
  
  // États pour l'édition
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  
  // États pour les emojis
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessageForEmoji, setSelectedMessageForEmoji] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [shouldScroll, setShouldScroll] = useState(true);
  const prevMessagesLength = useRef(0);

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];
  const emojiMap = {
    '👍': 'like',
    '❤️': 'love',
    '😂': 'laugh',
    '😮': 'wow',
    '😢': 'sad',
    '🎉': 'party',
    '🔥': 'fire',
    '👏': 'clap'
  };

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  // Scroll intelligent - seulement si nouveaux messages
  useEffect(() => {
    if (messages.length > prevMessagesLength.current && shouldScroll) {
      scrollToBottom();
    }
    prevMessagesLength.current = messages.length;
  }, [messages, shouldScroll]);

  // Détecter si l'utilisateur a scrollé manuellement
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldScroll(isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      
      const [comRes, msgRes] = await Promise.all([
        api.get(`/communautes/${id}`),
        api.get(`/communautes/${id}/messages`)
      ]);

      if (comRes.data.success) {
        setCommunaute(comRes.data.communaute);
      }
      
      if (msgRes.data.success) {
        setMessages(msgRes.data.messages.data || []);
        // Premier chargement, on scroll
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erreur lors du chargement';
      setError(errorMsg);
      toast.error(errorMsg);
      
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

  // Gestion des fichiers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    console.log('📎 Fichiers sélectionnés:', files);

    setSelectedFiles(files);
    
    const file = files[0];
    const mimeType = file.type;

    // Déterminer le type de message selon le MIME type
    if (mimeType.startsWith('image/')) {
      setMessageType('image');
    } else if (mimeType.startsWith('video/')) {
      setMessageType('video');
    } else if (mimeType.startsWith('audio/')) {
      setMessageType('audio');
    } else if (mimeType === 'application/pdf') {
      setMessageType('pdf');
    } else {
      setMessageType('file');
    }

    console.log('📝 Type de message:', messageType);
  };

  // Enregistrement audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
        setSelectedFiles([file]);
        setMessageType('audio');
        stream.getTracks().forEach(track => track.stop());
        toast.success('Audio enregistré !');
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success('Enregistrement en cours...');
    } catch (error) {
      console.error('Erreur microphone:', error);
      toast.error('Impossible d\'accéder au microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Envoyer un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && selectedFiles.length === 0) {
      toast.error('Veuillez saisir un message ou sélectionner un fichier');
      return;
    }

    setSending(true);
    
    try {
      const formData = new FormData();
      formData.append('message', newMessage.trim());
      formData.append('type', messageType);
      
      if (replyingTo) {
        formData.append('parent_message_id', replyingTo.id);
      }
      
      // Ajouter les fichiers
      selectedFiles.forEach((file, index) => {
        formData.append('files[]', file);
        console.log(`Ajout fichier ${index}:`, file.name, file.type, file.size);
      });

      console.log('📤 Envoi du message...');
      console.log('Type:', messageType);
      console.log('Fichiers:', selectedFiles.length);

      const response = await api.post(`/communautes/${id}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        console.log('✅ Message envoyé avec succès');
        
        // Réinitialiser
        setNewMessage('');
        setSelectedFiles([]);
        setMessageType('text');
        setReplyingTo(null);
        
        // Ajouter le message immédiatement
        setMessages(prev => [...prev, response.data.message]);
        
        // Forcer le scroll vers le bas
        setShouldScroll(true);
        setTimeout(() => scrollToBottom(), 100);
        
        // Refresh après 500ms
        setTimeout(() => fetchMessages(false), 500);
        
        toast.success('Message envoyé !');
      }
    } catch (error) {
      console.error('❌ Erreur envoi:', error);
      console.error('Response:', error.response?.data);
      
      const errorMsg = error.response?.data?.message || 'Erreur lors de l\'envoi';
      const errors = error.response?.data?.errors;
      
      if (errors) {
        Object.values(errors).flat().forEach(err => toast.error(err));
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setSending(false);
    }
  };

  // Réagir à un message
  const handleReaction = async (messageId, emoji) => {
    try {
      const reactionType = emojiMap[emoji];
      const response = await api.post(`/communautes/messages/${messageId}/reactions`, {
        reaction: reactionType
      });

      if (response.data.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, reactions: response.data.reactions }
            : msg
        ));
      }
    } catch (error) {
      toast.error('Erreur lors de la réaction');
    }
  };

  // Épingler un message
  const handlePinMessage = async (messageId) => {
    try {
      await api.post(`/communautes/messages/${messageId}/epingler`);
      toast.success('Message épinglé');
      fetchMessages(false);
    } catch (error) {
      toast.error('Erreur');
    }
  };

  // Supprimer un message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    
    try {
      await api.delete(`/communautes/messages/${messageId}`);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Modifier un message
  const handleEditMessage = async (messageId) => {
    if (!editText.trim()) return;
    
    try {
      const response = await api.put(`/communautes/messages/${messageId}`, {
        message: editText
      });
      
      if (response.data.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? response.data.message : msg
        ));
        setEditingMessage(null);
        setEditText('');
        toast.success('Message modifié');
      }
    } catch (error) {
      toast.error('Erreur lors de la modification');
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
        month: '2-digit'
      }) + ' ' + timeString;
    }
  };

  const isMyMessage = (message) => {
    return message.user?.id === user?.id;
  };

  const renderMessageContent = (message) => {
    if (message.type === 'text') {
      return <div style={{ whiteSpace: 'pre-wrap' }}>{message.message}</div>;
    }

    const baseUrl = 'http://localhost:8000/storage/';

    if (message.type === 'image' && message.attachments && message.attachments.length > 0) {
      return (
        <div>
          {message.message && (
            <div className="mb-2" style={{ whiteSpace: 'pre-wrap' }}>
              {message.message}
            </div>
          )}
          {message.attachments.map((path, idx) => (
            <img 
              key={idx}
              src={`${baseUrl}${path}`}
              alt="Image"
              className="img-fluid rounded mb-2"
              style={{ maxWidth: '300px', cursor: 'pointer' }}
              onClick={() => window.open(`${baseUrl}${path}`, '_blank')}
            />
          ))}
        </div>
      );
    }

    if (message.type === 'video' && message.attachments && message.attachments.length > 0) {
      return (
        <div>
          {message.message && (
            <div className="mb-2" style={{ whiteSpace: 'pre-wrap' }}>
              {message.message}
            </div>
          )}
          {message.attachments.map((path, idx) => (
            <video 
              key={idx}
              controls 
              className="rounded mb-2"
              style={{ maxWidth: '300px' }}
            >
              <source src={`${baseUrl}${path}`} />
              Votre navigateur ne supporte pas la vidéo.
            </video>
          ))}
        </div>
      );
    }

    if (message.type === 'audio' && message.attachments && message.attachments.length > 0) {
      return (
        <div>
          {message.message && (
            <div className="mb-2" style={{ whiteSpace: 'pre-wrap' }}>
              {message.message}
            </div>
          )}
          {message.attachments.map((path, idx) => (
            <div key={idx} className="bg-light p-2 rounded mb-2">
              <audio controls className="w-100">
                <source src={`${baseUrl}${path}`} />
                Votre navigateur ne supporte pas l'audio.
              </audio>
            </div>
          ))}
        </div>
      );
    }

    if ((message.type === 'pdf' || message.type === 'file') && message.attachments && message.attachments.length > 0) {
      return (
        <div>
          {message.message && (
            <div className="mb-2" style={{ whiteSpace: 'pre-wrap' }}>
              {message.message}
            </div>
          )}
          {message.attachments.map((path, idx) => {
            const meta = message.attachments_meta?.[idx];
            return (
              <a 
                key={idx}
                href={`${baseUrl}${path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="d-flex align-items-center gap-2 text-decoration-none bg-light p-2 rounded"
              >
                <FileText size={20} />
                <div className="flex-grow-1">
                  <div>{meta?.name || 'Fichier'}</div>
                  {meta?.size && (
                    <small className="text-muted">
                      {(meta.size / 1024).toFixed(2)} KB
                    </small>
                  )}
                </div>
                <Download size={16} />
              </a>
            );
          })}
        </div>
      );
    }

    return <div>{message.message}</div>;
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
      {/* Header */}
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

      {/* Répondre à... */}
      {replyingTo && (
        <div className="bg-light p-2 d-flex justify-content-between align-items-center">
          <div className="small">
            <strong>Répondre à {replyingTo.user?.name}</strong>
            <div className="text-muted">{replyingTo.message?.substring(0, 50)}...</div>
          </div>
          <Button 
            variant="link" 
            size="sm"
            onClick={() => setReplyingTo(null)}
          >
            ✕
          </Button>
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-grow-1 overflow-auto p-3" 
        style={{ backgroundColor: '#e5ddd5' }}
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
                  className={`rounded px-3 py-2 shadow-sm position-relative ${
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
                  {/* Menu contextuel */}
                  <Dropdown className="position-absolute top-0 end-0 mt-1 me-1">
                    <Dropdown.Toggle 
                      variant="link" 
                      size="sm"
                      className={`p-0 ${isMyMessage(message) ? 'text-white' : 'text-dark'}`}
                    >
                      <MoreVertical size={16} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setReplyingTo(message)}>
                        <Reply size={14} className="me-2" />
                        Répondre
                      </Dropdown.Item>
                      {isMyMessage(message) && message.type === 'text' && (
                        <>
                          <Dropdown.Item onClick={() => {
                            setEditingMessage(message);
                            setEditText(message.message || '');
                          }}>
                            <Edit2 size={14} className="me-2" />
                            Modifier
                          </Dropdown.Item>
                          <Dropdown.Item 
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-danger"
                          >
                            <Trash2 size={14} className="me-2" />
                            Supprimer
                          </Dropdown.Item>
                        </>
                      )}
                      {communaute.mon_role === 'admin' && (
                        <Dropdown.Item onClick={() => handlePinMessage(message.id)}>
                          <Pin size={14} className="me-2" />
                          Épingler
                        </Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>

                  {/* Réponse à un message */}
                  {message.parent && (
                    <div 
                      className="mb-2 p-2 rounded small"
                      style={{ 
                        backgroundColor: isMyMessage(message) ? 'rgba(255,255,255,0.2)' : '#f0f0f0'
                      }}
                    >
                      <strong>{message.parent.user?.name}</strong>
                      <div className="text-truncate">{message.parent.message}</div>
                    </div>
                  )}

                  {/* Auteur */}
                  {!isMyMessage(message) && (
                    <div 
                      className="fw-bold mb-1 small" 
                      style={{ color: '#075e54' }}
                    >
                      {message.user?.name || 'Utilisateur'}
                    </div>
                  )}
                  
                  {/* Badges */}
                  {message.is_announcement && (
                    <Badge bg="warning" className="mb-2">📢 Annonce</Badge>
                  )}
                  {message.is_pinned && (
                    <Badge bg="info" className="mb-2 ms-2">📌 Épinglé</Badge>
                  )}
                  
                  {/* Contenu */}
                  {editingMessage?.id === message.id ? (
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      //onBlur={() => handleEditMessage(message.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleEditMessage(message.id);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    renderMessageContent(message)
                  )}

                  {/* Réactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="mt-2 d-flex gap-1 flex-wrap">
                      {message.reactions.map((reaction, index) => {
                        const emojiChar = Object.keys(emojiMap).find(
                          key => emojiMap[key] === reaction.reaction
                        );
                        return (
                          <Badge 
                            key={index}
                            bg="light" 
                            text="dark"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleReaction(message.id, emojiChar)}
                          >
                            {emojiChar}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Heure */}
                  <div 
                    className="text-end mt-1 small"
                    style={{ opacity: 0.7 }}
                  >
                    {formatMessageTime(message.created_at)}
                    {message.is_edited && ' (modifié)'}
                  </div>

                  {/* Bouton réaction */}
                  <Button
                    variant="link"
                    size="sm"
                    className="position-absolute bottom-0 end-0 p-0 me-2 mb-1"
                    onClick={() => {
                      setSelectedMessageForEmoji(message.id);
                      setShowEmojiPicker(true);
                    }}
                  >
                    <Smile size={16} />
                  </Button>
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
          {/* Preview des fichiers */}
          {selectedFiles.length > 0 && (
            <div className="mb-2 p-2 bg-white rounded">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong className="small">Fichiers sélectionnés :</strong>
                <Button 
                  variant="link" 
                  size="sm"
                  className="text-danger"
                  onClick={() => {
                    setSelectedFiles([]);
                    setMessageType('text');
                  }}
                >
                  ✕ Annuler
                </Button>
              </div>
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="small text-muted">
                  📎 {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
              ))}
            </div>
          )}

          <Form onSubmit={handleSendMessage}>
            <div className="d-flex gap-2 align-items-end">
              {/* Boutons d'attachement */}
              <Dropdown>
                <Dropdown.Toggle 
                  variant="outline-secondary"
                  className="rounded-circle"
                  style={{ width: 48, height: 48 }}
                  disabled={communaute.is_muted}
                >
                  <Paperclip size={20} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => {
                    fileInputRef.current.accept = 'image/*';
                    fileInputRef.current.click();
                  }}>
                    <Image size={16} className="me-2" />
                    Image
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => {
                    fileInputRef.current.accept = 'video/*';
                    fileInputRef.current.click();
                  }}>
                    <Video size={16} className="me-2" />
                    Vidéo
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => {
                    fileInputRef.current.accept = '.pdf,.doc,.docx,.txt';
                    fileInputRef.current.click();
                  }}>
                    <FileText size={16} className="me-2" />
                    Document
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleFileSelect}
                multiple
              />

              {/* Input texte */}
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
                  paddingRight: '20px'
                }}
               onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />

              {/* Bouton micro */}
              <Button
                variant={isRecording ? 'danger' : 'outline-secondary'}
                className="rounded-circle"
                style={{ width: 48, height: 48 }}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={communaute.is_muted}
              >
                <Mic size={20} />
              </Button>

              {/* Bouton envoyer */}
              <Button
                type="submit"
                variant="success"
                className="rounded-circle"
                style={{ width: 48, height: 48 }}
                disabled={sending || communaute.is_muted || (!newMessage.trim() && selectedFiles.length === 0)}
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

      {/* Modal Emoji Picker */}
      <Modal 
        show={showEmojiPicker} 
        onHide={() => {
          setShowEmojiPicker(false);
          setSelectedMessageForEmoji(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Choisir une réaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-around flex-wrap gap-3">
            {emojis.map((emoji, index) => (
              <Button
                key={index}
                variant="light"
                size="lg"
                style={{ fontSize: '2rem', width: '60px', height: '60px' }}
                onClick={() => {
                  if (selectedMessageForEmoji) {
                    handleReaction(selectedMessageForEmoji, emoji);
                  }
                  setShowEmojiPicker(false);
                  setSelectedMessageForEmoji(null);
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CommunauteView;