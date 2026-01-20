import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Modal, ButtonGroup } from 'react-bootstrap';
import { ArrowLeft, Save, Eye, Bold, Italic, List, Link as LinkIcon } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const EditChapitre = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chapitre, setChapitre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: 'texte',
    contenu: '',
    duree: '',
    is_preview: false,
    fichier: null,
  });

  useEffect(() => {
    fetchChapitre();
  }, [id]);

  const fetchChapitre = async () => {
    try {
      const response = await api.get(`/chapitres/${id}`);
      const chap = response.data.chapitre;
      setChapitre(chap);
      
      setFormData({
        titre: chap.titre,
        description: chap.description || '',
        type: chap.type,
        contenu: chap.contenu || '',
        duree: chap.duree || '',
        is_preview: chap.is_preview,
        fichier: null,
      });
    } catch (error) {
      toast.error('Erreur lors du chargement');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const insertFormatting = (before, after = '') => {
    const textarea = document.getElementById('contenu-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.contenu.substring(start, end);
    const newText = formData.contenu.substring(0, start) + before + selectedText + after + formData.contenu.substring(end);
    
    setFormData({ ...formData, contenu: newText });
    
    // Repositionner le curseur
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, label: 'Gras', before: '<strong>', after: '</strong>' },
    { icon: Italic, label: 'Italique', before: '<em>', after: '</em>' },
    { icon: List, label: 'Liste', before: '<ul>\n<li>', after: '</li>\n</ul>' },
    { icon: LinkIcon, label: 'Lien', before: '<a href="URL">', after: '</a>' },
  ];

  const insertHeading = (level) => {
    insertFormatting(`<h${level}>`, `</h${level}>`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append('titre', formData.titre);
    data.append('description', formData.description || '');
    data.append('type', formData.type);
    data.append('is_preview', formData.is_preview ? '1' : '0');

    if (formData.type === 'texte') {
      data.append('contenu', formData.contenu);
    } else if (formData.fichier) {
      data.append('fichier', formData.fichier);
    }

    if (formData.duree) {
      data.append('duree', formData.duree);
    }

    try {
      await api.post(`/chapitres/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Chapitre mis à jour !');
      navigate(-1);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
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
          <span className="navbar-brand mb-0 h1">Modifier le chapitre</span>
          <div style={{ width: 100 }}></div>
        </Container>
      </nav>

      <Container className="py-4">
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>Modification : {chapitre.titre}</h4>
              {formData.type === 'texte' && (
                <Button variant="outline-primary" onClick={() => setShowPreview(true)}>
                  <Eye size={18} className="me-2" />
                  Prévisualiser
                </Button>
              )}
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Titre *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Form.Group>

              {formData.type === 'texte' && (
                <Form.Group className="mb-3">
                  <Form.Label>Contenu</Form.Label>
                  
                  {/* Barre d'outils de formatage */}
                  <div className="mb-2 p-2 bg-light border rounded">
                    <ButtonGroup className="me-2 mb-2">
                      <Button variant="outline-secondary" size="sm" onClick={() => insertHeading(1)} title="Titre 1">
                        H1
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => insertHeading(2)} title="Titre 2">
                        H2
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => insertHeading(3)} title="Titre 3">
                        H3
                      </Button>
                    </ButtonGroup>
                    
                    <ButtonGroup className="mb-2">
                      {formatButtons.map((btn, idx) => (
                        <Button
                          key={idx}
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => insertFormatting(btn.before, btn.after)}
                          title={btn.label}
                        >
                          <btn.icon size={16} />
                        </Button>
                      ))}
                    </ButtonGroup>
                    
                    <div className="mt-2">
                      <small className="text-muted">
                        Sélectionnez du texte et cliquez sur un bouton pour le formatter
                      </small>
                    </div>
                  </div>

                  <Form.Control
                    id="contenu-textarea"
                    as="textarea"
                    rows={15}
                    value={formData.contenu}
                    onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                    placeholder="Écrivez votre contenu ici. Vous pouvez utiliser du HTML..."
                    style={{ fontFamily: 'monospace', fontSize: '14px' }}
                  />
                  <Form.Text className="text-muted">
                    Vous pouvez utiliser du HTML : &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;, etc.
                  </Form.Text>
                </Form.Group>
              )}

              {(formData.type === 'video' || formData.type === 'pdf') && (
                <Form.Group className="mb-3">
                  <Form.Label>Remplacer le fichier (optionnel)</Form.Label>
                  <Form.Control
                    type="file"
                    accept={formData.type === 'video' ? 'video/*' : 'application/pdf'}
                    onChange={(e) => setFormData({ ...formData, fichier: e.target.files[0] })}
                  />
                  <Form.Text className="text-muted">
                    Fichier actuel : {chapitre.contenu}
                  </Form.Text>
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Durée (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.duree}
                  onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                  min="1"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  label="Aperçu gratuit (visible avant achat)"
                  checked={formData.is_preview}
                  onChange={(e) => setFormData({ ...formData, is_preview: e.target.checked })}
                />
              </Form.Group>

              <div className="d-flex justify-content-between">
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                  Annuler
                </Button>
                <Button variant="success" type="submit" disabled={saving}>
                  <Save size={18} className="me-2" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      {/* Modal Prévisualisation */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Prévisualisation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>{formData.titre}</h3>
          {formData.description && <p className="text-muted">{formData.description}</p>}
          <hr />
          <div dangerouslySetInnerHTML={{ __html: formData.contenu }} style={{ lineHeight: '1.6' }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EditChapitre;