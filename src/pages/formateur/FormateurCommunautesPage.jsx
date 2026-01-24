import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Badge, InputGroup, Form, Alert } from 'react-bootstrap';
import { MessageSquare, Users, Shield, Search, Eye, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FormateurCommunautesPage = () => {
  const navigate = useNavigate();
  const [communautes, setCommunautes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCommunautes();
  }, []);

  const fetchCommunautes = async () => {
    try {
      console.log('🔵 Fetching communautés formateur...');
      const response = await api.get('/formateur/mes-communautes');
      
      console.log('✅ Réponse API:', response.data);
      
      if (response.data.success) {
        setCommunautes(response.data.communautes);
        console.log('📊 Communautés chargées:', response.data.communautes.length);
      } else {
        setError('Erreur lors du chargement');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      console.error('❌ Response:', error.response);
      setError(error.response?.data?.message || 'Erreur lors du chargement');
      toast.error('Erreur lors du chargement des communautés');
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunautes = communautes.filter(c =>
    c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.formation?.titre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Container fluid className="py-4">
        <div className="mb-4">
          <h3 className="fw-bold mb-1">Mes Communautés</h3>
          <p className="text-muted mb-0">Gérez les communautés de vos formations</p>
        </div>

        {/* Alert d'erreur */}
        {error && (
          <Alert variant="danger" className="mb-4">
            <AlertCircle size={20} className="me-2" />
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={4} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <MessageSquare className="text-primary" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Total</h6>
                    <h3 className="mb-0">{communautes.length}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                    <Users className="text-success" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Total Membres</h6>
                    <h3 className="mb-0">
                      {communautes.reduce((sum, c) => sum + (c.total_membres || 0), 0)}
                    </h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                    <Shield className="text-warning" size={32} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Messages</h6>
                    <h3 className="mb-0">
                      {communautes.reduce((sum, c) => sum + (c.total_messages || 0), 0)}
                    </h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Search */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <InputGroup>
              <InputGroup.Text>
                <Search size={18} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Rechercher une communauté..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Card.Body>
        </Card>

        {/* Liste des communautés */}
        <Card className="border-0 shadow-sm">
          <Card.Body>
            {filteredCommunautes.length === 0 ? (
              <div className="text-center py-5">
                <MessageSquare size={64} className="mb-3 opacity-50" />
                <h4>Aucune communauté</h4>
                <p className="text-muted">
                  {communautes.length === 0 
                    ? "Les communautés sont créées automatiquement lorsque des apprenants s'inscrivent à vos formations."
                    : "Aucune communauté ne correspond à votre recherche."}
                </p>
              </div>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Communauté</th>
                    <th>Formation</th>
                    <th>Membres</th>
                    <th>Messages</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommunautes.map((communaute) => (
                    <tr key={communaute.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white me-3"
                            style={{ width: 40, height: 40 }}
                          >
                            <MessageSquare size={20} />
                          </div>
                          <div>
                            <strong>{communaute.nom}</strong>
                            {communaute.description && (
                              <div className="text-muted small">
                                {communaute.description.substring(0, 50)}
                                {communaute.description.length > 50 && '...'}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-semibold">{communaute.formation?.titre}</span>
                        <div className="text-muted small">
                          {communaute.formation?.domaine}
                        </div>
                      </td>
                      <td>
                        <Badge bg="success" className="fs-6">
                          <Users size={14} className="me-1" />
                          {communaute.total_membres || 0}
                        </Badge>
                      </td>
                      <td>
                        <span className="text-muted">
                          {communaute.total_messages || 0}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/communaute/${communaute.id}`)}
                            title="Voir la communauté"
                          >
                            <Eye size={16} className="me-1" />
                            Voir
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => navigate(`/formateur/communaute/${communaute.id}/moderation`)}
                            title="Modération"
                          >
                            <Shield size={16} className="me-1" />
                            Modérer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Info Box */}
        <Card className="border-0 shadow-sm bg-light mt-4">
          <Card.Body>
            <h6 className="fw-bold mb-3">💡 À propos des communautés</h6>
            <ul className="mb-0">
              <li className="mb-2">Les communautés sont créées automatiquement lors de la première inscription à vos formations</li>
              <li className="mb-2">Vous êtes automatiquement administrateur de toutes vos communautés</li>
              <li className="mb-2">Utilisez la modération pour gérer les membres et maintenir un environnement sain</li>
              <li>Les apprenants peuvent échanger librement dans un espace dédié à chaque formation</li>
            </ul>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default FormateurCommunautesPage;