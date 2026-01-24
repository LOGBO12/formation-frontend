import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Form, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { ArrowLeft, Clock, Award, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const QuizViewer = () => {
  const { id } = useParams(); // ID du chapitre
  const navigate = useNavigate();
  const [chapitre, setChapitre] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [reponses, setReponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (quiz?.duree_minutes && !resultat) {
      setTimeLeft(quiz.duree_minutes * 60);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !resultat) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(); // Soumettre automatiquement
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, resultat]);

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/apprenant/chapitres/${id}`);
      setChapitre(response.data.chapitre);
      setQuiz(response.data.chapitre.quiz);
    } catch (error) {
      toast.error('Erreur lors du chargement du quiz');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionId, optionId, isMultiple) => {
    if (isMultiple) {
      // Choix multiples
      setReponses(prev => {
        const current = prev[questionId] || [];
        const newReponses = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
        return { ...prev, [questionId]: newReponses };
      });
    } else {
      // Choix unique
      setReponses(prev => ({ ...prev, [questionId]: [optionId] }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Vérifier que toutes les questions ont une réponse
    const questionsNonRepondues = quiz.questions.filter(q => !reponses[q.id] || reponses[q.id].length === 0);
    
    if (questionsNonRepondues.length > 0) {
      toast.error(`Veuillez répondre à toutes les questions (${questionsNonRepondues.length} restantes)`);
      return;
    }

    setSubmitting(true);
    
    try {
      const formattedReponses = quiz.questions.map(q => ({
        question_id: q.id,
        option_ids: reponses[q.id] || []
      }));

      const tempsEcoule = quiz.duree_minutes 
        ? (quiz.duree_minutes * 60) - (timeLeft || 0)
        : null;

      const response = await api.post(`/quiz/${quiz.id}/soumettre`, {
        reponses: formattedReponses,
        temps_ecoule: tempsEcoule
      });

      setResultat(response.data.resultat);
      
      if (response.data.resultat.statut === 'reussi') {
        toast.success('🎉 Félicitations ! Quiz réussi !');
      } else {
        toast.error('Quiz échoué. Réessayez !');
      }
    } catch (error) {
      toast.error('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Quiz introuvable</Alert>
      </Container>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom sticky-top">
        <Container className="py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Button 
                variant="link" 
                className="text-decoration-none me-3"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                <ArrowLeft size={20} className="me-2" />
                Retour
              </Button>
              <div>
                <h5 className="mb-0">{quiz.titre}</h5>
                <small className="text-muted">{chapitre.titre}</small>
              </div>
            </div>
            
            {timeLeft !== null && !resultat && (
              <div className="d-flex align-items-center">
                <Clock size={20} className={`me-2 ${timeLeft < 60 ? 'text-danger' : 'text-primary'}`} />
                <span className={`fw-bold ${timeLeft < 60 ? 'text-danger' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </Container>
      </div>

      <Container className="py-4" style={{ maxWidth: '900px' }}>
        {!resultat ? (
          // Mode Quiz
          <Form onSubmit={handleSubmit}>
            {quiz.description && (
              <Alert variant="info" className="mb-4">
                {quiz.description}
              </Alert>
            )}

            <div className="mb-4">
              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>Progression</span>
                <span>
                  {Object.keys(reponses).length}/{quiz.questions.length} répondu(es)
                </span>
              </div>
              <ProgressBar 
                now={(Object.keys(reponses).length / quiz.questions.length) * 100}
                variant="success"
                style={{ height: '8px' }}
              />
            </div>

            {quiz.questions.map((question, index) => {
              const isAnswered = reponses[question.id] && reponses[question.id].length > 0;
              
              return (
                <Card key={question.id} className={`mb-4 border-0 shadow-sm ${isAnswered ? 'border-success' : ''}`}>
                  <Card.Body>
                    <div className="d-flex align-items-start mb-3">
                      <div 
                        className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                          isAnswered ? 'bg-success text-white' : 'bg-light text-muted'
                        }`}
                        style={{ width: 40, height: 40, minWidth: 40 }}
                      >
                        <strong>{index + 1}</strong>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-2">{question.question}</h6>
                        <div className="d-flex gap-2">
                          <Badge bg="secondary">{question.points} point(s)</Badge>
                          {question.type === 'choix_multiple' && (
                            <Badge bg="info">Choix unique</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      {question.options.map(option => (
                        <div key={option.id} className="mb-2">
                          <Form.Check
                            type={question.type === 'choix_multiple' ? 'radio' : 'checkbox'}
                            id={`option-${option.id}`}
                            name={`question-${question.id}`}
                            label={option.option_texte}
                            checked={reponses[question.id]?.includes(option.id) || false}
                            onChange={() => handleOptionChange(
                              question.id, 
                              option.id,
                              question.type !== 'choix_multiple'
                            )}
                            className="p-3 border rounded"
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              );
            })}

            <div className="d-grid gap-2 mt-4">
              <Button 
                type="submit" 
                variant="success" 
                size="lg"
                disabled={submitting || Object.keys(reponses).length < quiz.questions.length}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Award size={20} className="me-2" />
                    Soumettre le quiz
                  </>
                )}
              </Button>
            </div>
          </Form>
        ) : (
          // Mode Résultat
          <div>
            <Card className={`border-0 shadow mb-4 ${resultat.statut === 'reussi' ? 'border-success' : 'border-danger'}`}>
              <Card.Body className="text-center py-5">
                {resultat.statut === 'reussi' ? (
                  <>
                    <CheckCircle size={64} className="text-success mb-3" />
                    <h3 className="text-success mb-2">Quiz réussi ! 🎉</h3>
                  </>
                ) : (
                  <>
                    <XCircle size={64} className="text-danger mb-3" />
                    <h3 className="text-danger mb-2">Quiz échoué</h3>
                  </>
                )}
                
                <div className="display-4 fw-bold my-4">
                  {parseFloat(resultat.pourcentage || 0).toFixed(1)}%
                </div>
                
                <p className="text-muted mb-4">
                  Vous avez obtenu {parseInt(resultat.score) || 0} sur {parseInt(resultat.score_max) || 0} points
                  <br />
                  Note de passage : {quiz.note_passage}%
                </p>

                {resultat.temps_ecoule && (
                  <p className="text-muted">
                    <Clock size={16} className="me-1" />
                    Temps écoulé : {formatTime(resultat.temps_ecoule)}
                  </p>
                )}
              </Card.Body>
            </Card>

            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                className="flex-grow-1"
                onClick={() => navigate(-1)}
              >
                Retour au cours
              </Button>
              <Button 
                variant="primary" 
                className="flex-grow-1"
                onClick={() => {
                  setResultat(null);
                  setReponses({});
                  fetchQuiz();
                }}
              >
                Refaire le quiz
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default QuizViewer;