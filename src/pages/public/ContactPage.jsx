import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, HelpCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "contact@elearning.com",
      link: "mailto:contact@elearning.com",
      color: "#0d6efd" // primary
    },
    {
      icon: Phone,
      title: "Téléphone",
      content: "+229 00 00 00 00",
      link: "tel:+22900000000",
      color: "#198754" // success
    },
    {
      icon: MapPin,
      title: "Adresse",
      content: "Cotonou, Bénin",
      link: null,
      color: "#dc3545" // danger
    },
    {
      icon: Clock,
      title: "Horaires",
      content: "Lun-Ven: 8h-18h",
      link: null,
      color: "#ffc107" // warning
    }
  ];

  const faqs = [
    {
      question: "Comment puis-je m'inscrire à une formation ?",
      answer: "Créez un compte gratuit, parcourez notre catalogue et inscrivez-vous aux formations qui vous intéressent."
    },
    {
      question: "Les formations sont-elles certifiantes ?",
      answer: "Oui, vous recevez un certificat à la fin de chaque formation terminée avec succès."
    },
    {
      question: "Puis-je devenir formateur ?",
      answer: "Absolument ! Inscrivez-vous en tant que formateur et commencez à créer vos propres formations."
    },
    {
      question: "Comment fonctionne le paiement ?",
      answer: "Nous acceptons les paiements via Mobile Money (MTN, Moov, etc.) de manière sécurisée."
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/public/contact', formData);
      
      if (response.data.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        toast.success('Message envoyé avec succès !');
        
        // Masquer le message de succès après 5 secondes
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Hero Section - CORRIGÉ */}
      <section className="py-5 text-white" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Container className="py-4">
          <div className="text-center">
            <MessageSquare size={80} className="mb-3 text-white opacity-75" />
            <h1 className="display-4 fw-bold mb-3 text-white">Contactez-Nous</h1>
            <p className="lead mb-0 text-white">
              Une question ? Une suggestion ? Nous sommes là pour vous aider !
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-5">
        <Row>
          {/* Formulaire de contact */}
          <Col lg={7} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h3 className="fw-bold mb-4">Envoyez-nous un message</h3>
                
                {submitted && (
                  <Alert variant="success" dismissible onClose={() => setSubmitted(false)}>
                    <strong>✅ Message envoyé !</strong>
                    <p className="mb-0 mt-2">
                      Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
                    </p>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nom complet *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="votre@email.com"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Sujet *</Form.Label>
                    <Form.Select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choisissez un sujet</option>
                      <option value="inscription">Question sur l'inscription</option>
                      <option value="formation">Question sur une formation</option>
                      <option value="paiement">Question sur le paiement</option>
                      <option value="technique">Problème technique</option>
                      <option value="formateur">Devenir formateur</option>
                      <option value="partenariat">Partenariat</option>
                      <option value="autre">Autre</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Message *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre demande en détail..."
                      required
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    size="lg" 
                    type="submit"
                    disabled={loading}
                    className="w-100 py-2"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send size={18} className="me-2" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Informations de contact */}
          <Col lg={5}>
            {/* Coordonnées */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h4 className="fw-bold mb-4">Nos Coordonnées</h4>
                <div className="d-grid gap-3">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="d-flex align-items-start">
                      <div 
                        className="p-3 rounded me-3"
                        style={{ 
                          minWidth: 50,
                          backgroundColor: `${info.color}20`
                        }}
                      >
                        <info.icon style={{ color: info.color }} size={24} />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">{info.title}</h6>
                        {info.link ? (
                          <a 
                            href={info.link} 
                            className="text-decoration-none"
                            style={{ color: info.color }}
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p className="text-muted mb-0">{info.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* Réseaux sociaux */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h4 className="fw-bold mb-3">Suivez-nous</h4>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    className="flex-grow-1"
                    style={{ borderColor: '#0d6efd', color: '#0d6efd' }}
                  >
                    Facebook
                  </Button>
                  <Button 
                    variant="outline-info" 
                    className="flex-grow-1"
                    style={{ borderColor: '#0dcaf0', color: '#0dcaf0' }}
                  >
                    Twitter
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    className="flex-grow-1"
                    style={{ borderColor: '#dc3545', color: '#dc3545' }}
                  >
                    LinkedIn
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Support d'urgence */}
            <Alert variant="info">
              <div className="d-flex align-items-start">
                <HelpCircle size={24} className="me-3 mt-1" style={{ color: '#0dcaf0' }} />
                <div>
                  <strong>Besoin d'aide immédiate ?</strong>
                  <p className="mb-0 mt-2 small">
                    Consultez notre{' '}
                    <a href="/faq" className="alert-link" style={{ color: '#055160' }}>
                      FAQ
                    </a>{' '}
                    ou notre{' '}
                    <a href="/faq" className="alert-link" style={{ color: '#055160' }}>
                      centre d'aide
                    </a>.
                  </p>
                </div>
              </div>
            </Alert>
          </Col>
        </Row>

        {/* FAQ Section */}
        <Row className="mt-5">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white py-3">
                <h3 className="fw-bold mb-0">Questions Fréquentes</h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Row>
                  {faqs.map((faq, index) => (
                    <Col md={6} key={index} className="mb-4">
                      <div className="d-flex">
                        <div className="me-3">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ 
                              width: 40, 
                              height: 40,
                              backgroundColor: '#0d6efd20'
                            }}
                          >
                            <HelpCircle size={20} style={{ color: '#0d6efd' }} />
                          </div>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-2">{faq.question}</h6>
                          <p className="text-muted mb-0 small">{faq.answer}</p>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
                <div className="text-center mt-3">
                  <Button variant="outline-primary" href="/faq">
                    Voir toutes les questions
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Map placeholder */}
        <Row className="mt-5">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <div 
                  className="d-flex align-items-center justify-content-center text-white"
                  style={{ 
                    height: '300px',
                    backgroundColor: '#6c757d'
                  }}
                >
                  <div className="text-center">
                    <MapPin size={80} className="mb-3 text-white opacity-50" />
                    <p className="mb-0 text-white">Carte interactive</p>
                    <small className="text-white">Cotonou, Bénin</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ContactPage;