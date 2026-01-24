import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Accordion, ProgressBar, Alert } from 'react-bootstrap';
import { 
  ArrowLeft, BookOpen, Video, FileText, File, HelpCircle, 
  CheckCircle, Lock, Clock, Play, Award, MessageSquare 
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FormationViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formation, setFormation] = useState(null);
  const [inscription, setInscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(null);
  const [showChapterModal, setShowChapterModal] = useState(false);

  useEffect(() => {
    fetchFormation();
  }, [id]);

  const fetchFormation = async () => {
    try {
      const response = await api.get(`/apprenant/formations/${id}/contenu`);
      setFormation(response.data.formation);
      setInscription(response.data.inscription);
      
      // Trouver le premier chapitre non complété
      const firstIncomplete = findFirstIncompleteChapter(response.data.formation);
      if (firstIncomplete) {
        setActiveChapter(firstIncomplete);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement de la formation');
      navigate('/apprenant/mes-formations');
    } finally {
      setLoading(false);
    }
  };

  const findFirstIncompleteChapter = (formation) => {
    for (const module of formation.modules || []) {
      for (const chapitre of module.chapitres || []) {
        if (!chapitre.is_completed) {
          return chapitre;
        }
      }
    }
    return formation.modules?.[0]?.chapitres?.[0] || null;
  };

  const openChapter = async (chapitre) => {
    try {
      const response = await api.get(`/apprenant/chapitres/${chapitre.id}`);
      setActiveChapter(response.data.chapitre);
      setShowChapterModal(true);
    } catch (error) {
      toast.error('Erreur lors du chargement du chapitre');
    }
  };

  const markChapterComplete = async (chapitreId) => {
    try {
      const response = await api.post(`/apprenant/chapitres/${chapitreId}/terminer`);
      toast.success('Chapitre terminé !');
      
      // Mettre à jour la progression
      fetchFormation();
      
      // Passer au chapitre suivant
      if (activeChapter?.chapitre_suivant) {
        openChapter(activeChapter.chapitre_suivant);
      } else {
        setShowChapterModal(false);
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const getChapterIcon = (type) => {
    const icons = {
      video: <Video size={18} className="text-danger" />,
      pdf: <File size={18} className="text-warning" />,
      texte: <FileText size={18} className="text-primary" />,
      quiz: <HelpCircle size={18} className="text-success" />,
    };
    return icons[type] || <BookOpen size={18} />;
  };

  const renderChapterContent = () => {
    if (!activeChapter) return null;

    // 🔍 DÉBOGAGE COMPLET
    console.log('═══════════════════════════════════');
    console.log('🎬 Type de chapitre:', activeChapter.type);
    console.log('📦 Contenu brut:', activeChapter.contenu);
    console.log('📦 Chapitre complet:', activeChapter);
    console.log('🌐 API URL:', import.meta.env.VITE_API_URL);
    console.log('═══════════════════════════════════');

    switch (activeChapter.type) {
      case 'video':
        // Vérifier si le contenu existe
        if (!activeChapter.contenu) {
          return (
            <Alert variant="warning" className="mb-4">
              <strong>⚠️ Vidéo manquante</strong>
              <p className="mb-0 mt-2">Le fichier vidéo n'a pas été trouvé.</p>
            </Alert>
          );
        }

        const videoUrl = activeChapter.contenu?.startsWith('http') 
          ? activeChapter.contenu 
          : `${import.meta.env.VITE_API_URL}/storage/${activeChapter.contenu}`;
        
        console.log('🎥 Video URL construite:', videoUrl);
        console.log('🎥 Contenu original:', activeChapter.contenu);
        
        return (
          <div className="mb-4">
            <Card className="border-0 bg-dark">
              <Card.Body className="p-0">
                <video 
                  controls 
                  className="w-100"
                  style={{ maxHeight: '500px', backgroundColor: '#000' }}
                  src={videoUrl}
                  controlsList="nodownload"
                  onError={(e) => {
                    console.error('❌ Erreur de chargement vidéo:', e);
                    console.error('❌ Source:', e.target.src);
                  }}
                  onLoadedMetadata={() => {
                    console.log('✅ Vidéo chargée avec succès');
                  }}
                >
                  <source src={videoUrl} type="video/mp4" />
                  <source src={videoUrl} type="video/webm" />
                  <source src={videoUrl} type="video/ogg" />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              </Card.Body>
            </Card>
            <Alert variant="info" className="mt-3">
              <Play size={18} className="me-2" />
              Regardez la vidéo jusqu'à la fin pour marquer ce chapitre comme terminé.
            </Alert>
            
            {/* Débogage visible */}
            <Alert variant="secondary" className="mt-2 small">
              <strong>🔍 Debug Info:</strong><br />
              URL: {videoUrl}<br />
              Contenu brut: {activeChapter.contenu}
            </Alert>
          </div>
        );

      case 'pdf':
        // Vérifier si le contenu existe
        if (!activeChapter.contenu) {
          return (
            <Alert variant="warning" className="mb-4">
              <strong>⚠️ PDF manquant</strong>
              <p className="mb-0 mt-2">Le fichier PDF n'a pas été trouvé.</p>
            </Alert>
          );
        }

        const pdfUrl = activeChapter.contenu?.startsWith('http') 
          ? activeChapter.contenu 
          : `${import.meta.env.VITE_API_URL}/storage/${activeChapter.contenu}`;
        
        console.log('📄 PDF URL construite:', pdfUrl);
        console.log('📄 Contenu original:', activeChapter.contenu);
        
        return (
          <div className="mb-4">
            <Card className="border-0">
              <Card.Body className="p-0">
                <iframe
                  src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-100 border-0"
                  style={{ height: '700px', minHeight: '70vh' }}
                  title="Document PDF"
                  frameBorder="0"
                  onError={(e) => {
                    console.error('❌ Erreur de chargement PDF:', e);
                  }}
                  onLoad={() => {
                    console.log('✅ PDF chargé avec succès');
                  }}
                />
              </Card.Body>
            </Card>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Alert variant="info" className="mb-0 flex-grow-1 me-2">
                <File size={18} className="me-2" />
                Consultez le document PDF complet
              </Alert>
              <Button 
                variant="outline-primary"
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouvrir dans un nouvel onglet
              </Button>
            </div>
            
            {/* Débogage visible */}
            <Alert variant="secondary" className="mt-2 small">
              <strong>🔍 Debug Info:</strong><br />
              URL: {pdfUrl}<br />
              Contenu brut: {activeChapter.contenu}
            </Alert>
          </div>
        );

      case 'texte':
        return (
          <div className="mb-4">
            <Card className="border-0">
              <Card.Body 
                className="p-4"
                dangerouslySetInnerHTML={{ __html: activeChapter.contenu }}
                style={{ 
                  lineHeight: '1.8',
                  fontSize: '16px',
                  minHeight: '300px'
                }}
              />
            </Card>
          </div>
        );

      case 'quiz':
        const questionsCount = activeChapter.quiz?.questions?.length || 0;
        const notePassage = activeChapter.quiz?.note_passage || 50;
        const dureeQuiz = activeChapter.quiz?.duree_minutes;
        const mesResultats = activeChapter.quiz?.mes_resultats || [];
        const meilleurScore = mesResultats.length > 0 
          ? Math.max(...mesResultats.map(r => parseFloat(r.pourcentage) || 0)) 
          : 0;
        
        console.log('❓ Quiz:', activeChapter.quiz);
        console.log('📊 Mes résultats:', mesResultats);
        
        return (
          <div className="mb-4">
            <Card className="border-0 bg-gradient" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
            }}>
              <Card.Body className="text-white p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-white bg-opacity-25 p-3 rounded-circle me-3">
                    <HelpCircle size={32} />
                  </div>
                  <div>
                    <h4 className="mb-0">{activeChapter.quiz?.titre || 'Quiz'}</h4>
                    {activeChapter.quiz?.description && (
                      <p className="mb-0 mt-1 opacity-75">{activeChapter.quiz.description}</p>
                    )}
                  </div>
                </div>

                <Row className="mt-4">
                  <Col md={4} className="mb-3">
                    <div className="text-center p-3 bg-white bg-opacity-25 rounded">
                      <div className="h2 mb-0">{questionsCount}</div>
                      <small>Questions</small>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="text-center p-3 bg-white bg-opacity-25 rounded">
                      <div className="h2 mb-0">{notePassage}%</div>
                      <small>Note de passage</small>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="text-center p-3 bg-white bg-opacity-25 rounded">
                      <div className="h2 mb-0">{dureeQuiz || '∞'}</div>
                      <small>{dureeQuiz ? 'Minutes' : 'Illimité'}</small>
                    </div>
                  </Col>
                </Row>

                {mesResultats.length > 0 && (
                  <Alert variant="light" className="mt-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Meilleur score : {meilleurScore.toFixed(1)}%</strong>
                        <br />
                        <small className="text-muted">
                          {mesResultats.length} tentative(s)
                        </small>
                      </div>
                      {meilleurScore >= notePassage && (
                        <Badge bg="success" className="fs-6">
                          <CheckCircle size={16} className="me-1" />
                          Réussi
                        </Badge>
                      )}
                    </div>
                  </Alert>
                )}

                <div className="d-grid gap-2 mt-4">
                  <Button 
                    variant="light" 
                    size="lg"
                    onClick={() => navigate(`/apprenant/quiz/${activeChapter.id}`)}
                  >
                    <Play size={20} className="me-2" />
                    {mesResultats.length > 0 ? 'Refaire le quiz' : 'Commencer le quiz'}
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {mesResultats.length > 0 && (
              <Card className="border-0 mt-3">
                <Card.Header className="bg-white">
                  <h6 className="mb-0">📊 Historique de vos tentatives</h6>
                </Card.Header>
                <Card.Body>
                  {mesResultats.map((resultat, index) => {
                    const pourcentage = parseFloat(resultat.pourcentage) || 0;
                    const score = parseInt(resultat.score) || 0;
                    const scoreMax = parseInt(resultat.score_max) || 0;
                    
                    return (
                      <div 
                        key={resultat.id} 
                        className="d-flex justify-content-between align-items-center p-3 border-bottom"
                      >
                        <div>
                          <strong>Tentative {mesResultats.length - index}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(resultat.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                        <div className="text-end">
                          <h5 className="mb-0">
                            <Badge bg={resultat.statut === 'reussi' ? 'success' : 'danger'}>
                              {pourcentage.toFixed(1)}%
                            </Badge>
                          </h5>
                          <small className="text-muted">
                            {score}/{scoreMax} points
                          </small>
                        </div>
                      </div>
                    );
                  })}
                </Card.Body>
              </Card>
            )}
          </div>
        );

      default:
        return (
          <Alert variant="warning">
            <strong>Type de contenu non supporté</strong>
            <p className="mb-0 mt-2">Type: {activeChapter.type}</p>
          </Alert>
        );
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!formation) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Formation introuvable</Alert>
      </Container>
    );
  }

  const progres = parseFloat(inscription?.progres_global || 0);

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom sticky-top">
        <Container fluid className="py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Button 
                variant="link" 
                className="text-decoration-none me-3"
                onClick={() => navigate('/apprenant/mes-formations')}
              >
                <ArrowLeft size={20} className="me-2" />
                Retour
              </Button>
              <div>
                <h5 className="mb-0">{formation.titre}</h5>
                <small className="text-muted">Par {formation.formateur?.name}</small>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              {formation.communaute && (
                <Button 
                  variant="outline-primary"
                  onClick={() => navigate(`/communaute/${formation.communaute.id}`)}
                >
                  <MessageSquare size={18} className="me-2" />
                  Communauté
                </Button>
              )}
              
              <div style={{ width: '200px' }}>
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">Progression</small>
                  <small className="fw-bold text-success">{progres.toFixed(0)}%</small>
                </div>
                <ProgressBar 
                  now={progres} 
                  variant={progres >= 100 ? 'success' : 'primary'}
                  style={{ height: '8px' }}
                  className="rounded-pill"
                />
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container fluid className="py-4">
        <Row>
          {/* Sidebar - Liste des modules */}
          <Col lg={4} xl={3} className="mb-4">
            <Card className="border-0 shadow-sm sticky-top" style={{ top: '80px' }}>
              <Card.Header className="bg-white">
                <h6 className="mb-0">📚 Contenu de la formation</h6>
              </Card.Header>
              <Card.Body style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                <Accordion defaultActiveKey="0">
                  {formation.modules?.map((module, moduleIndex) => {
                    const totalChapitres = module.chapitres?.length || 0;
                    const chapitresCompletes = module.chapitres?.filter(c => c.is_completed).length || 0;
                    const moduleProgres = totalChapitres > 0 ? (chapitresCompletes / totalChapitres) * 100 : 0;

                    return (
                      <Accordion.Item key={module.id} eventKey={moduleIndex.toString()}>
                        <Accordion.Header>
                          <div className="w-100">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <strong className="small">Module {moduleIndex + 1}</strong>
                              <Badge bg={moduleProgres >= 100 ? 'success' : 'secondary'} className="small">
                                {chapitresCompletes}/{totalChapitres}
                              </Badge>
                            </div>
                            <div className="text-truncate small">{module.titre}</div>
                            <ProgressBar 
                              now={moduleProgres} 
                              variant={moduleProgres >= 100 ? 'success' : 'info'}
                              style={{ height: '4px' }}
                              className="mt-2"
                            />
                          </div>
                        </Accordion.Header>
                        <Accordion.Body className="p-0">
                          {module.chapitres?.map((chapitre, chapIndex) => (
                            <div
                              key={chapitre.id}
                              className={`p-3 border-bottom cursor-pointer ${
                                activeChapter?.id === chapitre.id ? 'bg-primary bg-opacity-10' : ''
                              } hover-bg-light`}
                              onClick={() => openChapter(chapitre)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="d-flex align-items-start">
                                <div className="me-2 mt-1">
                                  {getChapterIcon(chapitre.type)}
                                </div>
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div className="small fw-semibold mb-1">
                                      {chapIndex + 1}. {chapitre.titre}
                                    </div>
                                    {chapitre.is_completed ? (
                                      <CheckCircle size={16} className="text-success" />
                                    ) : chapitre.is_preview ? (
                                      <Badge bg="success" className="small">Aperçu</Badge>
                                    ) : null}
                                  </div>
                                  {chapitre.duree && (
                                    <div className="text-muted small">
                                      <Clock size={12} className="me-1" />
                                      {chapitre.duree} min
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </Accordion.Body>
                      </Accordion.Item>
                    );
                  })}
                </Accordion>
              </Card.Body>
            </Card>
          </Col>

          {/* Contenu principal */}
          <Col lg={8} xl={9}>
            {!activeChapter ? (
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-5">
                  <BookOpen size={64} className="text-muted mb-3 opacity-50" />
                  <h5 className="text-muted mb-3">Bienvenue dans cette formation !</h5>
                  <p className="text-muted">
                    Sélectionnez un chapitre dans le menu de gauche pour commencer.
                  </p>
                </Card.Body>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        {getChapterIcon(activeChapter.type)}
                        <h4 className="mb-0">{activeChapter.titre}</h4>
                      </div>
                      {activeChapter.description && (
                        <p className="text-muted mb-0">{activeChapter.description}</p>
                      )}
                    </div>
                    {activeChapter.is_completed && (
                      <Badge bg="success" className="ms-3">
                        <CheckCircle size={16} className="me-1" />
                        Terminé
                      </Badge>
                    )}
                  </div>
                </Card.Header>

                <Card.Body>
                  {renderChapterContent()}

                  {/* Boutons de navigation */}
                  <div className="d-flex justify-content-between mt-4">
                    <div>
                      {activeChapter.chapitre_precedent && (
                        <Button 
                          variant="outline-secondary"
                          onClick={() => openChapter(activeChapter.chapitre_precedent)}
                        >
                          ← Précédent
                        </Button>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      {!activeChapter.is_completed && activeChapter.type !== 'quiz' && (
                        <Button 
                          variant="success"
                          onClick={() => markChapterComplete(activeChapter.id)}
                        >
                          <CheckCircle size={18} className="me-2" />
                          Marquer comme terminé
                        </Button>
                      )}
                      {activeChapter.chapitre_suivant && (
                        <Button 
                          variant="primary"
                          onClick={() => openChapter(activeChapter.chapitre_suivant)}
                        >
                          Suivant →
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Info sur la progression */}
            {progres >= 100 && (
              <Alert variant="success" className="mt-4">
                <Award size={24} className="me-2" />
                <strong>Félicitations ! 🎉</strong>
                <p className="mb-0 mt-2">
                  Vous avez terminé cette formation avec succès !
                </p>
              </Alert>
            )}
          </Col>
        </Row>
      </Container>

      <style>{`
        .hover-bg-light:hover {
          background-color: rgba(0, 0, 0, 0.03);
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default FormationViewer;