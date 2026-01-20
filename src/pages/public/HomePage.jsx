import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: 'Formations de Qualité',
      description: 'Accédez à des milliers de formations créées par des experts',
      color: 'primary'
    },
    {
      icon: Users,
      title: 'Communauté Active',
      description: 'Échangez avec d\'autres apprenants et formateurs',
      color: 'success'
    },
    {
      icon: Award,
      title: 'Certificats Reconnus',
      description: 'Obtenez des certificats valorisant vos compétences',
      color: 'warning'
    },
    {
      icon: TrendingUp,
      title: 'Suivi de Progression',
      description: 'Suivez votre évolution en temps réel',
      color: 'info'
    }
  ];

  const stats = [
    { value: '1000+', label: 'Formations' },
    { value: '5000+', label: 'Apprenants' },
    { value: '200+', label: 'Formateurs' },
    { value: '95%', label: 'Satisfaction' }
  ];

  const benefits = [
    'Apprentissage à votre rythme',
    'Accès illimité 24/7',
    'Contenu régulièrement mis à jour',
    'Support formateur disponible',
    'Formations certifiantes',
    'Prix accessibles'
  ];

  return (
    <div className="bg-light">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-5" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '500px'
      }}>
        <Container className="py-5">
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-3 fw-bold mb-4">
                Apprenez sans limites
              </h1>
              <p className="lead mb-4">
                Développez vos compétences avec notre plateforme e-learning. 
                Des formations de qualité, accessibles à tous, partout et à tout moment.
              </p>
              <div className="d-flex gap-3">
                <Button 
                  variant="light" 
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="px-4"
                >
                  Commencer gratuitement
                  <ArrowRight size={20} className="ms-2" />
                </Button>
                <Button 
                  variant="outline-light" 
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="px-4"
                >
                  Se connecter
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <div className="text-center">
                <GraduationCap size={300} className="opacity-75" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-white">
        <Container>
          <Row>
            {stats.map((stat, index) => (
              <Col md={3} key={index} className="text-center mb-4 mb-md-0">
                <h2 className="display-4 fw-bold text-primary mb-2">{stat.value}</h2>
                <p className="text-muted">{stat.label}</p>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Pourquoi choisir notre plateforme ?</h2>
            <p className="lead text-muted">
              Tout ce dont vous avez besoin pour réussir votre apprentissage
            </p>
          </div>
          <Row>
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card className="h-100 border-0 shadow-sm hover-shadow transition">
                  <Card.Body className="text-center p-4">
                    <div 
                      className={`bg-${feature.color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
                      style={{ width: 80, height: 80 }}
                    >
                      <feature.icon size={40} className={`text-${feature.color}`} />
                    </div>
                    <h5 className="fw-bold mb-3">{feature.title}</h5>
                    <p className="text-muted">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h2 className="display-5 fw-bold mb-4">
                Une expérience d'apprentissage optimale
              </h2>
              <Row>
                {benefits.map((benefit, index) => (
                  <Col md={6} key={index} className="mb-3">
                    <div className="d-flex align-items-start">
                      <CheckCircle size={24} className="text-success me-3 flex-shrink-0 mt-1" />
                      <p className="mb-0">{benefit}</p>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow-lg">
                <Card.Body className="p-5">
                  <h4 className="fw-bold mb-4">Prêt à commencer ?</h4>
                  <p className="mb-4">
                    Rejoignez des milliers d'apprenants qui développent leurs compétences chaque jour.
                  </p>
                  <Button 
                    variant="success" 
                    size="lg" 
                    className="w-100 mb-3"
                    onClick={() => navigate('/register')}
                  >
                    Créer un compte gratuit
                  </Button>
                  <div className="text-center">
                    <small className="text-muted">
                      Déjà inscrit ? {' '}
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                        className="text-success fw-bold"
                      >
                        Se connecter
                      </a>
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-gradient-primary text-white" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={8} className="mb-4 mb-lg-0">
              <h2 className="display-5 fw-bold mb-3">
                Vous êtes formateur ?
              </h2>
              <p className="lead mb-0">
                Partagez vos connaissances et générez des revenus en créant vos propres formations.
              </p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <Button 
                variant="light" 
                size="lg"
                onClick={() => navigate('/register')}
                className="px-5"
              >
                Devenir formateur
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      <style>{`
        .hover-shadow {
          transition: all 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default HomePage;