import { useState, useEffect } from 'react';
import { Dropdown, Badge, Spinner, ListGroup } from 'react-bootstrap';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  // Charger les notifications au montage et toutes les 30 secondes
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30 secondes
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const [notifResponse, countResponse] = await Promise.all([
        api.get('/notifications/recentes'),
        api.get('/notifications/count')
      ]);

      if (notifResponse.data.success) {
        setNotifications(notifResponse.data.notifications);
      }

      if (countResponse.data.success) {
        setUnreadCount(countResponse.data.count);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Marquer comme lue
      if (!notification.lu) {
        await api.patch(`/notifications/${notification.id}/marquer-lu`);
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Naviguer vers le lien
      if (notification.lien) {
        navigate(notification.lien);
        setShow(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      const response = await api.post('/notifications/marquer-tout-lu');
      
      if (response.data.success) {
        setUnreadCount(0);
        setNotifications(prev => 
          prev.map(n => ({ ...n, lu: true, lu_at: new Date().toISOString() }))
        );
        toast.success('Toutes les notifications ont été marquées comme lues');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      
      if (response.data.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        toast.success('Notification supprimée');
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

  return (
    <Dropdown show={show} onToggle={setShow} align="end">
      <Dropdown.Toggle
        as="div"
        className="nav-link position-relative cursor-pointer"
        style={{ cursor: 'pointer' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <Badge 
            bg="danger" 
            pill 
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.65rem' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu 
        className="shadow-lg border-0" 
        style={{ width: 400, maxHeight: 500, overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <h6 className="mb-0">
            <Bell size={18} className="me-2" />
            Notifications
          </h6>
          {notifications.length > 0 && (
            <div className="d-flex gap-2">
              {unreadCount > 0 && (
                <button
                  className="btn btn-sm btn-link text-primary p-0"
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  title="Tout marquer comme lu"
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <Check size={16} />
                  )}
                </button>
              )}
              <button
                className="btn btn-sm btn-link text-muted p-0"
                onClick={() => {
                  navigate('/notifications');
                  setShow(false);
                }}
                title="Voir toutes les notifications"
              >
                Tout voir
              </button>
            </div>
          )}
        </div>

        {/* Liste des notifications */}
        {notifications.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Bell size={40} className="mb-2 opacity-50" />
            <p className="mb-0">Aucune notification</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {notifications.map(notification => (
              <ListGroup.Item
                key={notification.id}
                action
                onClick={() => handleNotificationClick(notification)}
                className={`border-0 ${!notification.lu ? 'bg-light' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-start">
                  {/* Icône */}
                  <div 
                    className={`me-3 p-2 rounded-circle bg-${getNotificationColor(notification.type)} bg-opacity-10`}
                    style={{ flexShrink: 0 }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>

                  {/* Contenu */}
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="mb-0 fw-semibold" style={{ fontSize: '0.9rem' }}>
                        {notification.titre}
                      </h6>
                      {!notification.lu && (
                        <Badge 
                          bg={getNotificationColor(notification.type)} 
                          className="ms-2"
                          style={{ fontSize: '0.6rem' }}
                        >
                          Nouveau
                        </Badge>
                      )}
                    </div>
                    
                    <p 
                      className="mb-1 text-muted" 
                      style={{ fontSize: '0.85rem' }}
                    >
                      {notification.message}
                    </p>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {notification.temps_ecoule}
                      </small>
                      
                      <button
                        className="btn btn-sm btn-link text-danger p-0"
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="text-center py-2 border-top">
            <button
              className="btn btn-sm btn-link text-primary"
              onClick={() => {
                navigate('/notifications');
                setShow(false);
              }}
            >
              Voir toutes les notifications →
            </button>
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;