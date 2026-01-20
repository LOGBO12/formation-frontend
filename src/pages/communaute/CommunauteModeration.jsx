import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Table, Badge, Modal, Alert } from 'react-bootstrap';
import { ArrowLeft, UserX, UserCheck, Shield, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CommunauteModeration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [communaute, setCommunaute] = useState(null);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [communauteRes, membresRes] = await Promise.all([
        api.get(`/communautes/${id}`),
        api.get(`/communautes/${id}/membres`),
      ]);

      setCommunaute(communauteRes.data.communaute);
      setMembres(membresRes.data.membres);
    } catch (error) {
      toast.error('Erreur lors du chargement');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleMuteToggle = async (userId, isMuted) => {
    try {
      const endpoint = isMuted 
        ? `/communautes/${id}/membres/${userId}/demuter`
        : `/communautes/${id}/membres/${userId}/muter`;
      
      await api.post(endpoint);
      toast.success(isMuted ? 'Membre démuté' : 'Membre muté');
      fetchData();
      setShowConfirmModal(false);
      setActionTarget(null);
    } catch (error) {
      toast.error('Erreur lors de l\'action');
    }
  };

  const openConfirmModal = (membre, action) => {
    setActionTarget({ membre, action });
    setShowConfirmModal(true);
  };

  const getMembersStats = () => {
    const total = membres.length;
    const muted = membres.filter(m => m.pivot.is_muted).length;
    const admins = membres.filter(m => m.pivot.role === 'admin').length;
    
    return { total, muted, admins };
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  const stats = getMembersStats();

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-danger shadow-sm">
        <Container fluid>
          <Button variant="link" className="text-white" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} className="me-2" />
            Retour à la communauté
          </Button>
          <span className="navbar-brand mb-0 h1">
            <Shield size={24} className="me-2" />
            Modération
          </span>
          <div style={{ width: 100 }}></div>
        </Container>
      </nav>

      <Container className="py-4">
        {/* Alerte info */}
        <Alert variant="warning" className="mb-4">
          <AlertTriangle size={20} className="me-2" />
          <strong>Zone de modération :</strong> Les actions effectuées ici affectent directement les membres de la communauté.
        </Alert>

        {/* Stats */}
        <div className="row mb-4">
          <div className="col-md-4">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h3 className="mb-1">{stats.total}</h3>
                <small className="text-muted">Total membres</small>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h3 className="mb-1 text-success">{stats.admins}</h3>
                <small className="text-muted">Formateurs</small>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h3 className="mb-1 text-danger">{stats.muted}</h3>
                <small className="text-muted">Membres mutés</small>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Liste des membres */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white">
            <h5 className="mb-0">Gestion des membres</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Inscrit le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {membres.map(membre => (
                  <tr key={membre.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div 
                          className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3"
                          style={{ width: 40, height: 40 }}
                        >
                          {membre.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{membre.name}</strong>
                          <div className="text-muted small">{membre.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {membre.pivot.role === 'admin' ? (
                        <Badge bg="success">
                          <Shield size={14} className="me-1" />
                          Formateur
                        </Badge>
                      ) : (
                        <Badge bg="secondary">Membre</Badge>
                      )}
                    </td>
                    <td>
                      {membre.pivot.is_muted ? (
                        <Badge bg="danger">
                          <UserX size={14} className="me-1" />
                          Muté
                        </Badge>
                      ) : (
                        <Badge bg="success">
                          <UserCheck size={14} className="me-1" />
                          Actif
                        </Badge>
                      )}
                    </td>
                    <td>
                      {new Date(membre.pivot.joined_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      {membre.pivot.role !== 'admin' && (
                        <Button
                          variant={membre.pivot.is_muted ? "outline-success" : "outline-danger"}
                          size="sm"
                          onClick={() => openConfirmModal(membre, membre.pivot.is_muted ? 'unmute' : 'mute')}
                        >
                          {membre.pivot.is_muted ? (
                            <>
                              <UserCheck size={16} className="me-1" />
                              Démuter
                            </>
                          ) : (
                            <>
                              <UserX size={16} className="me-1" />
                              Muter
                            </>
                          )}
                        </Button>
                      )}
                      {membre.pivot.role === 'admin' && (
                        <span className="text-muted small">Formateur protégé</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Informations */}
        <Card className="border-0 shadow-sm mt-4">
          <Card.Header className="bg-white">
            <h6 className="mb-0">ℹ️ Informations</h6>
          </Card.Header>
          <Card.Body>
            <ul className="mb-0">
              <li className="mb-2">
                <strong>Muter un membre :</strong> Il ne pourra plus envoyer de messages mais pourra toujours consulter la communauté.
              </li>
              <li className="mb-2">
                <strong>Démuter un membre :</strong> Lui redonne la permission d'envoyer des messages.
              </li>
              <li className="mb-0">
                <strong>Formateurs :</strong> Les formateurs ne peuvent pas être mutés et ont tous les droits de modération.
              </li>
            </ul>
          </Card.Body>
        </Card>
      </Container>

      {/* Modal de confirmation */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer l'action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionTarget && (
            <div>
              <p>
                Êtes-vous sûr de vouloir{' '}
                <strong>
                  {actionTarget.action === 'mute' ? 'muter' : 'démuter'}
                </strong>{' '}
                le membre <strong>{actionTarget.membre.name}</strong> ?
              </p>
              {actionTarget.action === 'mute' && (
                <Alert variant="warning" className="mb-0">
                  Cette personne ne pourra plus envoyer de messages dans la communauté.
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Annuler
          </Button>
          <Button
            variant={actionTarget?.action === 'mute' ? 'danger' : 'success'}
            onClick={() => handleMuteToggle(
              actionTarget.membre.id,
              actionTarget.action === 'unmute'
            )}
          >
            Confirmer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CommunauteModeration;