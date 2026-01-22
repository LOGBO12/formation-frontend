import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Modal, ButtonGroup } from 'react-bootstrap';
import { 
  ArrowLeft, Save, Eye, Bold, Italic, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link2, Image, Code, Quote
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const EditChapitre = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chapitre, setChapitre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const editorRef = useRef(null);
  
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

  // ============ FONCTIONS DE L'ÉDITEUR RICHE ============
  
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertHeading = (level) => {
    execCommand('formatBlock', `<h${level}>`);
  };

  const insertLink = () => {
    if (linkUrl) {
      const selection = window.getSelection().toString();
      const linkText = selection || 'lien';
      const html = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-primary">${linkText}</a>`;
      execCommand('insertHTML', html);
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      const html = `<img src="${imageUrl}" class="img-fluid my-3 rounded" style="max-width: 100%;" alt="Image" />`;
      execCommand('insertHTML', html);
      setImageUrl('');
      setShowImageModal(false);
    }
  };

  const insertCodeBlock = () => {
    const html = `<pre class="bg-light p-3 rounded border my-3"><code contenteditable="true">// Votre code ici</code></pre>`;
    execCommand('insertHTML', html);
  };

  const insertQuote = () => {
    const html = `<blockquote class="border-start border-primary border-4 ps-3 py-2 my-3 bg-light"><p contenteditable="true">Votre citation...</p></blockquote>`;
    execCommand('insertHTML', html);
  };

  const insertTable = () => {
    const html = `
      <table class="table table-bordered my-3">
        <thead><tr>
          <th contenteditable="true">En-tête 1</th>
          <th contenteditable="true">En-tête 2</th>
        </tr></thead>
        <tbody><tr>
          <td contenteditable="true">Cellule 1</td>
          <td contenteditable="true">Cellule 2</td>
        </tr></tbody>
      </table>
    `;
    execCommand('insertHTML', html);
  };

  // ============ FIN FONCTIONS ÉDITEUR ============

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append('titre', formData.titre);
    data.append('description', formData.description || '');
    data.append('type', formData.type);
    data.append('is_preview', formData.is_preview ? '1' : '0');

    if (formData.type === 'texte') {
      // Récupérer le HTML de l'éditeur
      const htmlContent = editorRef.current?.innerHTML || formData.contenu;
      data.append('contenu', htmlContent);
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

  const ToolButton = ({ onClick, title, icon: Icon }) => (
    <Button
      variant="outline-secondary"
      size="sm"
      onClick={onClick}
      title={title}
      className="p-2"
    >
      <Icon size={18} />
    </Button>
  );

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
                <Button variant="outline-primary" onClick={() => setShowPreview(!showPreview)}>
                  <Eye size={18} className="me-2" />
                  {showPreview ? 'Éditer' : 'Prévisualiser'}
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
                <>
                  {/* ========= BARRE D'OUTILS DE L'ÉDITEUR RICHE ========= */}
                  <Card className="mb-3">
                    <Card.Body className="p-2">
                      <div className="d-flex flex-wrap gap-2">
                        {/* Titres */}
                        <div className="btn-group">
                          <Button variant="outline-secondary" size="sm" onClick={() => insertHeading(1)} title="Titre 1">H1</Button>
                          <Button variant="outline-secondary" size="sm" onClick={() => insertHeading(2)} title="Titre 2">H2</Button>
                          <Button variant="outline-secondary" size="sm" onClick={() => insertHeading(3)} title="Titre 3">H3</Button>
                        </div>

                        {/* Formatage */}
                        <div className="btn-group">
                          <ToolButton onClick={() => execCommand('bold')} title="Gras" icon={Bold} />
                          <ToolButton onClick={() => execCommand('italic')} title="Italique" icon={Italic} />
                        </div>

                        {/* Listes */}
                        <div className="btn-group">
                          <ToolButton onClick={() => execCommand('insertUnorderedList')} title="Liste à puces" icon={List} />
                          <ToolButton onClick={() => execCommand('insertOrderedList')} title="Liste numérotée" icon={ListOrdered} />
                        </div>

                        {/* Alignement */}
                        <div className="btn-group">
                          <ToolButton onClick={() => execCommand('justifyLeft')} title="Aligner à gauche" icon={AlignLeft} />
                          <ToolButton onClick={() => execCommand('justifyCenter')} title="Centrer" icon={AlignCenter} />
                          <ToolButton onClick={() => execCommand('justifyRight')} title="Aligner à droite" icon={AlignRight} />
                        </div>

                        {/* Éléments spéciaux */}
                        <div className="btn-group">
                          <ToolButton onClick={() => setShowLinkModal(true)} title="Lien" icon={Link2} />
                          <ToolButton onClick={() => setShowImageModal(true)} title="Image" icon={Image} />
                          <ToolButton onClick={insertCodeBlock} title="Code" icon={Code} />
                          <ToolButton onClick={insertQuote} title="Citation" icon={Quote} />
                        </div>

                        {/* Tableau */}
                        <Button size="sm" variant="outline-secondary" onClick={insertTable}>
                          Tableau
                        </Button>
                        
                        {/* Effacer formatage */}
                        <Button size="sm" variant="outline-secondary" onClick={() => execCommand('removeFormat')}>
                          Effacer format
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                  {/* ========= FIN BARRE D'OUTILS ========= */}

                  {/* Zone d'édition */}
                  <Form.Group className="mb-3">
                    <Form.Label>Contenu</Form.Label>
                    {!showPreview ? (
                      <div
                        ref={editorRef}
                        contentEditable
                        className="form-control editor-content"
                        style={{
                          minHeight: '400px',
                          maxHeight: '600px',
                          overflowY: 'auto',
                          lineHeight: '1.8',
                          fontSize: '16px',
                          padding: '20px'
                        }}
                        dangerouslySetInnerHTML={{ __html: formData.contenu }}
                        onInput={(e) => setFormData({ ...formData, contenu: e.currentTarget.innerHTML })}
                      />
                    ) : (
                      <div 
                        className="border rounded p-4 preview-content"
                        style={{
                          minHeight: '400px',
                          lineHeight: '1.8',
                          fontSize: '16px',
                          backgroundColor: '#f8f9fa'
                        }}
                        dangerouslySetInnerHTML={{ __html: formData.contenu }}
                      />
                    )}
                  </Form.Group>
                </>
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
                  label="Aperçu gratuit (visible avant inscription)"
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

      {/* Modal pour liens */}
      <Modal show={showLinkModal} onHide={() => setShowLinkModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Insérer un lien</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>URL du lien</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://exemple.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && insertLink()}
            />
            <Form.Text className="text-muted">
              Sélectionnez du texte avant d'insérer le lien
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLinkModal(false)}>Annuler</Button>
          <Button variant="primary" onClick={insertLink}>Insérer</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour images */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Insérer une image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>URL de l'image</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://exemple.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && insertImage()}
            />
            <Form.Text className="text-muted">
              L'image sera automatiquement redimensionnée
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>Annuler</Button>
          <Button variant="primary" onClick={insertImage}>Insérer</Button>
        </Modal.Footer>
      </Modal>

      {/* Styles CSS pour l'éditeur */}
      <style>{`
        .editor-content {
          outline: none;
        }
        .editor-content:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        .editor-content h1,
        .preview-content h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem;
        }
        .editor-content h2,
        .preview-content h2 {
          font-size: 2rem;
          font-weight: 600;
          margin: 1.5rem 0 1rem;
        }
        .editor-content h3,
        .preview-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.5rem 0 1rem;
        }
        .editor-content p,
        .preview-content p {
          margin-bottom: 1rem;
        }
        .editor-content pre,
        .preview-content pre {
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
        }
        .editor-content blockquote,
        .preview-content blockquote {
          border-left: 4px solid #0d6efd;
          padding-left: 1rem;
          margin: 1rem 0;
        }
        .editor-content img,
        .preview-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 1rem 0;
        }
        .editor-content table,
        .preview-content table {
          width: 100%;
          margin: 1rem 0;
        }
        .editor-content table th,
        .editor-content table td,
        .preview-content table th,
        .preview-content table td {
          padding: 0.75rem;
          border: 1px solid #dee2e6;
        }
        .editor-content table th,
        .preview-content table th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default EditChapitre;