import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Modal, Form, Table, Badge, Alert } from 'react-bootstrap';
import { 
  ArrowLeft, Plus, Edit, Trash2, Video, FileText, File, HelpCircle,
  Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Link2, Image, Code, Quote, Eye, Save, X, Play, FileUp
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ManageModule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [chapitres, setChapitres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChapitreModal, setShowChapitreModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const editorRef = useRef(null);
  
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

  // ============ GESTION DES FICHIERS ============

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewChapitre({ ...newChapitre, fichier: file });

    // Créer une URL de prévisualisation
    if (newChapitre.type === 'video') {
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    } else if (newChapitre.type === 'pdf') {
      const url = URL.createObjectURL(file);
      setPdfPreviewUrl(url);
    }
  };

  // ============ CRÉATION DU CHAPITRE ============

  const handleCreateChapitre = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('titre', newChapitre.titre);
    formData.append('description', newChapitre.description || '');
    formData.append('type', newChapitre.type);
    formData.append('is_preview', newChapitre.is_preview ? '1' : '0');

    if (newChapitre.type === 'texte') {
      const htmlContent = editorRef.current?.innerHTML || newChapitre.contenu;
      formData.append('contenu', htmlContent);
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
    setShowPreview(false);
    setVideoPreviewUrl('');
    setPdfPreviewUrl('');
    setLinkUrl('');
    setImageUrl('');
  };

  const getTypeIcon = (type) => {
    const icons = {
      video: <Video size={18} className="text-danger" />,
      pdf: <File size={18} className="text-warning" />,
      texte: <FileText size={18} className="text-primary" />,
      quiz: <HelpCircle size={18} className="text-success" />,
    };
    return icons[type] || <FileText size={18} />;
  };

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
                <FileText size={64} className="text-muted mb-3 opacity-50" />
                <h5 className="text-muted mb-3">Aucun chapitre</h5>
                <p className="text-muted mb-4">Commencez par créer votre premier chapitre</p>
                <Button variant="success" onClick={() => setShowChapitreModal(true)}>
                  <Plus size={18} className="me-2" />
                  Créer un chapitre
                </Button>
              </div>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th>Titre</th>
                    <th style={{ width: '120px' }}>Type</th>
                    <th style={{ width: '100px' }}>Durée</th>
                    <th style={{ width: '100px' }}>Aperçu</th>
                    <th style={{ width: '150px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {chapitres.map((chapitre, index) => (
                    <tr key={chapitre.id}>
                      <td className="text-center">
                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 30, height: 30 }}>
                          <strong className="small">{index + 1}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getTypeIcon(chapitre.type)}
                          <span className="ms-2 fw-semibold">{chapitre.titre}</span>
                        </div>
                        {chapitre.description && (
                          <small className="text-muted d-block mt-1">{chapitre.description}</small>
                        )}
                      </td>
                      <td>
                        <Badge bg="info" className="text-capitalize">{chapitre.type}</Badge>
                      </td>
                      <td>{chapitre.duree ? `${chapitre.duree} min` : '-'}</td>
                      <td>
                        {chapitre.is_preview ? (
                          <Badge bg="success">Gratuit</Badge>
                        ) : (
                          <Badge bg="secondary">Payant</Badge>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {chapitre.type === 'quiz' && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => navigate(`/formateur/quiz/${chapitre.id}`)}
                              title="Gérer le quiz"
                            >
                              <HelpCircle size={16} />
                            </Button>
                          )}
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => navigate(`/formateur/chapitres/${chapitre.id}/edit`)}
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteChapitre(chapitre.id)}
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* ========== MODAL DE CRÉATION AMÉLIORÉ ========== */}
      <Modal 
        show={showChapitreModal} 
        onHide={() => { setShowChapitreModal(false); resetForm(); }} 
        size="xl"
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <Plus size={24} className="me-2" />
            Créer un nouveau chapitre
          </Modal.Title>
        </Modal.Header>
        
        <Form onSubmit={handleCreateChapitre}>
          <Modal.Body style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            {/* Informations de base */}
            <Card className="mb-3 border-0 shadow-sm">
              <Card.Header className="bg-light">
                <h6 className="mb-0">📋 Informations générales</h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Titre du chapitre *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ex: Introduction à React"
                    value={newChapitre.titre}
                    onChange={(e) => setNewChapitre({ ...newChapitre, titre: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description (optionnelle)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Brève description du contenu de ce chapitre"
                    value={newChapitre.description}
                    onChange={(e) => setNewChapitre({ ...newChapitre, description: e.target.value })}
                  />
                </Form.Group>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Type de contenu *</Form.Label>
                      <Form.Select
                        value={newChapitre.type}
                        onChange={(e) => {
                          setNewChapitre({ ...newChapitre, type: e.target.value });
                          setVideoPreviewUrl('');
                          setPdfPreviewUrl('');
                        }}
                      >
                        <option value="texte">📝 Texte / Article</option>
                        <option value="video">🎥 Vidéo</option>
                        <option value="pdf">📄 Document PDF</option>
                        <option value="quiz">❓ Quiz</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Durée estimée (minutes)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Ex: 15"
                        value={newChapitre.duree}
                        onChange={(e) => setNewChapitre({ ...newChapitre, duree: e.target.value })}
                        min="1"
                      />
                    </Form.Group>
                  </div>
                </div>

                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="🎁 Aperçu gratuit (visible avant inscription)"
                    checked={newChapitre.is_preview}
                    onChange={(e) => setNewChapitre({ ...newChapitre, is_preview: e.target.checked })}
                  />
                  <Form.Text className="text-muted">
                    Cochez cette case pour permettre aux visiteurs de voir ce chapitre gratuitement
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Contenu selon le type */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">✏️ Contenu du chapitre</h6>
                  {newChapitre.type === 'texte' && (
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      <Eye size={16} className="me-1" />
                      {showPreview ? 'Éditer' : 'Prévisualiser'}
                    </Button>
                  )}
                </div>
              </Card.Header>
              <Card.Body>
                {/* TYPE: TEXTE */}
                {newChapitre.type === 'texte' && (
                  <>
                    {!showPreview && (
                      <>
                        {/* Barre d'outils */}
                        <Card className="mb-3 border">
                          <Card.Body className="p-2">
                            <div className="d-flex flex-wrap gap-2">
                              <div className="btn-group">
                                <Button variant="outline-secondary" size="sm" onClick={() => insertHeading(1)} title="Titre 1">H1</Button>
                                <Button variant="outline-secondary" size="sm" onClick={() => insertHeading(2)} title="Titre 2">H2</Button>
                                <Button variant="outline-secondary" size="sm" onClick={() => insertHeading(3)} title="Titre 3">H3</Button>
                              </div>

                              <div className="btn-group">
                                <ToolButton onClick={() => execCommand('bold')} title="Gras" icon={Bold} />
                                <ToolButton onClick={() => execCommand('italic')} title="Italique" icon={Italic} />
                              </div>

                              <div className="btn-group">
                                <ToolButton onClick={() => execCommand('insertUnorderedList')} title="Liste à puces" icon={List} />
                                <ToolButton onClick={() => execCommand('insertOrderedList')} title="Liste numérotée" icon={ListOrdered} />
                              </div>

                              <div className="btn-group">
                                <ToolButton onClick={() => execCommand('justifyLeft')} title="Aligner à gauche" icon={AlignLeft} />
                                <ToolButton onClick={() => execCommand('justifyCenter')} title="Centrer" icon={AlignCenter} />
                                <ToolButton onClick={() => execCommand('justifyRight')} title="Aligner à droite" icon={AlignRight} />
                              </div>

                              <div className="btn-group">
                                <ToolButton onClick={() => setShowLinkModal(true)} title="Lien" icon={Link2} />
                                <ToolButton onClick={() => setShowImageModal(true)} title="Image" icon={Image} />
                                <ToolButton onClick={insertCodeBlock} title="Code" icon={Code} />
                                <ToolButton onClick={insertQuote} title="Citation" icon={Quote} />
                              </div>

                              <Button size="sm" variant="outline-secondary" onClick={insertTable}>
                                Tableau
                              </Button>
                              <Button size="sm" variant="outline-secondary" onClick={() => execCommand('removeFormat')}>
                                Effacer format
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>

                       

{/* Zone d'édition - CORRECTION DU BUG */}
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
  suppressContentEditableWarning
  onInput={(e) => {
    // Sauvegarder la position du curseur
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const offset = range.startOffset;
    const container = range.startContainer;
    
    // Mettre à jour le contenu
    setNewChapitre({ ...newChapitre, contenu: e.currentTarget.innerHTML });
    
    // Restaurer la position du curseur après le prochain render
    setTimeout(() => {
      try {
        if (container.parentNode) {
          const newRange = document.createRange();
          newRange.setStart(container, Math.min(offset, container.length));
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } catch (err) {
        // Si la restauration échoue, on ignore silencieusement
      }
    }, 0);
  }}
>
  {!newChapitre.contenu && (
    <span className="text-muted" style={{ pointerEvents: 'none', position: 'absolute' }}>
      Commencez à écrire votre contenu ici...
    </span>
  )}
</div>
                      </>
                    )}

                    {showPreview && (
                      <div 
                        className="border rounded p-4 preview-content"
                        style={{
                          minHeight: '400px',
                          lineHeight: '1.8',
                          fontSize: '16px',
                          backgroundColor: '#f8f9fa'
                        }}
                      >
                        <h2 className="mb-3">{newChapitre.titre || "Titre du chapitre"}</h2>
                        {newChapitre.description && (
                          <p className="text-muted mb-4">{newChapitre.description}</p>
                        )}
                        <hr />
                        <div dangerouslySetInnerHTML={{ __html: newChapitre.contenu || '<p class="text-muted">Aucun contenu pour le moment...</p>' }} />
                      </div>
                    )}
                  </>
                )}

                {/* TYPE: VIDEO */}
                {newChapitre.type === 'video' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FileUp size={18} className="me-2" />
                        Télécharger une vidéo *
                      </Form.Label>
                      <Form.Control
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        required
                      />
                      <Form.Text className="text-muted">
                        Formats acceptés : MP4, AVI, MOV, etc. (Max 100MB)
                      </Form.Text>
                    </Form.Group>

                    {videoPreviewUrl && (
                      <Alert variant="success" className="d-flex align-items-center">
                        <Play size={20} className="me-2" />
                        <div className="flex-grow-1">
                          <strong>Prévisualisation de la vidéo</strong>
                          <video 
                            src={videoPreviewUrl} 
                            controls 
                            className="w-100 mt-2 rounded"
                            style={{ maxHeight: '400px' }}
                          />
                        </div>
                      </Alert>
                    )}

                    {!newChapitre.fichier && (
                      <Alert variant="info">
                        <strong>💡 Astuce :</strong> Assurez-vous que votre vidéo est optimisée pour le web. 
                        Utilisez un format MP4 avec codec H.264 pour une meilleure compatibilité.
                      </Alert>
                    )}
                  </>
                )}

                {/* TYPE: PDF */}
                {newChapitre.type === 'pdf' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FileUp size={18} className="me-2" />
                        Télécharger un document PDF *
                      </Form.Label>
                      <Form.Control
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        required
                      />
                      <Form.Text className="text-muted">
                        Format accepté : PDF uniquement (Max 50MB)
                      </Form.Text>
                    </Form.Group>

                    {pdfPreviewUrl && (
                      <Alert variant="success" className="d-flex align-items-center">
                        <File size={20} className="me-2" />
                        <div className="flex-grow-1">
                          <strong>Document PDF sélectionné</strong>
                          <div className="mt-2">
                            <iframe 
                              src={pdfPreviewUrl} 
                              className="w-100 border rounded"
                              style={{ height: '500px' }}
                              title="Prévisualisation PDF"
                            />
                          </div>
                        </div>
                      </Alert>
                    )}

                    {!newChapitre.fichier && (
                      <Alert variant="info">
                        <strong>💡 Astuce :</strong> Privilégiez des PDF légers et optimisés. 
                        Évitez les documents trop volumineux qui pourraient ralentir le chargement.
                      </Alert>
                    )}
                  </>
                )}

                {/* TYPE: QUIZ */}
                {newChapitre.type === 'quiz' && (
                  <Alert variant="info">
                    <HelpCircle size={24} className="me-2" />
                    <div>
                      <strong>Création du quiz</strong>
                      <p className="mb-2 mt-2">
                        Le quiz sera créé après la création du chapitre. 
                        Vous pourrez ensuite ajouter des questions et configurer les paramètres du quiz.
                      </p>
                      <ul className="mb-0">
                        <li>Créez d'abord ce chapitre</li>
                        <li>Ensuite, cliquez sur l'icône quiz pour le configurer</li>
                        <li>Ajoutez vos questions et leurs options de réponse</li>
                      </ul>
                    </div>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Modal.Body>

          <Modal.Footer className="bg-light">
            <Button variant="outline-secondary" onClick={() => { setShowChapitreModal(false); resetForm(); }}>
              <X size={18} className="me-1" />
              Annuler
            </Button>
            <Button variant="success" type="submit">
              <Save size={18} className="me-1" />
              Créer le chapitre
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Lien */}
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

      {/* Modal Image */}
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

      {/* Styles CSS */}
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
        }/*
        .editor-content pre,
        .preview-content pre {
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;        .editor-content pre,
        .preview-content pre {
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          border: 1px solid #dee2e6;
          margin: 1rem 0;
        }
        .editor-content code,
        .preview-content code {
          background-color: #e9ecef;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .editor-content ul,
        .preview-content ul,
        .editor-content ol,
        .preview-content ol {
          padding-left: 2rem;
          margin: 1rem 0;
        }
        .editor-content li,
        .preview-content li {
          margin-bottom: 0.5rem;
        }
        .editor-content a,
        .preview-content a {
          color: #0d6efd;
          text-decoration: none;
        }
        .editor-content a:hover,
        .preview-content a:hover {
          text-decoration: underline;
        }
        .editor-content img,
        .preview-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 1rem 0;
        }
        .editor-content blockquote,
        .preview-content blockquote {
          border-left: 4px solid #0d6efd;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6c757d;
        }
        .editor-content table,
        .preview-content table {
          width: 100%;
          margin: 1rem 0;
          border-collapse: collapse;
        }
        .editor-content th,
        .preview-content th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        .editor-content th,
        .editor-content td,
        .preview-content th,
        .preview-content td {
          padding: 0.75rem;
          border: 1px solid #dee2e6;
        }
        .editor-content th:focus,
        .editor-content td:focus,
        .preview-content th:focus,
        .preview-content td:focus {
          outline: 2px solid #0d6efd;
        }
        .toolbar-button {
          transition: all 0.2s ease;
        }
        .toolbar-button:hover {
          background-color: #e9ecef;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default ManageModule;