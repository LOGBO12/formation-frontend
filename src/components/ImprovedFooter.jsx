import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
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
import api from '../api/axios';
import toast from 'react-hot-toast';

const ImprovedFooter = () => {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const footerLinks = {
    plateforme: [
      { label: 'À propos', to: '/about' },
      { label: 'Comment ça marche', to: '/how-it-works' },
      { label: 'Formations', to: '/public/formations' },
      { label: 'Blog', to: '#' }, // À implémenter plus tard
    ],
    support: [
      { label: 'Centre d\'aide', to: '/faq' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Nous contacter', to: '/contact' },
      { label: 'Signaler un problème', to: '#' }, // À implémenter plus tard
    ],
    legal: [
      { label: 'Conditions d\'utilisation', to: '#' }, // À implémenter plus tard
      { label: 'Politique de confidentialité', to: '#' }, // À implémenter plus tard
      { label: 'Politique de cookies', to: '#' }, // À implémenter plus tard
      { label: 'Mentions légales', to: '#' }, // À implémenter plus tard
    ],
  };

  const socialLinks = [
    { icon: Facebook, url: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, url: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Instagram, url: 'https://instagram.com', label: 'Instagram' },
  ];

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!newsletterEmail) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    setNewsletterLoading(true);

    try {
      const response = await api.post('/public/newsletter/subscribe', {
        email: newsletterEmail
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setNewsletterEmail('');
      }
    } catch (error) {
      console.error('Erreur newsletter:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setNewsletterLoading(false);
    }
  };

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
                  {link.to === '#' ? (
                    <a 
                      href={link.to}
                      className="text-white-50 text-decoration-none hover-text-success"
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info('Cette page sera bientôt disponible');
                      }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link 
                      to={link.to} 
                      className="text-white-50 text-decoration-none hover-text-success"
                    >
                      {link.label}
                    </Link>
                  )}
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
                  {link.to === '#' ? (
                    <a 
                      href={link.to}
                      className="text-white-50 text-decoration-none hover-text-success"
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info('Cette page sera bientôt disponible');
                      }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link 
                      to={link.to} 
                      className="text-white-50 text-decoration-none hover-text-success"
                    >
                      {link.label}
                    </Link>
                  )}
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
                  <a 
                    href={link.to}
                    className="text-white-50 text-decoration-none hover-text-success"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('Cette page sera bientôt disponible');
                    }}
                  >
                    {link.label}
                  </a>
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
            <Form onSubmit={handleNewsletterSubmit}>
              <div className="input-group mb-2">
                <input 
                  type="email" 
                  className="form-control form-control-sm" 
                  placeholder="Votre email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  disabled={newsletterLoading}
                />
              </div>
              <button 
                className="btn btn-success btn-sm w-100"
                type="submit"
                disabled={newsletterLoading}
              >
                {newsletterLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    Envoi...
                  </>
                ) : (
                  "S'abonner"
                )}
              </button>
            </Form>
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