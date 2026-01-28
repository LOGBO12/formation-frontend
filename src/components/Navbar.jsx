import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { CreditCard, DollarSign, Mail } from 'lucide-react';
import { 
  Home, 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  User,
  MessageSquare,
  GraduationCap,
  FolderOpen,
  UserCheck,
  TrendingUp,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import api from '../api/axios';
import toast from 'react-hot-toast';

const NavbarComponent = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications] = useState(0);

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
      case 'super_admin':
        return [
          { to: '/dashboard/admin', icon: Home, label: 'Dashboard' },
          { to: '/admin/domaines', icon: FolderOpen, label: 'Domaines' },
          { to: '/admin/utilisateurs', icon: Users, label: 'Utilisateurs' },
          { to: '/admin/formations', icon: BookOpen, label: 'Formations' },
          { to: '/admin/contacts', icon: MessageSquare, label: 'Messages' },
          { to: '/admin/newsletter', icon: Mail, label: 'Newsletter' },
          { to: '/admin/revenus', icon: DollarSign, label: 'Revenus' },
        ];
      
      case 'formateur':
        return [
          { to: '/dashboard/formateur', icon: Home, label: 'Dashboard' },
          { to: '/formateur/formations', icon: BookOpen, label: 'Mes Formations' },
          { to: '/formateur/apprenants', icon: UserCheck, label: 'Apprenants' },
          { to: '/formateur/statistiques', icon: BarChart3, label: 'Statistiques' },
          { to: '/formateur/communautes', icon: MessageSquare, label: 'Communautés' },
          { to: '/formateur/revenus', icon: DollarSign, label: 'Revenus' },
        ];
      
      case 'apprenant':
        return [
          { to: '/dashboard/apprenant', icon: Home, label: 'Dashboard' },
          { to: '/apprenant/mes-formations', icon: BookOpen, label: 'Mes Formations' },
          { to: '/apprenant/catalogue', icon: Search, label: 'Catalogue' },
          { to: '/apprenant/progression', icon: TrendingUp, label: 'Ma Progression' },
          { to: '/apprenant/communautes', icon: MessageSquare, label: 'Communautés' },
          { to: '/apprenant/paiements', icon: CreditCard, label: 'Paiements' },
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

  const getProfilePhotoUrl = () => {
    if (user?.profile?.photo) {
      return `${import.meta.env.VITE_API_URL}/storage/${user.profile.photo}`;
    }
    return null;
  };

  const UserAvatar = ({ size = 35 }) => {
    const photoUrl = getProfilePhotoUrl();
    
    if (photoUrl) {
      return (
        <div
          className="rounded-circle overflow-hidden me-2"
          style={{ 
            width: size, 
            height: size,
            minWidth: size,
            minHeight: size,
          }}
        >
          <img
            src={photoUrl}
            alt={user.name}
            className="w-100 h-100"
            style={{ 
              objectFit: 'cover',
              objectPosition: 'center'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div 
            className="bg-primary rounded-circle d-none align-items-center justify-content-center text-white"
            style={{ width: size, height: size }}
          >
            <User size={18} />
          </div>
        </div>
      );
    }

    return (
      <div 
        className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white me-2"
        style={{ width: size, height: size }}
      >
        <User size={18} />
      </div>
    );
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
            {/* Notifications Dropdown */}
            <NotificationDropdown />

            {/* User Dropdown avec Avatar */}
            <NavDropdown
              title={
                <div className="d-inline-flex align-items-center">
                  <UserAvatar size={35} />
                  
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