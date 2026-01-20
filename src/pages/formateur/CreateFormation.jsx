import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CreateFormation = () => {
  const navigate = useNavigate();
  const [domaines, setDomaines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    domaine_id: '',
    prix: '',
    is_free: true,
    duree_estimee: '',
    image: null,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDomaines();
  }, []);

  const fetchDomaines = async () => {
    try {
      const response = await api.get('/domaines');
      setDomaines(response.data.domaines);
    } catch (error) {
      toast.error('Erreur lors du chargement des domaines');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Effacer l'erreur du champ
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const data = new FormData();
    data.append('titre', formData.titre);
    data.append('description', formData.description);
    data.append('domaine_id', formData.domaine_id);
    data.append('is_free', formData.is_free ? '1' : '0');
    
    if (!formData.is_free) {
      data.append('prix', formData.prix);
    }
    
    if (formData.duree_estimee) {
      data.append('duree_estimee', formData.duree_estimee);
    }
    
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      const response = await api.post('/formations', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Formation créée avec succès !');
      navigate(`/formateur/formations/${response.data.formation.id}`);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-success shadow-sm">
        <Container fluid>
          <Button variant="link" className="text-white" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} className="me-2" />
            Retour
          </Button>
          <span className="navbar-brand mb-0 h1">Nouvelle Formation</span>
          <div style={{ width: 100 }}></div>
        </Container>
      </nav>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h4 className="mb-4">Créer une nouvelle formation</h4>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Titre de la formation *</Form.Label>
                    <Form.Control
                      type="text"
                      name="titre"
                      value={formData.titre}
                      onChange={handleChange}
                      isInvalid={!!errors.titre}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.titre?.[0]}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      isInvalid={!!errors.description}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.description?.[0]}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Domaine *</Form.Label>
                    <Form.Select
                      name="domaine_id"
                      value={formData.domaine_id}
                      onChange={handleChange}
                      isInvalid={!!errors.domaine_id}
                      required
                    >
                      <option value="">Sélectionnez un domaine</option>
                      {domaines.map((domaine) => (
                        <option key={domaine.id} value={domaine.id}>
                          {domaine.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.domaine_id?.[0]}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      name="is_free"
                      label="Formation gratuite"
                      checked={formData.is_free}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  {!formData.is_free && (
                    <Form.Group className="mb-3">
                      <Form.Label>Prix (FCFA) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="prix"
                        value={formData.prix}
                        onChange={handleChange}
                        isInvalid={!!errors.prix}
                        min="0"
                        required={!formData.is_free}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.prix?.[0]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Durée estimée (en heures)</Form.Label>
                    <Form.Control
                      type="number"
                      name="duree_estimee"
                      value={formData.duree_estimee}
                      onChange={handleChange}
                      min="1"
                    />
                    <Form.Text className="text-muted">
                      Estimation du temps nécessaire pour terminer la formation
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Image de couverture</Form.Label>
                    <Form.Control
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                    />
                    <Form.Text className="text-muted">
                      Format recommandé : 1200x630px (JPG ou PNG, max 2MB)
                    </Form.Text>
                  </Form.Group>

                  <Alert variant="info">
                    <strong>Note :</strong> La formation sera créée en mode brouillon. Vous pourrez ajouter des modules et chapitres avant de la publier.
                  </Alert>

                  <div className="d-flex justify-content-between">
                    <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                      Annuler
                    </Button>
                    <Button variant="success" type="submit" disabled={loading}>
                      <Save size={18} className="me-2" />
                      {loading ? 'Création...' : 'Créer la formation'}
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

export default CreateFormation;