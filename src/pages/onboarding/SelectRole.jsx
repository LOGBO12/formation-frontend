import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { GraduationCap, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const SelectRole = () => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      value: 'formateur',
      title: 'Formateur',
      description: 'Je souhaite créer et vendre des formations',
      icon: GraduationCap,
      color: 'primary',
    },
    {
      value: 'apprenant',
      title: 'Apprenant',
      description: 'Je veux apprendre et suivre des formations',
      icon: Users,
      color: 'success',
    },
  ];

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error('Veuillez sélectionner un rôle');
      return;
    }

    setLoading(true);

    try {
      await api.post('/onboarding/select-role', { role: selectedRole });
      await fetchUser();
      toast.success('Rôle sélectionné avec succès !');
      navigate('/onboarding/profile');
    } catch (err) {
      toast.error('Erreur lors de la sélection du rôle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3">Bienvenue sur e-Learning ! 🎉</h2>
          <p className="text-muted fs-5">Pour commencer, choisissez votre profil</p>
          <div className="d-flex justify-content-center mt-4">
            <div className="bg-primary rounded-circle me-2" style={{ width: 10, height: 10 }}></div>
            <div className="bg-secondary rounded-circle me-2" style={{ width: 10, height: 10 }}></div>
            <div className="bg-secondary rounded-circle" style={{ width: 10, height: 10 }}></div>
          </div>
        </div>

        <Row className="justify-content-center g-4">
          {roles.map((role) => (
            <Col md={5} key={role.value}>
              <Card
                className={`h-100 border-3 cursor-pointer transition ${
                  selectedRole === role.value
                    ? `border-${role.color} shadow-lg`
                    : 'border-light'
                }`}
                style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                onClick={() => setSelectedRole(role.value)}
              >
                <Card.Body className="text-center p-5">
                  <div
                    className={`bg-${role.color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4`}
                    style={{ width: 100, height: 100 }}
                  >
                    <role.icon size={50} className={`text-${role.color}`} />
                  </div>
                  <h3 className="fw-bold mb-3">{role.title}</h3>
                  <p className="text-muted fs-5">{role.description}</p>
                  {selectedRole === role.value && (
                    <div className="mt-3">
                      <span className={`badge bg-${role.color} fs-6`}>Sélectionné ✓</span>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="text-center mt-5">
          <Button
            variant="primary"
            size="lg"
            className="px-5 py-3"
            onClick={handleSubmit}
            disabled={!selectedRole || loading}
          >
            {loading ? 'Chargement...' : 'Continuer'}
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default SelectRole;