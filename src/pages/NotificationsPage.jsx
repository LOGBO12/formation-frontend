import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Spinner, ButtonGroup } from 'react-bootstrap';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      
      if (response.data.success) {
        const notifs = response.data.notifications.data;
        setNotifications(notifs);
        
        // Calculer les stats
        setStats({
          total: notifs.length,
          unread: notifs.filter(n => !n.lu).length,
          read: notifs.filter(n => n.lu).length,
        });
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.lu;
    if (filter === 'read') return n.lu;
    return true;
  });

  const handleNotificationClick = async (notification) => {
    try {
      // Marquer comme lue
      if (!notification.lu) {
        await api.patch(`/notifications/${notification.id}/marquer-lu`);
        
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id 
              ? { ...n, lu: true, lu_at: new Date().toISOString() }
              : n
          )
        );
        
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1),
          read: prev.read + 1,
        }));
      }

      // Naviguer vers le lien
      if (notification.lien) {
        navigate(notification.lien);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await api.post('/notifications/marquer-tout-lu');
      
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, lu: true, lu_at: new Date().toISOString() }))
        );
        setStats(prev => ({
          ...prev,
          unread: 0,
          read: prev.total,
        }));
        toast.success('Toutes les notifications ont été marquées comme lues');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      
      if (response.data.success) {
        const notification = notifications.find(n => n.id === notificationId);
        
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setStats(prev => ({
          total: prev.total - 1,
          unread: notification.lu ? prev.unread : Math.max(0, prev.unread - 1),
          read: notification.lu ? Math.max(0, prev.read - 1) : prev.read,
        }));
        
        toast.success('Notification supprimée');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteAllRead = async () => {
    if (!confirm('Voulez-vous vraiment supprimer toutes les notifications lues ?')) {
      return;
    }

    try {
      const response = await api.delete('/notifications/supprimer-lues');
      
      if (response.data.success) {
        setNotifications(prev => prev.filter(n => !n.lu));
        setStats(prev => ({
          ...prev,
          total: prev.unread,
          read: 0,
        }));
        toast.success(`${response.data.count} notifications supprimées`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'nouvelle_formation': '📚',
      'nouveau_message': '💬',
      'paiement_recu': '💰',
      'inscription_validee': '✅',
      'certificat_obtenu': '🎓',
      'nouveau_cours': '📖',
      'reponse_commentaire': '💭',
      'nouveau_membre': '👤',
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      'nouvelle_formation': 'primary',
      'nouveau_message': 'success',
      'paiement_recu': 'warning',
      'inscription_validee': 'success',
      'certificat_obtenu': 'info',
      'nouveau_cours': 'primary',
      'reponse_commentaire': 'secondary',
      'nouveau_membre': 'info',
    };
    return colors[type] || 'secondary';
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Chargement des notifications...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col lg={12}>
          {/* Header */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h4 className="mb-1">
                    <Bell size={24} className="me-2" />
                    Mes Notifications
                  </h4>
                  <p className="text-muted mb-0">
                    {stats.total} notification{stats.total > 1 ? 's' : ''} au total
                    {stats.unread > 0 && ` • ${stats.unread} non lue${stats.unread > 1 ? 's' : ''}`}
                  </p>
                </div>

                <div className="d-flex gap-2">
                  {stats.unread > 0 && (
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={handleMarkAllAsRead}
                    >
                      <Check size={16} className="me-2" />
                      Tout marquer comme lu
                    </Button>
                  )}
                  
                  {stats.read > 0 && (
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={handleDeleteAllRead}
                    >
                      <Trash2 size={16} className="me-2" />
                      Supprimer les lues
                    </Button>
                  )}
                </div>
              </div>

              {/* Filtres */}
              <div className="mt-3">
                <ButtonGroup size="sm">
                  <Button
                    variant={filter === 'all' ? 'primary' : 'outline-primary'}
                    onClick={() => setFilter('all')}
                  >
                    Toutes ({stats.total})
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'primary' : 'outline-primary'}
                    onClick={() => setFilter('unread')}
                  >
                    Non lues ({stats.unread})
                  </Button>
                  <Button
                    variant={filter === 'read' ? 'primary' : 'outline-primary'}
                    onClick={() => setFilter('read')}
                  >
                    Lues ({stats.read})
                  </Button>
                </ButtonGroup>
              </div>
            </Card.Body>
          </Card>

          {/* Liste des notifications */}
          {filteredNotifications.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <Bell size={60} className="text-muted mb-3 opacity-50" />
                <h5 className="text-muted">
                  {filter === 'unread' 
                    ? 'Aucune notification non lue' 
                    : filter === 'read'
                    ? 'Aucune notification lue'
                    : 'Aucune notification'}
                </h5>
                <p className="text-muted mb-0">
                  Vous serez notifié des nouvelles formations et messages
                </p>
              </Card.Body>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <ListGroup variant="flush">
                {filteredNotifications.map(notification => (
                  <ListGroup.Item
                    key={notification.id}
                    className={`border-0 border-bottom ${!notification.lu ? 'bg-light' : ''}`}
                  >
                    <div className="d-flex align-items-start">
                      {/* Icône */}
                      <div 
                        className={`me-3 p-3 rounded-circle bg-${getNotificationColor(notification.type)} bg-opacity-10`}
                        style={{ flexShrink: 0 }}
                      >
                        <span style={{ fontSize: '2rem' }}>
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>

                      {/* Contenu */}
                      <div 
                        className="flex-grow-1 overflow-hidden cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0 fw-semibold">
                            {notification.titre}
                          </h6>
                          {!notification.lu && (
                            <Badge 
                              bg={getNotificationColor(notification.type)}
                              className="ms-2"
                            >
                              Nouveau
                            </Badge>
                          )}
                        </div>
                        
                        <p className="mb-2 text-muted">
                          {notification.message}
                        </p>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {notification.temps_ecoule}
                          </small>
                          
                          <Button
                            variant="link"
                            size="sm"
                            className="text-danger p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default NotificationsPage;