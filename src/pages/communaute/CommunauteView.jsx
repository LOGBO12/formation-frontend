import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Row, Col, Card, Form, Button, Badge, Modal, 
  Dropdown, OverlayTrigger, Tooltip, Spinner 
} from 'react-bootstrap';
import { 
  Send, ImageIcon, Video, Mic, FileText, Paperclip,
  Smile, MoreVertical, Reply, Edit3, Trash2, Pin, Eye,
  ThumbsUp, Heart, Laugh, AlertCircle, PartyPopper, Flame, 
  Hand, Download, Play, Pause, Volume2, VolumeX
} from 'lucide-react';

const CommunauteView = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [messageType, setMessageType] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const messagesEndRef = useRef(null);

  const reactions = [
    { type: 'like', emoji: '👍' },
    { type: 'love', emoji: '❤️' },
    { type: 'laugh', emoji: '😂' },
    { type: 'wow', emoji: '😮' },
    { type: 'party', emoji: '🎉' },
    { type: 'fire', emoji: '🔥' },
    { type: 'clap', emoji: '👏' },
  ];

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 50 * 1024 * 1024);
    setSelectedFiles([...selectedFiles, ...validFiles].slice(0, 5));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
        setSelectedFiles([file]);
        setMessageType('audio');
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      alert('Impossible d\'accéder au microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    console.log('Envoi message...', { message: newMessage, files: selectedFiles });
    
    setNewMessage('');
    setSelectedFiles([]);
    setMessageType('text');
    setReplyTo(null);
  };

  const handleReaction = async (messageId, reactionType) => {
    console.log('Toggle reaction:', messageId, reactionType);
  };

  const MessageCard = ({ message }) => {
    const [showReplies, setShowReplies] = useState(false);

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
                {message.is_edited && (
                  <Badge bg="secondary" className="ms-2" style={{ fontSize: '0.7rem' }}>
                    modifié
                  </Badge>
                )}
                <div className="text-muted small">
                  {new Date(message.created_at).toLocaleString('fr-FR')}
                </div>
              </div>
            </div>

            <Dropdown>
              <Dropdown.Toggle variant="link" size="sm" className="text-muted">
                <MoreVertical size={18} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setReplyTo(message)}>
                  <Reply size={16} className="me-2" />
                  Répondre
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {message.parent && (
            <div className="bg-light p-2 rounded mb-2 small">
              <Reply size={14} className="me-1" />
              En réponse à <strong>{message.parent.user?.name}</strong>
            </div>
          )}

          {message.message && (
            <p className="mb-2" style={{ whiteSpace: 'pre-wrap' }}>
              {message.message}
            </p>
          )}

          {message.type === 'image' && message.attachments && (
            <div className="d-flex flex-wrap gap-2 mb-2">
              {message.attachments.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt="attachment"
                  className="rounded"
                  style={{ maxWidth: 200, maxHeight: 200, cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedMedia({ type: 'image', url });
                    setShowMediaModal(true);
                  }}
                />
              ))}
            </div>
          )}

          {message.type === 'video' && message.attachments && (
            <div className="mb-2">
              {message.attachments.map((url, idx) => (
                <video
                  key={idx}
                  controls
                  style={{ maxWidth: '100%', borderRadius: 8 }}
                >
                  <source src={url} type="video/mp4" />
                </video>
              ))}
            </div>
          )}

          {message.type === 'audio' && message.attachments && (
            <div className="mb-2">
              {message.attachments.map((url, idx) => (
                <AudioPlayer key={idx} src={url} />
              ))}
            </div>
          )}

          {message.type === 'pdf' && message.attachments && (
            <div className="mb-2">
              {message.attachments.map((url, idx) => (
                <Card key={idx} className="bg-light">
                  <Card.Body className="d-flex align-items-center">
                    <FileText size={32} className="text-danger me-3" />
                    <div className="flex-grow-1">
                      <strong>Document PDF</strong>
                      <div className="text-muted small">
                        {message.attachments_meta?.[idx]?.original_name}
                      </div>
                    </div>
                    <Button variant="outline-primary" size="sm" as="a" href={url} download>
                      <Download size={16} />
                    </Button>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}

          <div className="d-flex align-items-center gap-2 mb-2">
            {message.grouped_reactions && Object.keys(message.grouped_reactions).length > 0 && (
              <div className="d-flex gap-1">
                {Object.entries(message.grouped_reactions).map(([type, count]) => {
                  const reaction = reactions.find(r => r.type === type);
                  return (
                    <Button
                      key={type}
                      variant="light"
                      size="sm"
                      className={message.user_reactions?.includes(type) ? 'border-primary' : ''}
                      onClick={() => handleReaction(message.id, type)}
                    >
                      {reaction?.emoji} {count}
                    </Button>
                  );
                })}
              </div>
            )}

            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                <Smile size={16} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <div className="px-2">
                  <div className="d-flex gap-2">
                    {reactions.map(({ type, emoji }) => (
                      <Button
                        key={type}
                        variant="light"
                        size="sm"
                        onClick={() => handleReaction(message.id, type)}
                        style={{ fontSize: '1.2rem' }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              </Dropdown.Menu>
            </Dropdown>

            {message.replies_count > 0 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
              >
                {message.replies_count} réponse(s)
              </Button>
            )}

            {message.views_count > 0 && (
              <small className="text-muted ms-auto">
                <Eye size={14} className="me-1" />
                {message.views_count}
              </small>
            )}
          </div>

          {showReplies && message.replies && (
            <div className="ps-4 border-start border-primary">
              {message.replies.map(reply => (
                <MessageCard key={reply.id} message={reply} />
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  const AudioPlayer = ({ src }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);

    return (
      <Card className="bg-light">
        <Card.Body className="d-flex align-items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (isPlaying) {
                audioRef.current?.pause();
              } else {
                audioRef.current?.play();
              }
              setIsPlaying(!isPlaying);
            }}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </Button>
          
          <audio
            ref={audioRef}
            src={src}
            onEnded={() => setIsPlaying(false)}
            muted={isMuted}
          />
          
          <div className="flex-grow-1">
            <div className="bg-secondary rounded" style={{ height: 4 }}>
              <div className="bg-primary rounded" style={{ height: 4, width: '40%' }} />
            </div>
          </div>
          
          <Button
            variant="link"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </Button>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container className="py-4">
      <Row>
        <Col lg={10} className="mx-auto">
          <div className="mb-4">
            {messages.map(message => (
              <MessageCard key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <Card className="border-0 shadow sticky-bottom">
            <Card.Body>
              {replyTo && (
                <div className="bg-light p-2 rounded mb-2 d-flex justify-content-between">
                  <small>
                    <Reply size={14} className="me-1" />
                    Répondre à <strong>{replyTo.user?.name}</strong>
                  </small>
                  <Button variant="link" size="sm" onClick={() => setReplyTo(null)}>
                    ×
                  </Button>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div className="mb-2">
                  <div className="d-flex flex-wrap gap-2">
                    {selectedFiles.map((file, idx) => (
                      <Badge key={idx} bg="secondary" className="p-2">
                        {file.name}
                        <Button
                          variant="link"
                          size="sm"
                          className="text-white p-0 ms-2"
                          onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-flex gap-2 mb-2">
                <OverlayTrigger overlay={<Tooltip>Image</Tooltip>}>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => {
                      setMessageType('image');
                      fileInputRef.current?.click();
                    }}
                  >
                    <ImageIcon size={18} />
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger overlay={<Tooltip>Vidéo</Tooltip>}>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => {
                      setMessageType('video');
                      fileInputRef.current?.click();
                    }}
                  >
                    <Video size={18} />
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger overlay={<Tooltip>Audio</Tooltip>}>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={isRecording ? 'btn-danger' : ''}
                  >
                    <Mic size={18} />
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger overlay={<Tooltip>Fichier</Tooltip>}>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => {
                      setMessageType('file');
                      fileInputRef.current?.click();
                    }}
                  >
                    <Paperclip size={18} />
                  </Button>
                </OverlayTrigger>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  accept={
                    messageType === 'image' ? 'image/*' :
                    messageType === 'video' ? 'video/*' :
                    messageType === 'audio' ? 'audio/*' :
                    messageType === 'pdf' ? '.pdf' : '*'
                  }
                  onChange={handleFileSelect}
                />
              </div>

              <div>
                <div className="d-flex gap-2">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Écrivez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isRecording}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} variant="primary" disabled={isRecording}>
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        show={showMediaModal}
        onHide={() => setShowMediaModal(false)}
        size="lg"
        centered
      >
        <Modal.Body className="p-0">
          {selectedMedia?.type === 'image' && (
            <img src={selectedMedia.url} alt="media" style={{ width: '100%' }} />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CommunauteView;