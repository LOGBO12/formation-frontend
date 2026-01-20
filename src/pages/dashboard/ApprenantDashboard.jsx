import { useState } from 'react';
import { Container, Row, Col, Card, Button, Nav, ProgressBar } from 'react-bootstrap';
import { BookOpen, Award, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ApprenantDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('mycourses');

  return (
    <div className="min-vh-100 bg-light">

      <Container fluid className="py-4">
        {/* Welcome Banner */}
        <Card className="bg-gradient mb-4 border-0 text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Card.Body className="p-4">
            <h3 className="mb-2">Bienvenue, {user?.name} ! 📚</h3>
            <p className="mb-0">Continuez votre apprentissage là où vous l'avez laissé</p>
          </Card.Body>
        </Card>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                    <BookOpen className="text-info" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Formations en cours</h6>
                    <h4 className="mb-0">0</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                    <Award className="text-success" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Formations complétées</h6>
                    <h4 className="mb-0">0</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                    <Clock className="text-warning" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Heures d'apprentissage</h6>
                    <h4 className="mb-0">0h</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <TrendingUp className="text-primary" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Progression moyenne</h6>
                    <h4 className="mb-0">0%</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Navigation Tabs */}
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link active={activeTab === 'mycourses'} onClick={() => setActiveTab('mycourses')}>
              Mes Formations
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')}>
              Catalogue
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeTab === 'progress'} onClick={() => setActiveTab('progress')}>
              Ma Progression
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Content Area */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-5">
            <div className="text-center text-muted">
              <BookOpen size={64} className="mb-3 opacity-50" />
              <h4>Commencez votre voyage d'apprentissage</h4>
              <p className="mb-4">Explorez notre catalogue et trouvez la formation parfaite pour vous !</p>
              <Button variant="info" size="lg">
                Explorer le catalogue
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Domaines d'intérêt */}
        {user?.domaines && user.domaines.length > 0 && (
          <Card className="border-0 shadow-sm mt-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Vos domaines d'intérêt</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                {user.domaines.map((domaine) => (
                  <span key={domaine.id} className="badge bg-info fs-6 px-3 py-2">
                    {domaine.name}
                  </span>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Recommandations */}
        <Card className="border-0 shadow-sm mt-4">
          <Card.Header className="bg-white">
            <h5 className="mb-0">Formations recommandées pour vous</h5>
          </Card.Header>
          <Card.Body>
            <p className="text-muted text-center py-4">
              Aucune formation disponible pour le moment
            </p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ApprenantDashboard;