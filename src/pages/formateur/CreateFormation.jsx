import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { ArrowLeft, Save, DollarSign, Info } from 'lucide-react';
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
      // Si on passe en gratuit, réinitialiser le prix
      if (name === 'is_free' && checked) {
        setFormData(prev => ({ ...prev, [name]: checked, prix: '' }));
      } else {
        setFormData({ ...formData, [name]: checked });
      }
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
    
    // Validation supplémentaire
    if (!formData.is_free && (!formData.prix || parseFloat(formData.prix) <= 0)) {
      toast.error('Veuillez entrer un prix valide pour une formation payante');
      setErrors({ prix: ['Le prix est requis pour une formation payante'] });
      return;
    }
    
    setLoading(true);
    setErrors({});

    const data = new FormData();
    data.append('titre', formData.titre);
    data.append('description', formData.description);
    data.append('domaine_id', formData.domaine_id);
    data.append('is_free', formData.is_free ? '1' : '0');
    
    if (!formData.is_free && formData.prix) {
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
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  // Calculer le montant que recevra le formateur (90%)
  const calculateFormateurRevenue = () => {
    if (!formData.prix || formData.is_free) return 0;
    const prix = parseFloat(formData.prix);
    return Math.round(prix * 0.9);
  };

  // Calculer la commission (10%)
  const calculateCommission = () => {
    if (!formData.prix || formData.is_free) return 0;
    const prix = parseFloat(formData.prix);
    return Math.round(prix * 0.1);
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
                  {/* Titre */}
                  <Form.Group className="mb-3">
                    <Form.Label>Titre de la formation *</Form.Label>
                    <Form.Control
                      type="text"
                      name="titre"
                      value={formData.titre}
                      onChange={handleChange}
                      isInvalid={!!errors.titre}
                      placeholder="Ex: Maîtriser React.js de A à Z"
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.titre?.[0]}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Description */}
                  <Form.Group className="mb-3">
                    <Form.Label>Description *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      isInvalid={!!errors.description}
                      placeholder="Décrivez le contenu, les objectifs et ce que les apprenants vont apprendre..."
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.description?.[0]}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Domaine */}
                  <Form.Group className="mb-4">
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
                          {domaine.icon} {domaine.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.domaine_id?.[0]}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Séparateur */}
                  <hr className="my-4" />
                  <h5 className="mb-3">💰 Tarification</h5>

                  {/* Formation gratuite/payante */}
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="is_free"
                      name="is_free"
                      label={
                        <span className="d-flex align-items-center">
                          <strong>Formation gratuite</strong>
                          {formData.is_free && (
                            <span className="badge bg-success ms-2">Gratuit</span>
                          )}
                        </span>
                      }
                      checked={formData.is_free}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-muted">
                      {formData.is_free 
                        ? "Les apprenants pourront s'inscrire gratuitement" 
                        : "Les apprenants devront payer pour accéder à la formation"}
                    </Form.Text>
                  </Form.Group>

                  {/* Prix (si payant) */}
                  {!formData.is_free && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Prix de la formation (FCFA) *</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <DollarSign size={18} />
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            name="prix"
                            value={formData.prix}
                            onChange={handleChange}
                            isInvalid={!!errors.prix}
                            min="100"
                            step="100"
                            placeholder="Ex: 15000"
                            required={!formData.is_free}
                          />
                          <InputGroup.Text>FCFA</InputGroup.Text>
                          <Form.Control.Feedback type="invalid">
                            {errors.prix?.[0]}
                          </Form.Control.Feedback>
                        </InputGroup>
                        <Form.Text className="text-muted">
                          Prix minimum recommandé : 1000 FCFA
                        </Form.Text>
                      </Form.Group>

                      {/* Calcul des revenus */}
                      {formData.prix && parseFloat(formData.prix) > 0 && (
                        <Alert variant="info" className="mb-3">
                          <div className="d-flex align-items-start">
                            <Info size={20} className="me-2 mt-1" />
                            <div className="flex-grow-1">
                              <strong>Répartition des revenus</strong>
                              <div className="mt-2">
                                <div className="d-flex justify-content-between mb-1">
                                  <span>Prix de vente :</span>
                                  <strong>{parseFloat(formData.prix).toLocaleString()} FCFA</strong>
                                </div>
                                <div className="d-flex justify-content-between mb-1 text-muted">
                                  <span>Commission plateforme (10%) :</span>
                                  <span>-{calculateCommission().toLocaleString()} FCFA</span>
                                </div>
                                <hr className="my-2" />
                                <div className="d-flex justify-content-between">
                                  <strong className="text-success">Vous recevrez :</strong>
                                  <strong className="text-success">
                                    {calculateFormateurRevenue().toLocaleString()} FCFA
                                  </strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Alert>
                      )}
                    </>
                  )}

                  {/* Séparateur */}
                  <hr className="my-4" />
                  <h5 className="mb-3">📚 Informations complémentaires</h5>

                  {/* Durée estimée */}
                  <Form.Group className="mb-3">
                    <Form.Label>Durée estimée (en heures)</Form.Label>
                    <Form.Control
                      type="number"
                      name="duree_estimee"
                      value={formData.duree_estimee}
                      onChange={handleChange}
                      min="1"
                      step="0.5"
                      placeholder="Ex: 10"
                    />
                    <Form.Text className="text-muted">
                      Estimation du temps nécessaire pour terminer la formation
                    </Form.Text>
                  </Form.Group>

                  {/* Image */}
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

                  {/* Info importante */}
                  <Alert variant="info">
                    <strong>📌 Note importante :</strong> La formation sera créée en mode <strong>brouillon</strong>. 
                    Vous pourrez ajouter des modules et chapitres avant de la publier.
                  </Alert>

                  {/* Boutons */}
                  <div className="d-flex justify-content-between">
                    <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                      Annuler
                    </Button>
                    <Button variant="success" type="submit" disabled={loading}>
                      <Save size={18} className="me-2" />
                      {loading ? 'Création en cours...' : 'Créer la formation'}
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