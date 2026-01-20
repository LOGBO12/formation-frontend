import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();
  const [domaines, setDomaines] = useState([]);
  const [selectedDomaines, setSelectedDomaines] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const experienceLevels = user?.role === 'formateur'
    ? [
        { value: 'debutant', label: 'Débutant (0-2 ans)' },
        { value: 'intermediaire', label: 'Intermédiaire (2-5 ans)' },
        { value: 'avance', label: 'Avancé (5-10 ans)' },
        { value: 'expert', label: 'Expert (10+ ans)' },
      ]
    : [
        { value: 'debutant', label: 'Débutant' },
        { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'avance', label: 'Avancé' },
      ];

  useEffect(() => {
    fetchDomaines();
  }, []);

  const fetchDomaines = async () => {
    try {
      const response = await api.get('/domaines');
      setDomaines(response.data.domaines);
    } catch (err) {
      toast.error('Erreur lors du chargement des domaines');
    }
  };

  const toggleDomaine = (domaineId) => {
    setSelectedDomaines((prev) =>
      prev.includes(domaineId)
        ? prev.filter((id) => id !== domaineId)
        : [...prev, domaineId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedDomaines.length === 0) {
      toast.error('Veuillez sélectionner au moins un domaine');
      return;
    }

    if (!experienceLevel) {
      toast.error('Veuillez sélectionner votre niveau');
      return;
    }

    setLoading(true);

    try {
      await api.post('/onboarding/complete-profile', {
        domaines: selectedDomaines,
        experience_level: experienceLevel,
      });
      await fetchUser();
      toast.success('Profil complété !');
      navigate('/onboarding/privacy_policy');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await api.post('/onboarding/skip-profile');
      await fetchUser();
      navigate('/onboarding/privacy_policy');
    } catch (err) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3">Personnalisez votre profil</h2>
          <p className="text-muted fs-5">
            {user?.role === 'formateur'
              ? 'Parlez-nous de votre expertise'
              : 'Aidez-nous à mieux vous connaître'}
          </p>
          <div className="d-flex justify-content-center mt-4">
            <div className="bg-success rounded-circle me-2" style={{ width: 10, height: 10 }}></div>
            <div className="bg-primary rounded-circle me-2" style={{ width: 10, height: 10 }}></div>
            <div className="bg-secondary rounded-circle" style={{ width: 10, height: 10 }}></div>
          </div>
        </div>

        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <Form onSubmit={handleSubmit}>
                  {/* Sélection des domaines */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold fs-5 mb-3">
                      {user?.role === 'formateur'
                        ? 'Dans quel(s) domaine(s) enseignez-vous ?'
                        : 'Quel(s) domaine(s) vous intéressent ?'}
                    </Form.Label>
                    <Row className="g-3">
                      {domaines.map((domaine) => (
                        <Col md={6} key={domaine.id}>
                          <Card
                            className={`cursor-pointer border-2 ${
                              selectedDomaines.includes(domaine.id)
                                ? 'border-primary bg-primary bg-opacity-10'
                                : 'border-light'
                            }`}
                            style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                            onClick={() => toggleDomaine(domaine.id)}
                          >
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h6 className="mb-1">{domaine.name}</h6>
                                  <small className="text-muted">{domaine.description}</small>
                                </div>
                                {selectedDomaines.includes(domaine.id) && (
                                  <Badge bg="primary">✓</Badge>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Form.Group>

                  {/* Niveau d'expérience */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold fs-5 mb-3">
                      {user?.role === 'formateur'
                        ? 'Quelle est votre expérience ?'
                        : 'Quel est votre niveau ?'}
                    </Form.Label>
                    <div className="d-grid gap-2">
                      {experienceLevels.map((level) => (
                        <Button
                          key={level.value}
                          variant={experienceLevel === level.value ? 'primary' : 'outline-primary'}
                          size="lg"
                          onClick={() => setExperienceLevel(level.value)}
                          type="button"
                        >
                          {level.label}
                        </Button>
                      ))}
                    </div>
                  </Form.Group>

                  <div className="d-flex justify-content-between mt-5">
                    <Button variant="outline-secondary" size="lg" onClick={handleSkip}>
                      Passer
                    </Button>
                    <Button variant="primary" size="lg" type="submit" disabled={loading}>
                      {loading ? 'Enregistrement...' : 'Continuer'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CompleteProfile;