import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Modal, Table, Badge } from 'react-bootstrap';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ManageQuiz = () => {
  const { id } = useParams(); // ID du chapitre
  const navigate = useNavigate();
  const [chapitre, setChapitre] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [quizForm, setQuizForm] = useState({
    titre: '',
    description: '',
    duree_minutes: '',
    note_passage: 50,
  });
  const [questionForm, setQuestionForm] = useState({
    question: '',
    type: 'choix_multiple',
    points: 1,
    options: [
      { option_texte: '', is_correct: false },
      { option_texte: '', is_correct: false },
    ],
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const chapRes = await api.get(`/chapitres/${id}`);
      setChapitre(chapRes.data.chapitre);

      if (chapRes.data.chapitre.quiz) {
        const quizRes = await api.get(`/quiz/${chapRes.data.chapitre.quiz.id}`);
        setQuiz(quizRes.data.quiz);
        setQuestions(quizRes.data.quiz.questions || []);
        setQuizForm({
          titre: quizRes.data.quiz.titre,
          description: quizRes.data.quiz.description || '',
          duree_minutes: quizRes.data.quiz.duree_minutes || '',
          note_passage: quizRes.data.quiz.note_passage,
        });
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    try {
      if (quiz) {
        await api.put(`/quiz/${quiz.id}`, quizForm);
        toast.success('Quiz mis à jour');
      } else {
        const response = await api.post(`/chapitres/${id}/quiz`, quizForm);
        setQuiz(response.data.quiz);
        toast.success('Quiz créé');
      }
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleAddOption = () => {
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, { option_texte: '', is_correct: false }],
    });
  };

  const handleRemoveOption = (index) => {
    const newOptions = questionForm.options.filter((_, i) => i !== index);
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index][field] = value;
    
    // Si c'est un choix unique et qu'on coche une option, décocher les autres
    if (field === 'is_correct' && value && questionForm.type === 'choix_multiple') {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.is_correct = false;
      });
    }
    
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    
    if (!quiz) {
      toast.error('Veuillez d\'abord créer le quiz');
      return;
    }

    // Vérifier qu'au moins une réponse est correcte
    const hasCorrectAnswer = questionForm.options.some(opt => opt.is_correct);
    if (!hasCorrectAnswer) {
      toast.error('Veuillez marquer au moins une réponse comme correcte');
      return;
    }

    try {
      await api.post(`/quiz/${quiz.id}/questions`, {
        ...questionForm,
        ordre: questions.length + 1,
      });
      toast.success('Question ajoutée');
      setShowQuestionModal(false);
      resetQuestionForm();
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la question');
    }
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      question: '',
      type: 'choix_multiple',
      points: 1,
      options: [
        { option_texte: '', is_correct: false },
        { option_texte: '', is_correct: false },
      ],
    });
    setEditingQuestion(null);
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
          <span className="navbar-brand mb-0 h1">Gestion du Quiz</span>
          <div style={{ width: 100 }}></div>
        </Container>
      </nav>

      <Container className="py-4">
        {/* Configuration du Quiz */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white">
            <h5 className="mb-0">Configuration du Quiz</h5>
          </Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Titre du quiz *</Form.Label>
                <Form.Control
                  type="text"
                  value={quizForm.titre}
                  onChange={(e) => setQuizForm({ ...quizForm, titre: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Durée (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  value={quizForm.duree_minutes}
                  onChange={(e) => setQuizForm({ ...quizForm, duree_minutes: e.target.value })}
                  min="1"
                />
                <Form.Text className="text-muted">
                  Laisser vide pour un quiz sans limite de temps
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Note de passage (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={quizForm.note_passage}
                  onChange={(e) => setQuizForm({ ...quizForm, note_passage: e.target.value })}
                  min="0"
                  max="100"
                />
              </Form.Group>

              <Button variant="primary" onClick={handleSaveQuiz}>
                <Save size={18} className="me-2" />
                {quiz ? 'Mettre à jour le quiz' : 'Créer le quiz'}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {/* Questions */}
        {quiz && (
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Questions ({questions.length})</h5>
                <small className="text-muted">
                  Total de points : {questions.reduce((sum, q) => sum + q.points, 0)}
                </small>
              </div>
              <Button variant="success" onClick={() => setShowQuestionModal(true)}>
                <Plus size={18} className="me-2" />
                Ajouter une question
              </Button>
            </Card.Header>
            <Card.Body>
              {questions.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">Aucune question. Ajoutez-en une pour commencer !</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Question</th>
                      <th>Type</th>
                      <th>Points</th>
                      <th>Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q, index) => (
                      <tr key={q.id}>
                        <td>{index + 1}</td>
                        <td>{q.question}</td>
                        <td>
                          <Badge bg="info">
                            {q.type === 'choix_multiple' ? 'Choix multiple' : 'Vrai/Faux'}
                          </Badge>
                        </td>
                        <td>{q.points} pt(s)</td>
                        <td>
                          {q.options?.length || 0} option(s)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        )}
      </Container>

      {/* Modal Ajouter Question */}
      <Modal show={showQuestionModal} onHide={() => { setShowQuestionModal(false); resetQuestionForm(); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nouvelle Question</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveQuestion}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Question *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={questionForm.question}
                onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type de question</Form.Label>
              <Form.Select
                value={questionForm.type}
                onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}
              >
                <option value="choix_multiple">Choix multiple (une seule réponse)</option>
                <option value="vrai_faux">Vrai/Faux</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Points</Form.Label>
              <Form.Control
                type="number"
                value={questionForm.points}
                onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
                min="1"
              />
            </Form.Group>

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6>Options de réponse</h6>
              <Button variant="outline-success" size="sm" onClick={handleAddOption}>
                <Plus size={16} className="me-1" />
                Ajouter une option
              </Button>
            </div>

            {questionForm.options.map((option, index) => (
              <div key={index} className="mb-3 p-3 border rounded">
                <div className="d-flex gap-2 align-items-start">
                  <Form.Check
                    type="checkbox"
                    checked={option.is_correct}
                    onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                    label="Correcte"
                    className="mt-2"
                  />
                  <Form.Control
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option.option_texte}
                    onChange={(e) => handleOptionChange(index, 'option_texte', e.target.value)}
                    required
                  />
                  {questionForm.options.length > 2 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <small className="text-muted">
              Cochez la ou les réponse(s) correcte(s)
            </small>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowQuestionModal(false); resetQuestionForm(); }}>
              Annuler
            </Button>
            <Button variant="success" type="submit">
              Ajouter la question
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageQuiz;