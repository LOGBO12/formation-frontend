import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { 
  GraduationCap, 
  Target, 
  Users, 
  TrendingUp, 
  Heart,
  Award,
  BookOpen,
  MessageSquare
} from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Target,
      title: "Excellence",
      description: "Nous visons l'excellence dans chaque formation proposée",
      color: "primary"
    },
    {
      icon: Users,
      title: "Accessibilité",
      description: "L'éducation de qualité accessible à tous, partout",
      color: "success"
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Notre passion pour l'apprentissage guide chaque action",
      color: "danger"
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "Nous innovons constamment pour améliorer l'expérience",
      color: "info"
    }
  ];

  const stats = [
    { value: "2024", label: "Année de création" },
    { value: "5000+", label: "Apprenants actifs" },
    { value: "200+", label: "Formateurs experts" },
    { value: "1000+", label: "Formations disponibles" }
  ];

  const team = [
    {
      name: "Dr. Aminata Diallo",
      role: "Fondatrice & CEO",
      description: "Experte en pédagogie numérique avec 15 ans d'expérience"
    },
    {
      name: "Thomas Kouassi",
      role: "Directeur Technique",
      description: "Architecte logiciel passionné par l'EdTech"
    },
    {
      name: "Sophie Mensah",
      role: "Directrice Pédagogique",
      description: "Spécialiste en ingénierie de formation"
    },
    {
      name: "Marc Ndiaye",
      role: "Responsable Communauté",
      description: "Expert en engagement et support apprenant"
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
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4 text-white">
                À Propos de Nous
              </h1>
              <p className="lead mb-4 text-white">
                Notre mission est de rendre l'éducation de qualité accessible à tous, 
                en connectant apprenants passionnés et formateurs experts.
              </p>
            </Col>
            <Col lg={6} className="text-center">
              <GraduationCap size={250} className="text-white opacity-75" />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Notre Histoire */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h2 className="display-5 fw-bold mb-4">Notre Histoire</h2>
              <p className="lead mb-3">
                Née en 2026, notre plateforme est le fruit d'une passion commune 
                pour l'éducation et la technologie.
              </p>
              <p className="text-muted mb-3">
                Nous avons remarqué un besoin croissant de formations de qualité, 
                accessibles et flexibles en Afrique. C'est ainsi qu'est née notre plateforme, 
                avec pour ambition de démocratiser l'accès au savoir.
              </p>
              <p className="text-muted">
                Aujourd'hui, nous sommes fiers de servir des milliers d'apprenants 
                et de collaborer avec des centaines de formateurs experts dans leurs domaines.
              </p>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow-lg">
                <Card.Body className="p-5 text-center">
                  <BookOpen size={80} className="text-primary mb-4" />
                  <h4 className="fw-bold mb-3">Notre Vision</h4>
                  <p className="text-muted mb-0">
                    Devenir la plateforme de référence pour l'apprentissage en ligne 
                    en Afrique francophone, en offrant des formations de qualité qui 
                    transforment des vies et créent des opportunités.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Nos Valeurs */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Nos Valeurs</h2>
            <p className="lead text-muted">
              Les principes qui guident chacune de nos actions
            </p>
          </div>
          <Row>
            {values.map((value, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card className="h-100 border-0 shadow-sm text-center hover-shadow">
                  <Card.Body className="p-4">
                    <div 
                      className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
                      style={{ 
                        width: 80, 
                        height: 80,
                        backgroundColor: value.color === 'primary' ? '#0d6efd20' :
                                      value.color === 'success' ? '#19875420' :
                                      value.color === 'danger' ? '#dc354520' : '#0dcaf020'
                      }}
                    >
                      <value.icon 
                        size={40} 
                        style={{
                          color: value.color === 'primary' ? '#0d6efd' :
                                 value.color === 'success' ? '#198754' :
                                 value.color === 'danger' ? '#dc3545' : '#0dcaf0'
                        }} 
                      />
                    </div>
                    <h5 className="fw-bold mb-3">{value.title}</h5>
                    <p className="text-muted mb-0">{value.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Statistiques */}
      <section className="py-5 bg-white">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Notre Impact</h2>
            <p className="lead text-muted">
              En quelques chiffres
            </p>
          </div>
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

      {/* Notre Équipe */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Notre Équipe</h2>
            <p className="lead text-muted">
              Des professionnels passionnés par l'éducation
            </p>
          </div>
          <Row>
            {team.map((member, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card className="border-0 shadow-sm h-100 text-center hover-shadow">
                  <Card.Body className="p-4">
                    <div 
                      className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-white"
                      style={{ 
                        width: 100, 
                        height: 100,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    >
                      <Users size={40} className="text-white" />
                    </div>
                    <h5 className="fw-bold mb-1">{member.name}</h5>
                    <p className="text-primary mb-2">{member.role}</p>
                    <p className="text-muted small mb-0">{member.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Ce qui nous différencie */}
      <section className="py-5 bg-white">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Ce qui nous différencie</h2>
          </div>
          <Row>
            <Col md={4} className="mb-4">
              <div className="d-flex">
                <div className="me-3">
                  <Award size={40} style={{ color: '#ffc107' }} />
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Formateurs vérifiés</h5>
                  <p className="text-muted mb-0">
                    Tous nos formateurs sont soigneusement sélectionnés et 
                    vérifiés pour garantir la qualité des formations.
                  </p>
                </div>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="d-flex">
                <div className="me-3">
                  <MessageSquare size={40} style={{ color: '#198754' }} />
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Support continu</h5>
                  <p className="text-muted mb-0">
                    Notre équipe est disponible pour vous accompagner tout 
                    au long de votre parcours d'apprentissage.
                  </p>
                </div>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="d-flex">
                <div className="me-3">
                  <TrendingUp size={40} style={{ color: '#0dcaf0' }} />
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Contenu actualisé</h5>
                  <p className="text-muted mb-0">
                    Nos formations sont régulièrement mises à jour pour 
                    rester pertinentes avec les dernières tendances.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA - CORRIGÉ */}
      <section className="py-5 text-white" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Container>
          <div className="text-center">
            <h2 className="display-5 fw-bold mb-4 text-white">
              Rejoignez Notre Communauté
            </h2>
            <p className="lead mb-4 text-white">
              Faites partie de milliers d'apprenants qui transforment leur avenir
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Button 
                variant="light" 
                size="lg"
                onClick={() => navigate('/register')}
                className="px-5 py-2"
              >
                Commencer gratuitement
              </Button>
              <Button 
                variant="outline-light" 
                size="lg"
                onClick={() => navigate('/public/formations')}
                className="px-5 py-2"
              >
                Voir les formations
              </Button>
            </div>
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

export default AboutPage;