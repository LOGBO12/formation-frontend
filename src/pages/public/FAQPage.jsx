import { useState } from 'react';
import { Container, Row, Col, Card, Accordion, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, HelpCircle, MessageSquare, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAQPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      category: "Inscription et Compte",
      icon: "👤",
      questions: [
        {
          question: "Comment créer un compte ?",
          answer: "Cliquez sur 'Inscription' en haut à droite, remplissez le formulaire avec votre nom, email et mot de passe. Vous recevrez un email de confirmation pour activer votre compte."
        },
        {
          question: "J'ai oublié mon mot de passe, que faire ?",
          answer: "Cliquez sur 'Mot de passe oublié' sur la page de connexion. Entrez votre email et vous recevrez un lien pour réinitialiser votre mot de passe."
        },
        {
          question: "Puis-je modifier mon email ?",
          answer: "Oui, allez dans Paramètres > Profil pour modifier vos informations personnelles, y compris votre email."
        },
        {
          question: "Comment supprimer mon compte ?",
          answer: "Allez dans Paramètres > Compte > Supprimer mon compte. Cette action est irréversible et supprimera toutes vos données."
        }
      ]
    },
    {
      category: "Formations et Apprentissage",
      icon: "📚",
      questions: [
        {
          question: "Comment s'inscrire à une formation ?",
          answer: "Parcourez le catalogue, cliquez sur la formation qui vous intéresse, puis sur 'S'inscrire'. Pour les formations gratuites, l'accès est immédiat. Pour les payantes, vous devrez effectuer le paiement."
        },
        {
          question: "Les formations sont-elles accessibles à vie ?",
          answer: "Oui, une fois inscrit à une formation, vous y avez accès à vie. Vous pouvez apprendre à votre rythme et revenir quand vous voulez."
        },
        {
          question: "Puis-je télécharger les contenus ?",
          answer: "Les vidéos ne sont pas téléchargeables pour des raisons de droits d'auteur. Cependant, les PDF et documents peuvent être téléchargés."
        },
        {
          question: "Comment suivre ma progression ?",
          answer: "Allez dans 'Ma Progression' pour voir votre avancement dans chaque formation, les chapitres complétés et votre score aux quiz."
        },
        {
          question: "Y a-t-il des prérequis pour les formations ?",
          answer: "Chaque formation indique ses prérequis dans la description. Certaines sont pour débutants, d'autres nécessitent des connaissances préalables."
        }
      ]
    },
    {
      category: "Paiements",
      icon: "💳",
      questions: [
        {
          question: "Quels modes de paiement acceptez-vous ?",
          answer: "Nous acceptons les paiements via Mobile Money (MTN Money, Moov Money, Orange Money) et les cartes bancaires via notre système sécurisé."
        },
        {
          question: "Les paiements sont-ils sécurisés ?",
          answer: "Oui, tous les paiements sont traités via des passerelles sécurisées (FedaPay). Nous ne stockons aucune information bancaire."
        },
        {
          question: "Puis-je obtenir un remboursement ?",
          answer: "Oui, vous avez 7 jours pour demander un remboursement si la formation ne correspond pas à vos attentes. Contactez-nous via le formulaire de contact."
        },
        {
          question: "Y a-t-il des frais supplémentaires ?",
          answer: "Non, le prix affiché est le prix final. Aucun frais caché."
        },
        {
          question: "Puis-je payer en plusieurs fois ?",
          answer: "Actuellement, seul le paiement en une fois est disponible. Les options de paiement échelonné arriveront bientôt."
        }
      ]
    },
    {
      category: "Certificats",
      icon: "🎓",
      questions: [
        {
          question: "Comment obtenir mon certificat ?",
          answer: "Vous recevez automatiquement votre certificat une fois que vous avez complété 100% de la formation et réussi tous les quiz requis."
        },
        {
          question: "Les certificats sont-ils reconnus ?",
          answer: "Nos certificats attestent de vos compétences acquises. Ils sont reconnus par de nombreuses entreprises dans leurs processus de recrutement."
        },
        {
          question: "Puis-je partager mon certificat ?",
          answer: "Oui, vous pouvez télécharger votre certificat en PDF et le partager sur LinkedIn, dans votre CV ou portfolio."
        },
        {
          question: "Que se passe-t-il si j'échoue à un quiz ?",
          answer: "Vous pouvez repasser les quiz autant de fois que nécessaire jusqu'à obtenir la note de passage."
        }
      ]
    },
    {
      category: "Pour les Formateurs",
      icon: "👨‍🏫",
      questions: [
        {
          question: "Comment devenir formateur ?",
          answer: "Inscrivez-vous en choisissant le profil 'Formateur'. Complétez votre profil avec vos compétences et commencez à créer vos formations."
        },
        {
          question: "Combien puis-je gagner ?",
          answer: "Vous recevez 90% du prix de vente de vos formations. Les 10% restants couvrent les frais de plateforme et de paiement."
        },
        {
          question: "Comment sont effectués les paiements aux formateurs ?",
          answer: "Les revenus sont versés automatiquement sur votre compte Mobile Money à la fin de chaque mois."
        },
        {
          question: "Puis-je modifier ma formation après publication ?",
          answer: "Oui, vous pouvez mettre à jour le contenu de vos formations à tout moment. Les apprenants inscrits auront accès aux mises à jour."
        },
        {
          question: "Comment gérer mes apprenants ?",
          answer: "Vous avez accès à un tableau de bord avec la liste de vos apprenants, leur progression et leurs questions dans la communauté."
        }
      ]
    },
    {
      category: "Problèmes Techniques",
      icon: "⚙️",
      questions: [
        {
          question: "La vidéo ne se charge pas, que faire ?",
          answer: "Vérifiez votre connexion internet. Si le problème persiste, essayez de rafraîchir la page ou de changer de navigateur. Contactez-nous si cela continue."
        },
        {
          question: "Je ne reçois pas les emails de notification",
          answer: "Vérifiez vos spams/courriers indésirables. Ajoutez contact@elearning.com à vos contacts. Vous pouvez aussi désactiver/réactiver les notifications dans les paramètres."
        },
        {
          question: "L'application mobile est-elle disponible ?",
          answer: "Actuellement, nous proposons une version web responsive qui fonctionne sur mobile. Une application dédiée iOS et Android est en développement."
        },
        {
          question: "Puis-je utiliser la plateforme hors ligne ?",
          answer: "Non, une connexion internet est requise pour accéder aux contenus. Le mode hors ligne est prévu dans une future mise à jour."
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-vh-100 bg-light">
      {/* Hero Section - CORRIGÉ */}
      <section className="py-5 text-white" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Container className="py-4">
          <div className="text-center">
            <HelpCircle size={80} className="mb-3 text-white opacity-75" />
            <h1 className="display-4 fw-bold mb-3 text-white">Foire Aux Questions</h1>
            <p className="lead mb-4 text-white">
              Trouvez rapidement des réponses à vos questions
            </p>
            
            {/* Barre de recherche */}
            <Row className="justify-content-center">
              <Col lg={6}>
                <InputGroup size="lg" className="shadow">
                  <InputGroup.Text className="bg-white">
                    <Search size={20} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Rechercher une question..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0"
                  />
                </InputGroup>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      <Container className="py-5">
        {/* Stats */}
        <Row className="mb-5">
          <Col md={4} className="mb-3">
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="py-4">
                <h2 className="mb-1" style={{ color: '#0d6efd' }}>
                  {faqCategories.reduce((acc, cat) => acc + cat.questions.length, 0)}
                </h2>
                <small className="text-muted">Questions répondues</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="py-4">
                <h2 className="mb-1" style={{ color: '#198754' }}>{faqCategories.length}</h2>
                <small className="text-muted">Catégories</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="py-4">
                <h2 className="mb-1" style={{ color: '#0dcaf0' }}>24/7</h2>
                <small className="text-muted">Support disponible</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Catégories FAQ */}
        {filteredFAQs.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <HelpCircle size={64} className="mb-3" style={{ color: '#6c757d', opacity: 0.5 }} />
              <h5 className="text-muted">Aucune question trouvée</h5>
              <p className="text-muted">Essayez avec d'autres mots-clés</p>
            </Card.Body>
          </Card>
        ) : (
          filteredFAQs.map((category, catIndex) => (
            <div key={catIndex} className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-2">{category.icon}</span>
                <h3 className="mb-0 fw-bold">{category.category}</h3>
                <Badge bg="secondary" className="ms-3" style={{ backgroundColor: '#6c757d' }}>
                  {category.questions.length}
                </Badge>
              </div>
              
              <Accordion defaultActiveKey="0">
                {category.questions.map((faq, qIndex) => (
                  <Accordion.Item key={qIndex} eventKey={qIndex.toString()}>
                    <Accordion.Header>
                      <strong>{faq.question}</strong>
                    </Accordion.Header>
                    <Accordion.Body className="bg-light">
                      <p className="mb-0">{faq.answer}</p>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          ))
        )}

        {/* Section Aide Supplémentaire */}
        <Row className="mt-5">
          <Col md={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100 hover-shadow">
              <Card.Body className="p-4 text-center">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ 
                    width: 80, 
                    height: 80,
                    backgroundColor: '#0d6efd20'
                  }}
                >
                  <MessageSquare size={40} style={{ color: '#0d6efd' }} />
                </div>
                <h5 className="fw-bold mb-3">Besoin d'aide supplémentaire ?</h5>
                <p className="text-muted mb-4">
                  Notre équipe est disponible pour répondre à vos questions spécifiques.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/contact')}
                  style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}
                >
                  Nous contacter
                </button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100 hover-shadow">
              <Card.Body className="p-4 text-center">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ 
                    width: 80, 
                    height: 80,
                    backgroundColor: '#19875420'
                  }}
                >
                  <Mail size={40} style={{ color: '#198754' }} />
                </div>
                <h5 className="fw-bold mb-3">Support par Email</h5>
                <p className="text-muted mb-4">
                  Envoyez-nous un email et nous vous répondrons dans les 24h.
                </p>
                <a 
                  href="mailto:support@elearning.com"
                  className="btn btn-success"
                  style={{ backgroundColor: '#198754', borderColor: '#198754' }}
                >
                  support@elearning.com
                </a>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .hover-shadow {
          transition: all 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default FAQPage;