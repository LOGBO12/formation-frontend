import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { User, Mail, Shield, Calendar, Save, Edit2, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        photo: null,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'photo' && files && files[0]) {
      setFormData(prev => ({ ...prev, photo: files[0] }));
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('bio', formData.bio);
      
      if (formData.photo) {
        data.append('photo', formData.photo);
      }

      const response = await api.post('/profile/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(response.data.user);
      toast.success('Profil mis à jour avec succès !');
      setEditing(false);
      setPhotoPreview(null);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = () => {
    const badges = {
      super_admin: { bg: 'danger', label: 'Administrateur' },
      formateur: { bg: 'success', label: 'Formateur' },
      apprenant: { bg: 'primary', label: 'Apprenant' },
    };
    return badges[user?.role] || { bg: 'secondary', label: 'Utilisateur' };
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="min-vh-100 bg-light">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2">Mon Profil</h2>
              <p className="text-muted">Gérez vos informations personnelles</p>
            </div>

            {/* Profile Card */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                {/* Photo de profil */}
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    <div 
                      className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white mb-3"
                      style={{ 
                        width: 120, 
                        height: 120,
                        backgroundImage: photoPreview || user?.profile?.photo 
                          ? `url(${photoPreview || `${import.meta.env.VITE_API_URL}/storage/${user.profile.photo}`})` 
                          : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!photoPreview && !user?.profile?.photo && (
                        <User size={48} />
                      )}
                    </div>
                    {editing && (
                      <label 
                        htmlFor="photo-upload"
                        className="position-absolute bottom-0 end-0 bg-white rounded-circle p-2 shadow-sm cursor-pointer"
                        style={{ cursor: 'pointer' }}
                      >
                        <Camera size={20} className="text-primary" />
                        <input
                          id="photo-upload"
                          type="file"
                          name="photo"
                          accept="image/*"
                          onChange={handleChange}
                          className="d-none"
                        />
                      </label>
                    )}
                  </div>
                  <h4 className="mb-1">{user?.name}</h4>
                  <Badge bg={roleBadge.bg} className="mb-2">{roleBadge.label}</Badge>
                  <p className="text-muted mb-0">{user?.email}</p>
                </div>

                <hr className="my-4" />

                {/* Informations générales */}
                <Form onSubmit={handleSubmit}>
                  <Row className="mb-4">
                    <Col md={6} className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <User size={18} className="text-muted me-2" />
                        <strong>Nom complet</strong>
                      </div>
                      {editing ? (
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      ) : (
                        <p className="text-muted mb-0 ps-4">{user?.name}</p>
                      )}
                    </Col>

                    <Col md={6} className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <Mail size={18} className="text-muted me-2" />
                        <strong>Email</strong>
                      </div>
                      <p className="text-muted mb-0 ps-4">{user?.email}</p>
                      <small className="text-muted ps-4">Non modifiable</small>
                    </Col>

                    <Col md={6} className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <Shield size={18} className="text-muted me-2" />
                        <strong>Rôle</strong>
                      </div>
                      <div className="ps-4">
                        <Badge bg={roleBadge.bg}>{roleBadge.label}</Badge>
                      </div>
                    </Col>

                    <Col md={6} className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <Calendar size={18} className="text-muted me-2" />
                        <strong>Membre depuis</strong>
                      </div>
                      <p className="text-muted mb-0 ps-4">
                        {new Date(user?.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </Col>

                    <Col md={12}>
                      <div className="d-flex align-items-center mb-2">
                        <Edit2 size={18} className="text-muted me-2" />
                        <strong>Bio</strong>
                      </div>
                      {editing ? (
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="Parlez-nous de vous..."
                          className="ps-4"
                        />
                      ) : (
                        <p className="text-muted mb-0 ps-4">
                          {user?.profile?.bio || 'Aucune bio renseignée'}
                        </p>
                      )}
                    </Col>
                  </Row>

                  {/* Domaines d'intérêt */}
                  {user?.domaines && user.domaines.length > 0 && (
                    <div className="mb-4">
                      <strong className="d-block mb-2">Domaines d'intérêt</strong>
                      <div className="d-flex flex-wrap gap-2 ps-4">
                        {user.domaines.map((domaine) => (
                          <Badge key={domaine.id} bg="info" className="px-3 py-2">
                            {domaine.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Niveau d'expérience */}
                  {user?.profile?.experience_level && (
                    <div className="mb-4">
                      <strong className="d-block mb-2">Niveau d'expérience</strong>
                      <div className="ps-4">
                        <Badge bg="secondary" className="px-3 py-2 text-capitalize">
                          {user.profile.experience_level}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="d-flex gap-2 justify-content-end">
                    {editing ? (
                      <>
                        <Button
                          variant="outline-secondary"
                          onClick={() => {
                            setEditing(false);
                            setPhotoPreview(null);
                            setFormData({
                              name: user.name || '',
                              email: user.email || '',
                              bio: user.profile?.bio || '',
                              photo: null,
                            });
                          }}
                          disabled={loading}
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <Save size={18} className="me-2" />
                              Enregistrer
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => setEditing(true)}
                      >
                        <Edit2 size={18} className="me-2" />
                        Modifier le profil
                      </Button>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Statistiques selon le rôle */}
            {user?.role === 'formateur' && (
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Mes Statistiques</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4} className="text-center mb-3 mb-md-0">
                      <h3 className="text-success mb-0">
                        {user?.totalFormations || 0}
                      </h3>
                      <small className="text-muted">Formations créées</small>
                    </Col>
                    <Col md={4} className="text-center mb-3 mb-md-0">
                      <h3 className="text-primary mb-0">
                        {user?.totalApprenants || 0}
                      </h3>
                      <small className="text-muted">Apprenants</small>
                    </Col>
                    <Col md={4} className="text-center">
                      <h3 className="text-warning mb-0">
                        {user?.totalRevenus || 0} FCFA
                      </h3>
                      <small className="text-muted">Revenus totaux</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {user?.role === 'apprenant' && (
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Mes Statistiques</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4} className="text-center mb-3 mb-md-0">
                      <h3 className="text-info mb-0">
                        {user?.formationsEnCours || 0}
                      </h3>
                      <small className="text-muted">Formations en cours</small>
                    </Col>
                    <Col md={4} className="text-center mb-3 mb-md-0">
                      <h3 className="text-success mb-0">
                        {user?.formationsTerminees || 0}
                      </h3>
                      <small className="text-muted">Formations terminées</small>
                    </Col>
                    <Col md={4} className="text-center">
                      <h3 className="text-primary mb-0">
                        {user?.progressionMoyenne || 0}%
                      </h3>
                      <small className="text-muted">Progression moyenne</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfilePage;