import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  GraduationCap 
} from 'lucide-react';

const ImprovedFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    plateforme: [
      { label: 'À propos', to: '/about' },
      { label: 'Comment ça marche', to: '/how-it-works' },
      { label: 'Devenir formateur', to: '/become-instructor' },
      { label: 'Blog', to: '/blog' },
    ],
    support: [
      { label: 'Centre d\'aide', to: '/help' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Nous contacter', to: '/contact' },
      { label: 'Signaler un problème', to: '/report' },
    ],
    legal: [
      { label: 'Conditions d\'utilisation', to: '/terms' },
      { label: 'Politique de confidentialité', to: '/privacy' },
      { label: 'Politique de cookies', to: '/cookies' },
      { label: 'Mentions légales', to: '/legal' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, url: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, url: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Instagram, url: 'https://instagram.com', label: 'Instagram' },
  ];

  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-auto">
      <Container>
        {/* Main Footer Content */}
        <Row className="mb-4">
          {/* Brand & Description */}
          <Col lg={4} md={6} className="mb-4">
            <div className="d-flex align-items-center mb-3">
              <GraduationCap size={32} className="text-success me-2" />
              <h5 className="mb-0 fw-bold">E-Learning Platform</h5>
            </div>
            <p className="text-white-50 mb-3">
              La plateforme qui connecte les formateurs passionnés aux apprenants 
              motivés. Apprenez à votre rythme, développez vos compétences.
            </p>
            
            {/* Contact Info */}
            <div className="mb-2">
              <Mail size={16} className="me-2 text-success" />
              <a href="mailto:contact@elearning.com" className="text-white-50 text-decoration-none hover-text-success">
                contact@elearning.com
              </a>
            </div>
            <div className="mb-2">
              <Phone size={16} className="me-2 text-success" />
              <a href="tel:+22900000000" className="text-white-50 text-decoration-none hover-text-success">
                +229 00 00 00 00
              </a>
            </div>
            <div>
              <MapPin size={16} className="me-2 text-success" />
              <span className="text-white-50">Cotonou, Bénin</span>
            </div>
          </Col>

          {/* La Plateforme */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="fw-bold mb-3">La Plateforme</h6>
            <ul className="list-unstyled">
              {footerLinks.plateforme.map((link, index) => (
                <li key={index} className="mb-2">
                  <Link 
                    to={link.to} 
                    className="text-white-50 text-decoration-none hover-text-success"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Support */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="fw-bold mb-3">Support</h6>
            <ul className="list-unstyled">
              {footerLinks.support.map((link, index) => (
                <li key={index} className="mb-2">
                  <Link 
                    to={link.to} 
                    className="text-white-50 text-decoration-none hover-text-success"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Légal */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="fw-bold mb-3">Légal</h6>
            <ul className="list-unstyled">
              {footerLinks.legal.map((link, index) => (
                <li key={index} className="mb-2">
                  <Link 
                    to={link.to} 
                    className="text-white-50 text-decoration-none hover-text-success"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Newsletter */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="fw-bold mb-3">Newsletter</h6>
            <p className="text-white-50 small mb-3">
              Restez informé de nos nouveautés et formations.
            </p>
            <form>
              <div className="input-group mb-2">
                <input 
                  type="email" 
                  className="form-control form-control-sm" 
                  placeholder="Votre email" 
                />
              </div>
              <button className="btn btn-success btn-sm w-100">
                S'abonner
              </button>
            </form>
          </Col>
        </Row>

        {/* Divider */}
        <hr className="border-secondary" />

        {/* Bottom Footer */}
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
            <p className="text-white-50 mb-0 small">
              © {currentYear} E-Learning Platform. Tous droits réservés.
            </p>
          </Col>
          
          <Col md={6} className="text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white-50 hover-text-success"
                    aria-label={social.label}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Custom CSS for hover effect */}
      <style>{`
        .hover-text-success:hover {
          color: #28a745 !important;
          transition: color 0.3s ease;
        }
      `}</style>
    </footer>
  );
};

export default ImprovedFooter;