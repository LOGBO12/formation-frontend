import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { GraduationCap } from 'lucide-react';

const PublicNavbar = () => {
  return (
    <Navbar bg="white" expand="lg" className="shadow-sm sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-success d-flex align-items-center">
          <GraduationCap size={32} className="me-2" />
          <span>E-Learning Platform</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="public-navbar" />
        
        <Navbar.Collapse id="public-navbar">
          <Nav className="ms-auto align-items-lg-center">
            <Nav.Link as={Link} to="/" className="mx-2">
              Accueil
            </Nav.Link>
            <Nav.Link href="#formations" className="mx-2">
              Formations
            </Nav.Link>
            <Nav.Link href="#about" className="mx-2">
              À propos
            </Nav.Link>
            <Nav.Link href="#contact" className="mx-2">
              Contact
            </Nav.Link>
            
            <div className="d-flex gap-2 ms-lg-3 mt-3 mt-lg-0">
              <Button 
                as={Link} 
                to="/login" 
                variant="outline-success"
                className="px-4"
              >
                Connexion
              </Button>
              <Button 
                as={Link} 
                to="/register" 
                variant="success"
                className="px-4"
              >
                Inscription
              </Button>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default PublicNavbar;