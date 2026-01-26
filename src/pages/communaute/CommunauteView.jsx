import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Form, Button, Badge, Spinner, Alert, Modal, Dropdown 
} from 'react-bootstrap';
import { 
  Send, ArrowLeft, Shield, Users, AlertCircle, Paperclip, 
  Image, Video, Mic, FileText, Pin, Trash2, Edit2, 
  Reply, MoreVertical, Smile, Download, X, StopCircle
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
  
  // États pour l'enregistrement vocal amélioré
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
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
  
  //  Augmenter l'intervalle pour éviter les conflits
  const interval = setInterval(() => {
    fetchMessages(false);
  }, 10000); // 10 secondes au lieu de 5

  return () => {
    clearInterval(interval);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };
}, [id]);

  // Scroll intelligent
  useEffect(() => {
    if (messages.length > prevMessagesLength.current && shouldScroll) {
      scrollToBottom();
    }
    prevMessagesLength.current = messages.length;
  }, [messages, shouldScroll]);

  // Juste avant le return dans le JSX
useEffect(() => {
  console.log('🔍 Messages actuels:', messages.length);
  messages.forEach(msg => {
    if (msg.parent) {
      console.log(`📨 Message ${msg.id} a un parent:`, msg.parent.id);
    }
  });
}, [messages]);

  // Détecter le scroll manuel
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
      const newMessages = msgRes.data.messages.data || [];
      
      // ✅ Fusionner intelligemment au lieu d'écraser
      setMessages(prevMessages => {
        // Créer un Map pour éviter les doublons
        const messageMap = new Map();
        
        // D'abord ajouter les messages existants
        prevMessages.forEach(msg => {
          messageMap.set(msg.id, msg);
        });
        
        // Puis ajouter/mettre à jour avec les nouveaux messages
        newMessages.forEach(msg => {
          messageMap.set(msg.id, msg);
        });
        
        // Convertir en tableau et trier
        return Array.from(messageMap.values()).sort((a, b) => {
          // Épinglés en premier
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          // Annonces ensuite
          if (a.is_announcement && !b.is_announcement) return -1;
          if (!a.is_announcement && b.is_announcement) return 1;
          // Puis par date
          return new Date(a.created_at) - new Date(b.created_at);
        });
      });
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

  // ============================================
  // ENREGISTREMENT VOCAL PROFESSIONNEL (comme WhatsApp)
  // ============================================
  
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Arrêter toutes les pistes audio
        stream.getTracks().forEach(track => track.stop());
        
        // Arrêter le timer
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      setIsPaused(false);

      // Démarrer le timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      toast.success('🎤 Enregistrement en cours...', {
        duration: 2000,
        icon: '🔴'
      });
    } catch (error) {
      console.error('Erreur microphone:', error);
      toast.error('Impossible d\'accéder au microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success(' Audio enregistré !');
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    setAudioBlob(null);
    setRecordingDuration(0);
    audioChunksRef.current = [];
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    toast.info('❌ Enregistrement annulé');
  };

  const sendAudioMessage = async () => {
  if (!audioBlob) return;
  
  setSending(true);
  
  try {
    const formData = new FormData();
    
    if (newMessage.trim()) {
      formData.append('message', newMessage.trim());
    }
    
    formData.append('type', 'audio');
    
    if (replyingTo) {
      formData.append('parent_message_id', replyingTo.id);
    }
    
    const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { 
      type: 'audio/webm' 
    });
    formData.append('files[]', audioFile);

    const response = await api.post(`/communautes/${id}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      const isReply = !!replyingTo;
      
      setNewMessage('');
      setAudioBlob(null);
      setRecordingDuration(0);
      setReplyingTo(null);
      
      //  Ajouter SEULEMENT si pas déjà présent
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === response.data.message.id);
        if (exists) return prev;
        return [...prev, response.data.message];
      });
      
      setShouldScroll(true);
      setTimeout(() => scrollToBottom(), 50);
      setTimeout(() => fetchMessages(false), 2000);
      
      toast.success(isReply ? ' Réponse vocale envoyée !' : ' Message vocal envoyé !');
    }
  } catch (error) {
    console.error('❌ Erreur envoi audio:', error);
    toast.error('Erreur lors de l\'envoi de l\'audio');
  } finally {
    setSending(false);
  }
};

  // ============================================
  // GESTION DES FICHIERS
  // ============================================
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    setSelectedFiles(files);
    
    const file = files[0];
    const mimeType = file.type;

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
  };

  // ============================================
  // ENVOI DE MESSAGE
  // ============================================
  
  const handleSendMessage = async (e) => {
  e?.preventDefault();
  
  // Si on a un audio enregistré, utiliser la fonction dédiée
  if (audioBlob) {
    await sendAudioMessage();
    return;
  }
  
  if (!newMessage.trim() && selectedFiles.length === 0) {
    toast.error('Veuillez saisir un message ou sélectionner un fichier');
    return;
  }

  if (communaute?.is_muted) {
    toast.error('Vous ne pouvez pas envoyer de messages (vous êtes muté)');
    return;
  }

  setSending(true);
  
  try {
    const formData = new FormData();
    
    if (newMessage.trim()) {
      formData.append('message', newMessage.trim());
    }
    
    formData.append('type', messageType);
    
    if (replyingTo) {
      formData.append('parent_message_id', replyingTo.id);
      console.log(' Réponse à message ID:', replyingTo.id);
    }
    
    selectedFiles.forEach((file) => {
      formData.append('files[]', file);
    });

    console.log('📤 Envoi du message...');

    const response = await api.post(`/communautes/${id}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      console.log(' Message reçu du serveur:', response.data.message);
      console.log('Parent dans la réponse:', response.data.message.parent);
      
      const isReply = !!replyingTo;
      
      // ✅ Réinitialiser le formulaire
      setNewMessage('');
      setSelectedFiles([]);
      setMessageType('text');
      setReplyingTo(null);
      
      // ✅ Ajouter le message SEULEMENT s'il n'existe pas déjà
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === response.data.message.id);
        if (exists) {
          console.log('⚠️ Message déjà présent, skip');
          return prev;
        }
        console.log('Ajout du nouveau message');
        return [...prev, response.data.message];
      });
      
      // ✅ Scroll immédiat
      setShouldScroll(true);
      setTimeout(() => scrollToBottom(), 50);
      
      // ✅ Pas de refresh immédiat, on attend 2 secondes
      setTimeout(() => {
        console.log('🔄 Refresh différé...');
        fetchMessages(false);
      }, 2000);
      
      // ✅ Message de succès
      toast.success(isReply ? ' Réponse envoyée !' : ' Message envoyé !', {
        duration: 2000
      });
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

  // ============================================
  // RÉACTIONS
  // ============================================
  
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

  // ============================================
  // ACTIONS SUR LES MESSAGES
  // ============================================
  
  const handlePinMessage = async (messageId) => {
    try {
      await api.post(`/communautes/messages/${messageId}/epingler`);
      toast.success('Message épinglé');
      fetchMessages(false);
    } catch (error) {
      toast.error('Erreur');
    }
  };

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

  // ============================================
  // HELPERS
  // ============================================
  
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
              <div className="d-flex align-items-center gap-2 mb-2">
                <Mic size={16} />
                <small className="text-muted">Message vocal</small>
              </div>
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

      {/* Warning si muté */}
      {communaute.is_muted && (
        <Alert variant="warning" className="mb-0 rounded-0 text-center small py-2">
          <AlertCircle size={16} className="me-2" />
          Vous ne pouvez pas envoyer de messages dans cette communauté
        </Alert>
      )}

      {/* Répondre à... */}
      {replyingTo && (
        <div className="bg-light p-2 d-flex justify-content-between align-items-center border-bottom">
          <div className="small">
            <Reply size={16} className="me-2 text-success" />
            <strong>Répondre à {replyingTo.user?.name}</strong>
            <div className="text-muted">{replyingTo.message?.substring(0, 50)}...</div>
          </div>
          <Button 
            variant="link" 
            size="sm"
            className="text-danger"
            onClick={() => setReplyingTo(null)}
          >
            <X size={18} />
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
                      {/* Réponse à un message parent */}
                      {message.parent && (
                        <div 
                          className="mb-2 p-2 rounded"
                          style={{ 
                            backgroundColor: isMyMessage(message) ? 'rgba(255,255,255,0.3)' : '#f8f9fa',
                            borderLeft: `3px solid ${isMyMessage(message) ? '#fff' : '#28a745'}`,
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            // Option : scroller vers le message parent
                            console.log('📍 Parent message:', message.parent);
                          }}
                        >
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <Reply size={14} className={isMyMessage(message) ? 'text-white' : 'text-success'} />
                            <small className="fw-bold" style={{ 
                              color: isMyMessage(message) ? '#fff' : '#28a745' 
                            }}>
                              {message.parent.user?.name || 'Utilisateur'}
                            </small>
                          </div>
                          <div 
                            className="small" 
                            style={{ 
                              color: isMyMessage(message) ? 'rgba(255,255,255,0.9)' : '#666',
                              wordBreak: 'break-word'
                            }}
                          >
                            {message.parent.message ? (
                              message.parent.message.substring(0, 50) + (message.parent.message.length > 50 ? '...' : '')
                            ) : (
                              <em>[Fichier {message.parent.type}]</em>
                            )}
                          </div>
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
                            key={index}bg="light" 
                            pill
                            className="cursor-pointer"
                            onClick={() => handleReaction(message.id, emojiChar)}
                          >
                            {emojiChar} {reaction.count}
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {/* Heure et statut */}
                  <div className="d-flex align-items-center justify-content-end gap-2 mt-2">
                    <small 
                      className="opacity-75"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {formatMessageTime(message.created_at)}
                    </small>
                    {message.is_edited && (
                      <small className="opacity-75" style={{ fontSize: '0.7rem' }}>
                        (modifié)
                      </small>
                    )}
                  </div>

                  {/* Bouton réactions rapides */}
                  <div className="position-absolute bottom-0 start-0 translate-middle-y ms-2">
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="link"
                        size="sm"
                        className="p-0 text-muted"
                      >
                        <Smile size={16} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <div className="d-flex gap-2 p-2">
                          {emojis.map((emoji) => (
                            <span
                              key={emoji}
                              style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                              onClick={() => handleReaction(message.id, emoji)}
                            >
                              {emoji}
                            </span>
                          ))}
                        </div>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </Container>
      </div>

      {/* Prévisualisation de l'audio enregistré */}
      {audioBlob && !isRecording && (
        <div className="bg-white border-top p-3">
          <Container>
            <div className="d-flex align-items-center gap-3">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Mic size={18} className="text-success" />
                  <strong>Message vocal enregistré</strong>
                  <Badge bg="success">{formatRecordingTime(recordingDuration)}</Badge>
                </div>
                <audio 
                  controls 
                  className="w-100"
                  src={URL.createObjectURL(audioBlob)}
                />
              </div>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={cancelRecording}
              >
                <X size={18} />
              </Button>
            </div>
          </Container>
        </div>
      )}

      {/* Prévisualisation des fichiers sélectionnés */}
      {selectedFiles.length > 0 && (
        <div className="bg-light border-top p-2">
          <Container>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {selectedFiles.map((file, idx) => (
                <Badge key={idx} bg="info" className="d-flex align-items-center gap-2">
                  <Paperclip size={14} />
                  {file.name}
                  <X
                    size={14}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                      if (selectedFiles.length === 1) {
                        setMessageType('text');
                      }
                    }}
                  />
                </Badge>
              ))}
            </div>
          </Container>
        </div>
      )}

      {/* Zone de saisie - Style WhatsApp avec fusion bouton envoi/micro */}
      {!communaute.is_muted && (
        <div className="bg-white border-top p-3">
          <Container>
            {isRecording ? (
              /* Interface d'enregistrement - Style WhatsApp */
              <div className="d-flex align-items-center gap-3">
                <Button
                  variant="danger"
                  className="rounded-circle"
                  style={{ width: 45, height: 45 }}
                  onClick={cancelRecording}
                >
                  <Trash2 size={20} />
                </Button>

                <div className="flex-grow-1 bg-light rounded-pill px-4 py-2">
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="bg-danger rounded-circle"
                      style={{ 
                        width: 12, 
                        height: 12,
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2">
                        <Mic size={18} className="text-danger" />
                        <span className="fw-bold text-danger">
                          {formatRecordingTime(recordingDuration)}
                        </span>
                      </div>
                      <div className="progress mt-1" style={{ height: 3 }}>
                        <div 
                          className="progress-bar bg-danger"
                          style={{ 
                            width: `${Math.min((recordingDuration / 60) * 100, 100)}%`,
                            transition: 'width 1s linear'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="success"
                  className="rounded-circle"
                  style={{ width: 45, height: 45 }}
                  onClick={stopRecording}
                >
                  <StopCircle size={20} />
                </Button>
              </div>
            ) : (
              /* Interface normale de saisie */
              <Form onSubmit={handleSendMessage}>
                <div className="d-flex align-items-end gap-2">
                  {/* Boutons d'attachements */}
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="link"
                      className="text-muted p-2"
                    >
                      <Paperclip size={22} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => fileInputRef.current?.click()}>
                        <Image size={16} className="me-2" />
                        Image
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => fileInputRef.current?.click()}>
                        <Video size={16} className="me-2" />
                        Vidéo
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => fileInputRef.current?.click()}>
                        <FileText size={16} className="me-2" />
                        Document
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    className="d-none"
                    onChange={handleFileSelect}
                  />

                  {/* Champ de saisie */}
                  <Form.Control
                    as="textarea"
                    rows={1}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    placeholder="Tapez un message..."
                    className="border-0 bg-light rounded-pill px-3 py-2"
                    style={{
                      resize: 'none',
                      maxHeight: '120px',
                      overflow: 'auto'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    disabled={sending || isRecording}
                  />

                  {/* Bouton Envoi/Micro fusionné - Style WhatsApp */}
                  {newMessage.trim() || selectedFiles.length > 0 || audioBlob ? (
                    <Button
                      type="submit"
                      disabled={sending}
                      className="rounded-circle bg-success border-0"
                      style={{ width: 45, height: 45 }}
                    >
                      {sending ? (
                        <Spinner size="sm" animation="border" />
                      ) : (
                        <Send size={20} />
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={startRecording}
                      disabled={isRecording}
                      className="rounded-circle bg-success border-0"
                      style={{ width: 45, height: 45 }}
                    >
                      <Mic size={20} />
                    </Button>
                  )}
                </div>
              </Form>
            )}
          </Container>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }

        .cursor-pointer {
          cursor: pointer;
        }

        /* Style pour le scroll */
        .overflow-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .overflow-auto::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }

        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        /* Animation pour les nouveaux messages */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Style pour les mentions */
        .mention {
          color: #075e54;
          font-weight: bold;
          background-color: rgba(7, 94, 84, 0.1);
          padding: 2px 4px;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default CommunauteView;