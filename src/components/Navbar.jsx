import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { 
  Home, 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  User,
  Bell,
  MessageSquare,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const NavbarComponent = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications] = useState(0); // À implémenter plus tard

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      logout();
      toast.success('Déconnexion réussie');
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      logout();
      navigate('/login');
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'super_admin':
        return '/dashboard/admin';
      case 'formateur':
        return '/dashboard/formateur';
      case 'apprenant':
        return '/dashboard/apprenant';
      default:
        return '/';
    }
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      // Dans getNavLinks(), section super_admin:
        case 'super_admin':
        return [
            { to: '/dashboard/admin', icon: Home, label: 'Dashboard' },
            { to: '/admin/domaines', icon: Settings, label: 'Domaines' },
            { to: '/admin/utilisateurs', icon: Users, label: 'Utilisateurs' },
            { to: '/admin/formations', icon: BookOpen, label: 'Formations' },
        ];
      
      case 'formateur':
        return [
          { to: '/dashboard/formateur', icon: Home, label: 'Dashboard' },
          { to: '/formateur/formations', icon: BookOpen, label: 'Mes Formations' },
          { to: '/formateur/apprenants', icon: Users, label: 'Apprenants' },
          { to: '/formateur/statistiques', icon: BarChart3, label: 'Statistiques' },
        ];
      
      case 'apprenant':
        return [
          { to: '/dashboard/apprenant', icon: Home, label: 'Dashboard' },
          { to: '/apprenant/formations', icon: BookOpen, label: 'Mes Formations' },
          { to: '/apprenant/progression', icon: GraduationCap, label: 'Ma Progression' },
          { to: '/apprenant/communautes', icon: MessageSquare, label: 'Communautés' },
        ];
      
      default:
        return [];
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'super_admin':
        return 'danger';
      case 'formateur':
        return 'success';
      case 'apprenant':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'super_admin':
        return 'Administrateur';
      case 'formateur':
        return 'Formateur';
      case 'apprenant':
        return 'Apprenant';
      default:
        return 'Utilisateur';
    }
  };

  if (!user) {
    return null;
  }

  const navLinks = getNavLinks();

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm border-bottom sticky-top">
      <Container fluid>
        {/* Logo / Brand */}
        <Navbar.Brand 
          as={Link} 
          to={getDashboardPath()} 
          className="fw-bold text-success d-flex align-items-center"
        >
          <GraduationCap size={28} className="me-2" />
          <span className="d-none d-md-inline">E-Learning Platform</span>
          <span className="d-inline d-md-none">E-LP</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />
        
        <Navbar.Collapse id="main-navbar">
          {/* Navigation Links */}
          <Nav className="me-auto">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Nav.Link
                  key={index}
                  as={Link}
                  to={link.to}
                  className="d-flex align-items-center mx-2"
                >
                  <Icon size={18} className="me-2" />
                  {link.label}
                </Nav.Link>
              );
            })}
          </Nav>

          {/* Right Side */}
          <Nav className="align-items-lg-center">
            {/* Notifications */}
            <Nav.Link className="position-relative">
              <Bell size={20} />
              {notifications > 0 && (
                <Badge 
                  bg="danger" 
                  pill 
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.65rem' }}
                >
                  {notifications}
                </Badge>
              )}
            </Nav.Link>

            {/* User Dropdown */}
            <NavDropdown
              title={
                <div className="d-inline-flex align-items-center">
                  <div 
                    className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white me-2"
                    style={{ width: 35, height: 35 }}
                  >
                    <User size={18} />
                  </div>
                  <div className="d-none d-lg-block text-start">
                    <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                      {user.name}
                    </div>
                    <Badge bg={getRoleBadgeColor()} style={{ fontSize: '0.65rem' }}>
                      {getRoleLabel()}
                    </Badge>
                  </div>
                </div>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/profile">
                <User size={16} className="me-2" />
                Mon Profil
              </NavDropdown.Item>
              
              <NavDropdown.Item as={Link} to="/settings">
                <Settings size={16} className="me-2" />
                Paramètres
              </NavDropdown.Item>
              
              <NavDropdown.Divider />
              
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <LogOut size={16} className="me-2" />
                Déconnexion
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;