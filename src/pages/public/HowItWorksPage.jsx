import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { 
  UserPlus, 
  Search, 
  BookOpen, 
  Award,
  DollarSign,
  Users,
  Video,
  MessageSquare,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

const HowItWorksPage = () => {
  const navigate = useNavigate();

  const apprenantSteps = [
    {
      icon: UserPlus,
      number: "1",
      title: "Créez votre compte",
      description: "Inscription gratuite en moins de 2 minutes. Choisissez votre profil d'apprenant.",
      color: "#0d6efd" // primary
    },
    {
      icon: Search,
      number: "2",
      title: "Explorez le catalogue",
      description: "Parcourez des centaines de formations dans différents domaines. Utilisez les filtres pour trouver ce qui vous convient.",
      color: "#198754" // success
    },
    {
      icon: BookOpen,
      number: "3",
      title: "Inscrivez-vous",
      description: "Formations gratuites : accès immédiat. Formations payantes : paiement sécurisé par Mobile Money.",
      color: "#ffc107" // warning
    },
    {
      icon: Video,
      number: "4",
      title: "Apprenez à votre rythme",
      description: "Suivez les cours (vidéos, PDF, quiz) quand vous voulez, où vous voulez. Progressez à votre vitesse.",
      color: "#0dcaf0" // info
    },
    {
      icon: MessageSquare,
      number: "5",
      title: "Interagissez",
      description: "Posez vos questions dans la communauté, échangez avec d'autres apprenants et le formateur.",
      color: "#6c757d" // secondary
    },
    {
      icon: Award,
      number: "6",
      title: "Obtenez votre certificat",
      description: "Une fois la formation terminée avec succès, recevez votre certificat valorisant vos compétences.",
      color: "#dc3545" // danger
    }
  ];

  const formateurSteps = [
    {
      icon: UserPlus,
      number: "1",
      title: "Créez votre profil formateur",
      description: "Inscrivez-vous en tant que formateur et complétez votre profil avec vos compétences et expériences.",
      color: "#198754" // success
    },
    {
      icon: BookOpen,
      number: "2",
      title: "Créez votre formation",
      description: "Structurez votre contenu en modules et chapitres. Ajoutez des vidéos, PDF, quiz et autres ressources.",
      color: "#0d6efd" // primary
    },
    {
      icon: DollarSign,
      number: "3",
      title: "Fixez votre prix",
      description: "Choisissez entre formation gratuite ou payante. Vous recevez 90% du prix de vente.",
      color: "#ffc107" // warning
    },
    {
      icon: Users,
      number: "4",
      title: "Publiez et gérez",
      description: "Publiez votre formation, gérez les inscriptions et suivez la progression de vos apprenants.",
      color: "#0dcaf0" // info
    }
  ];

  const features = [
    {
      icon: Video,
      title: "Contenu multimédia",
      description: "Vidéos HD, documents PDF, quiz interactifs"
    },
    {
      icon: MessageSquare,
      title: "Communautés actives",
      description: "Échangez avec formateurs et apprenants"
    },
    {
      icon: Award,
      title: "Certificats reconnus",
      description: "Valorisez vos nouvelles compétences"
    },
    {
      icon: TrendingUp,
      title: "Suivi progression",
      description: "Visualisez votre avancement en temps réel"
    }
  ];

  return (
    <div className="bg-light">
      {/* Hero Section - CORRIGÉ */}
      <section className="py-5 text-white" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '400px'
      }}>
        <Container className="py-5">
          <div className="text-center">
            <h1 className="display-4 fw-bold mb-4 text-white">
              Comment ça marche ?
            </h1>
            <p className="lead mb-4 text-white">
              Que vous soyez apprenant ou formateur, notre plateforme est simple à utiliser
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Button 
                variant="light" 
                size="lg"
                onClick={() => navigate('/register')}
                className="px-5 py-2"
              >
                Commencer maintenant
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Toggle Apprenant/Formateur */}
      <section className="py-5 bg-white">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Choisissez votre parcours</h2>
          </div>
        </Container>
      </section>

      {/* Pour les Apprenants */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <Badge bg="primary" className="px-4 py-2 mb-3 text-white" style={{ fontSize: '1.1rem' }}>
              Pour les Apprenants
            </Badge>
            <h2 className="display-6 fw-bold">6 étapes simples pour apprendre</h2>
          </div>

          <Row>
            {apprenantSteps.map((step, index) => (
              <Col md={6} lg={4} key={index} className="mb-4">
                <Card className="h-100 border-0 shadow-sm hover-shadow">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-start mb-3">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ 
                          width: 60, 
                          height: 60, 
                          minWidth: 60,
                          backgroundColor: `${step.color}20`
                        }}
                      >
                        <step.icon size={30} style={{ color: step.color }} />
                      </div>
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                        style={{ 
                          width: 35, 
                          height: 35, 
                          fontSize: '1.2rem',
                          backgroundColor: step.color
                        }}
                      >
                        {step.number}
                      </div>
                    </div>
                    <h5 className="fw-bold mb-3">{step.title}</h5>
                    <p className="text-muted mb-0">{step.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-4">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate('/register')}
              className="px-5 py-2"
            >
              Commencer à apprendre
            </Button>
          </div>
        </Container>
      </section>

      {/* Séparateur */}
      <div className="py-5 bg-white">
        <Container>
          <hr style={{ height: '2px', opacity: '0.1' }} />
        </Container>
      </div>

      {/* Pour les Formateurs */}
      <section className="py-5 bg-white">
        <Container>
          <div className="text-center mb-5">
            <Badge bg="success" className="px-4 py-2 mb-3 text-white" style={{ fontSize: '1.1rem' }}>
              Pour les Formateurs
            </Badge>
            <h2 className="display-6 fw-bold">4 étapes pour enseigner</h2>
          </div>

          <Row>
            {formateurSteps.map((step, index) => (
              <Col md={6} key={index} className="mb-4">
                <Card className="h-100 border-0 shadow-sm hover-shadow">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-start mb-3">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ 
                          width: 70, 
                          height: 70, 
                          minWidth: 70,
                          backgroundColor: `${step.color}20`
                        }}
                      >
                        <step.icon size={35} style={{ color: step.color }} />
                      </div>
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                        style={{ 
                          width: 40, 
                          height: 40, 
                          fontSize: '1.3rem',
                          backgroundColor: step.color
                        }}
                      >
                        {step.number}
                      </div>
                    </div>
                    <h5 className="fw-bold mb-3">{step.title}</h5>
                    <p className="text-muted mb-0">{step.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-4">
            <Button 
              variant="success" 
              size="lg"
              onClick={() => navigate('/register')}
              className="px-5 py-2"
            >
              Devenir formateur
            </Button>
          </div>
        </Container>
      </section>

      {/* Fonctionnalités clés */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Fonctionnalités Incluses</h2>
            <p className="lead text-muted">
              Tout ce dont vous avez besoin pour une expérience optimale
            </p>
          </div>

          <Row>
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card className="border-0 shadow-sm text-center h-100 hover-shadow">
                  <Card.Body className="p-4">
                    <div 
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ 
                        width: 80, 
                        height: 80,
                        backgroundColor: '#0d6efd20'
                      }}
                    >
                      <feature.icon size={40} style={{ color: '#0d6efd' }} />
                    </div>
                    <h5 className="fw-bold mb-2">{feature.title}</h5>
                    <p className="text-muted mb-0 small">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Avantages */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h2 className="display-5 fw-bold mb-4">
                Pourquoi choisir notre plateforme ?
              </h2>
              <div className="d-grid gap-3">
                <div className="d-flex align-items-start">
                  <CheckCircle size={24} style={{ color: '#198754' }} className="me-3 flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1">Apprentissage flexible</h6>
                    <p className="text-muted mb-0">
                      Apprenez quand vous voulez, où vous voulez, à votre rythme
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-start">
                  <CheckCircle size={24} style={{ color: '#198754' }} className="me-3 flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1">Formateurs vérifiés</h6>
                    <p className="text-muted mb-0">
                      Tous nos formateurs sont soigneusement sélectionnés
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-start">
                  <CheckCircle size={24} style={{ color: '#198754' }} className="me-3 flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1">Paiements sécurisés</h6>
                    <p className="text-muted mb-0">
                      Transactions 100% sécurisées via Mobile Money
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-start">
                  <CheckCircle size={24} style={{ color: '#198754' }} className="me-3 flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1">Support dédié</h6>
                    <p className="text-muted mb-0">
                      Notre équipe est disponible pour vous accompagner
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-start">
                  <CheckCircle size={24} style={{ color: '#198754' }} className="me-3 flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1">Certificats reconnus</h6>
                    <p className="text-muted mb-0">
                      Valorisez vos compétences avec nos certificats
                    </p>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow-lg text-white" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}>
                <Card.Body className="p-5 text-center">
                  <BookOpen size={100} className="mb-4 text-white opacity-75" />
                  <h3 className="fw-bold mb-3 text-white">Prêt à commencer ?</h3>
                  <p className="lead mb-4 text-white">
                    Rejoignez des milliers d'apprenants et de formateurs
                  </p>
                  <div className="d-grid gap-3">
                    <Button 
                      variant="light" 
                      size="lg"
                      onClick={() => navigate('/register')}
                      className="py-2"
                    >
                      Créer un compte gratuit
                    </Button>
                    <Button 
                      variant="outline-light" 
                      size="lg"
                      onClick={() => navigate('/public/formations')}
                      className="py-2"
                    >
                      Voir les formations
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* FAQ rapide */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Questions Fréquentes</h2>
          </div>
          <Row>
            <Col md={6} className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">💰 Les formations sont-elles gratuites ?</h5>
                  <p className="text-muted mb-0">
                    Nous proposons des formations gratuites et payantes. Vous choisissez selon vos besoins et votre budget.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">⏰ Puis-je apprendre à mon rythme ?</h5>
                  <p className="text-muted mb-0">
                    Absolument ! Une fois inscrit, vous avez un accès illimité et apprenez quand vous voulez.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">🎓 Vais-je recevoir un certificat ?</h5>
                  <p className="text-muted mb-0">
                    Oui, vous recevez un certificat officiel après avoir complété avec succès une formation.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">💳 Comment se font les paiements ?</h5>
                  <p className="text-muted mb-0">
                    Nous acceptons les paiements par Mobile Money (MTN, Moov, etc.) de manière totalement sécurisée.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <div className="text-center mt-4">
            <Button variant="outline-primary" href="/faq">
              Voir toutes les questions
            </Button>
          </div>
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

export default HowItWorksPage;