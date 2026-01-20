import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Modal, Form, Table, Badge } from 'react-bootstrap';
import { ArrowLeft, Plus, Edit, Trash2, Video, FileText, File, HelpCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ManageModule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [chapitres, setChapitres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChapitreModal, setShowChapitreModal] = useState(false);
  const [newChapitre, setNewChapitre] = useState({
    titre: '',
    description: '',
    type: 'texte',
    contenu: '',
    duree: '',
    fichier: null,
    is_preview: false,
  });

  useEffect(() => {
    fetchModule();
  }, [id]);

  const fetchModule = async () => {
    try {
      const [moduleRes, chapitresRes] = await Promise.all([
        api.get(`/modules/${id}`),
        api.get(`/modules/${id}/chapitres`),
      ]);

      setModule(moduleRes.data.module);
      setChapitres(chapitresRes.data.chapitres);
    } catch (error) {
      toast.error('Erreur lors du chargement');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChapitre = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('titre', newChapitre.titre);
    formData.append('description', newChapitre.description || '');
    formData.append('type', newChapitre.type);
    formData.append('is_preview', newChapitre.is_preview ? '1' : '0');

    if (newChapitre.type === 'texte') {
      formData.append('contenu', newChapitre.contenu);
    } else if (newChapitre.fichier) {
      formData.append('fichier', newChapitre.fichier);
    }

    if (newChapitre.duree) {
      formData.append('duree', newChapitre.duree);
    }

    try {
      await api.post(`/modules/${id}/chapitres`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Chapitre créé avec succès');
      setShowChapitreModal(false);
      resetForm();
      fetchModule();
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleDeleteChapitre = async (chapitreId) => {
    if (!window.confirm('Supprimer ce chapitre ?')) return;

    try {
      await api.delete(`/chapitres/${chapitreId}`);
      toast.success('Chapitre supprimé');
      fetchModule();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setNewChapitre({
      titre: '',
      description: '',
      type: 'texte',
      contenu: '',
      duree: '',
      fichier: null,
      is_preview: false,
    });
  };

  const getTypeIcon = (type) => {
    const icons = {
      video: <Video size={18} />,
      pdf: <File size={18} />,
      texte: <FileText size={18} />,
      quiz: <HelpCircle size={18} />,
    };
    return icons[type] || <FileText size={18} />;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-success shadow-sm">
        <Container fluid>
          <Button variant="link" className="text-white" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} className="me-2" />
            Retour
          </Button>
          <span className="navbar-brand mb-0 h1">{module.titre}</span>
          <div style={{ width: 100 }}></div>
        </Container>
      </nav>

      <Container className="py-4">
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">{module.titre}</h5>
              {module.description && <small className="text-muted">{module.description}</small>}
            </div>
            <Button variant="success" onClick={() => setShowChapitreModal(true)}>
              <Plus size={18} className="me-2" />
              Ajouter un chapitre
            </Button>
          </Card.Header>
          <Card.Body>
            {chapitres.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">Aucun chapitre. Ajoutez-en un pour commencer !</p>
              </div>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Titre</th>
                    <th>Type</th>
                    <th>Durée</th>
                    <th>Aperçu</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {chapitres.map((chapitre, index) => (
                    <tr key={chapitre.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getTypeIcon(chapitre.type)}
                          <span className="ms-2">{chapitre.titre}</span>
                        </div>
                      </td>
                      <td>
                        <Badge bg="info">{chapitre.type}</Badge>
                      </td>
                      <td>{chapitre.duree ? `${chapitre.duree} min` : '-'}</td>
                      <td>
                        {chapitre.is_preview ? (
                          <Badge bg="success">Oui</Badge>
                        ) : (
                          <Badge bg="secondary">Non</Badge>
                        )}
                      </td>
                    <td>
  {chapitre.type === 'quiz' ? (
    <>
      <Button 
        variant="outline-success" 
        size="sm" 
        className="me-2"
        onClick={() => navigate(`/formateur/quiz/${chapitre.id}`)}
        title="Gérer le quiz"
      >
        <HelpCircle size={16} />
      </Button>
      <Button 
        variant="outline-primary" 
        size="sm" 
        className="me-2"
        onClick={() => navigate(`/formateur/chapitres/${chapitre.id}/edit`)}
        title="Modifier le chapitre"
      >
        <Edit size={16} />
      </Button>
    </>
  ) : (
    <Button 
      variant="outline-primary" 
      size="sm" 
      className="me-2"
      onClick={() => navigate(`/formateur/chapitres/${chapitre.id}/edit`)}
      title="Modifier le chapitre"
    >
      <Edit size={16} />
    </Button>
  )}
  <Button 
    variant="outline-danger" 
    size="sm"
    onClick={() => handleDeleteChapitre(chapitre.id)}
    title="Supprimer le chapitre"
  >
    <Trash2 size={16} />
  </Button>
</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Modal Nouveau Chapitre */}
      <Modal show={showChapitreModal} onHide={() => { setShowChapitreModal(false); resetForm(); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nouveau Chapitre</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateChapitre}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Titre *</Form.Label>
              <Form.Control
                type="text"
                value={newChapitre.titre}
                onChange={(e) => setNewChapitre({ ...newChapitre, titre: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newChapitre.description}
                onChange={(e) => setNewChapitre({ ...newChapitre, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type de contenu *</Form.Label>
              <Form.Select
                value={newChapitre.type}
                onChange={(e) => setNewChapitre({ ...newChapitre, type: e.target.value })}
              >
                <option value="texte">Texte</option>
                <option value="video">Vidéo</option>
                <option value="pdf">PDF</option>
                <option value="quiz">Quiz</option>
              </Form.Select>
            </Form.Group>

            {newChapitre.type === 'texte' && (
              <Form.Group className="mb-3">
                <Form.Label>Contenu texte</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={newChapitre.contenu}
                  onChange={(e) => setNewChapitre({ ...newChapitre, contenu: e.target.value })}
                />
              </Form.Group>
            )}

            {(newChapitre.type === 'video' || newChapitre.type === 'pdf') && (
              <Form.Group className="mb-3">
                <Form.Label>Fichier *</Form.Label>
                <Form.Control
                  type="file"
                  accept={newChapitre.type === 'video' ? 'video/*' : 'application/pdf'}
                  onChange={(e) => setNewChapitre({ ...newChapitre, fichier: e.target.files[0] })}
                  required
                />
                <Form.Text className="text-muted">
                  Max 50MB
                </Form.Text>
              </Form.Group>
            )}

            {newChapitre.type === 'quiz' && (
              <p className="text-muted">
                Le quiz sera créé après la création du chapitre
              </p>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Durée (minutes)</Form.Label>
              <Form.Control
                type="number"
                value={newChapitre.duree}
                onChange={(e) => setNewChapitre({ ...newChapitre, duree: e.target.value })}
                min="1"
              />
            </Form.Group>

            <Form.Group>
              <Form.Check
                type="checkbox"
                label="Aperçu gratuit (visible avant achat)"
                checked={newChapitre.is_preview}
                onChange={(e) => setNewChapitre({ ...newChapitre, is_preview: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowChapitreModal(false); resetForm(); }}>
              Annuler
            </Button>
            <Button variant="success" type="submit">
              Créer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageModule;