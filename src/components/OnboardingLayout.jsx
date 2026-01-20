import { Container, Row, Col, ProgressBar } from 'react-bootstrap';
import { GraduationCap, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OnboardingLayout = ({ children, currentStep }) => {
  const { user } = useAuth();

  const steps = [
    { id: 'role', label: 'Choisir votre rôle', step: 1 },
    { id: 'profile', label: 'Compléter votre profil', step: 2 },
    { id: 'privacy_policy', label: 'Politique de confidentialité', step: 3 },
  ];

  const getCurrentStepNumber = () => {
    const step = steps.find(s => s.id === currentStep);
    return step ? step.step : 1;
  };

  const currentStepNumber = getCurrentStepNumber();
  const progress = (currentStepNumber / steps.length) * 100;

  const isStepCompleted = (stepNumber) => {
    return stepNumber < currentStepNumber;
  };

  const isStepCurrent = (stepId) => {
    return stepId === currentStep;
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Header */}
      <nav className="navbar navbar-light bg-white shadow-sm">
        <Container>
          <div className="navbar-brand d-flex align-items-center">
            <GraduationCap size={32} className="text-success me-2" />
            <span className="fw-bold text-success">E-Learning Platform</span>
          </div>
          {user && (
            <div className="text-muted">
              Bienvenue, <strong>{user.name}</strong>
            </div>
          )}
        </Container>
      </nav>

      {/* Progress Steps */}
      <div className="bg-white shadow-sm py-4">
        <Container>
          {/* Progress Bar */}
          <div className="mb-4">
            <ProgressBar 
              now={progress} 
              variant="success" 
              style={{ height: '8px' }}
              className="rounded-pill"
            />
          </div>

          {/* Steps */}
          <Row className="justify-content-center">
            {steps.map((step, index) => (
              <Col key={step.id} xs={12} md={4} className="mb-3 mb-md-0">
                <div className="d-flex align-items-center">
                  {/* Step Circle */}
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                      isStepCompleted(step.step)
                        ? 'bg-success text-white'
                        : isStepCurrent(step.id)
                        ? 'bg-primary text-white'
                        : 'bg-light text-muted'
                    }`}
                    style={{
                      width: '40px',
                      height: '40px',
                      fontWeight: 'bold',
                      border: isStepCurrent(step.id) ? '3px solid #0d6efd' : 'none',
                    }}
                  >
                    {isStepCompleted(step.step) ? (
                      <CheckCircle size={20} />
                    ) : (
                      step.step
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="flex-grow-1">
                    <div
                      className={`${
                        isStepCurrent(step.id)
                          ? 'fw-bold text-primary'
                          : isStepCompleted(step.step)
                          ? 'text-success'
                          : 'text-muted'
                      }`}
                      style={{ fontSize: '0.9rem' }}
                    >
                      Étape {step.step}
                    </div>
                    <div
                      className={`${
                        isStepCurrent(step.id) || isStepCompleted(step.step)
                          ? 'fw-semibold'
                          : 'text-muted'
                      }`}
                      style={{ fontSize: '0.85rem' }}
                    >
                      {step.label}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} xl={6}>
              {children}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Footer */}
      <footer className="bg-white border-top py-3">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
              <small className="text-muted">
                © {new Date().getFullYear()} E-Learning Platform. Tous droits réservés.
              </small>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <small className="text-muted">
                Besoin d'aide ? <a href="/contact" className="text-success text-decoration-none">Contactez-nous</a>
              </small>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default OnboardingLayout;