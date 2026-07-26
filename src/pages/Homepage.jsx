import { Link } from 'react-router-dom';
import { 
  HeartPulse, 
  Calendar, 
  MessageSquare, 
  ShieldCheck, 
  Stethoscope, 
  Activity, 
  ChevronRight, 
  Star 
} from 'lucide-react';
import heroBg from '../assets/hero-bg.png';
import aiVetImg from '../assets/ai-vet.png';
import ctaPetsImg from '../assets/cta-pets.png';

function Homepage() {
  return (
    <div className="homepage-shell">
      <main>
        {/* Hero Section */}
        <section className="hero-grid simple-hero" style={{ 
          marginTop: '20px', 
          paddingTop: '80px',
          paddingBottom: '100px',
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.6)), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '32px'
        }}>
          <div className="hero-copy hero-copy-centered">
            <div className="pill-badge" style={{ marginBottom: '24px', backgroundColor: 'rgba(255, 240, 242, 0.9)', color: '#ff5a79', border: '1px solid #ffd1d9', backdropFilter: 'blur(4px)' }}>
              <span>✨</span>
              <span>Meet Your New Pet Care Assistant</span>
            </div>

            <h1 style={{ fontSize: '4.5rem', fontWeight: '900', marginBottom: '24px', color: '#0d1b2a', lineHeight: '1.1', textShadow: '0 4px 20px rgba(255,255,255,0.9)' }}>
              Everything Your Pet Needs, <br/>All In One Place.
            </h1>
            <p style={{ fontSize: '1.25rem', maxWidth: '650px', margin: '0 auto', marginBottom: '40px', color: '#1a2b3c', fontWeight: '600', textShadow: '0 2px 15px rgba(255,255,255,0.9)' }}>
              Track health records, book vet visits, shop for supplies, and chat with our AI Vet—your ultimate pet companion app.
            </p>

            <div className="hero-buttons hero-buttons-centered" style={{ gap: '20px' }}>
              <Link to="/signup" className="btn" style={{ 
                backgroundColor: '#ff5a79', 
                color: 'white', 
                fontSize: '1.1rem', 
                padding: '16px 36px',
                boxShadow: '0 10px 25px rgba(255, 90, 121, 0.4)'
              }}>Get Started</Link>
              <a href="#features" className="btn" style={{ 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                backdropFilter: 'blur(10px)',
                color: '#1c4b79', 
                fontSize: '1.1rem', 
                padding: '16px 36px',
                border: '1px solid rgba(28, 75, 121, 0.2)'
              }}>Explore Features</a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="feature-section" style={{ 
          marginTop: '60px', 
          background: 'linear-gradient(135deg, #fff0f2 0%, #ffffff 100%)',
          padding: '80px 40px',
          borderRadius: '32px'
        }}>
          <div className="section-heading" style={{ textAlign: 'center', margin: '0 auto 50px auto' }}>
            <h2 style={{ fontSize: '2.8rem', fontWeight: '800', color: '#0d1b2a' }}>Smarter Care for Your Best Friend</h2>
            <p style={{ fontSize: '1.1rem', color: '#5b6c83' }}>Everything you need to keep your pet happy, healthy, and safe.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card" style={{ border: 'none', boxShadow: '0 12px 30px rgba(255,90,121,0.08)' }}>
              <div className="feature-icon" style={{ background: '#fff0f2' }}><HeartPulse color="#ff5a79" /></div>
              <h3>Health Tracking</h3>
              <p>Keep logs of weight, vaccinations, and daily habits seamlessly.</p>
            </div>
            
            <div className="feature-card" style={{ border: 'none', boxShadow: '0 12px 30px rgba(255,90,121,0.08)' }}>
              <div className="feature-icon" style={{ background: '#eaf5ff' }}><Calendar color="#1c4b79" /></div>
              <h3>Appointments</h3>
              <p>Easily book vet visits, grooming sessions, and set reminders.</p>
            </div>

            <div className="feature-card" style={{ border: 'none', boxShadow: '0 12px 30px rgba(255,90,121,0.08)' }}>
              <div className="feature-icon" style={{ background: '#f1edfc' }}><MessageSquare color="#6b4c9a" /></div>
              <h3>AI Vet Assistant</h3>
              <p>Chat 24/7 with our AI vet for quick guidance and tips.</p>
            </div>

            <div className="feature-card" style={{ border: 'none', boxShadow: '0 12px 30px rgba(255,90,121,0.08)' }}>
              <div className="feature-icon" style={{ background: '#fff5f0' }}><Stethoscope color="#d4703a" /></div>
              <h3>SOS Clinic Finder</h3>
              <p>Find the nearest emergency clinic quickly when you need it most.</p>
            </div>

            <div className="feature-card" style={{ border: 'none', boxShadow: '0 12px 30px rgba(255,90,121,0.08)' }}>
              <div className="feature-icon" style={{ background: '#e9f9f0' }}><Activity color="#0f7f5c" /></div>
              <h3>Activity & Diet</h3>
              <p>Monitor their feeding schedule and daily exercise routines.</p>
            </div>

            <div className="feature-card" style={{ border: 'none', boxShadow: '0 12px 30px rgba(255,90,121,0.08)' }}>
              <div className="feature-icon" style={{ background: '#f8fbff' }}><ShieldCheck color="#27405f" /></div>
              <h3>Secure Records</h3>
              <p>All your pet's important documents stored safely in the cloud.</p>
            </div>
          </div>
        </section>

        {/* AI Vet Preview Section */}
        <section className="ai-section" style={{ 
          marginTop: '60px', 
          background: '#0d1b2a', 
          padding: '80px', 
          borderRadius: '32px',
          color: 'white'
        }}>
          <div className="ai-copy">
            <div className="pill-badge" style={{ background: 'rgba(255,90,121,0.2)', color: '#ff5a79', border: 'none' }}>
              <span>🤖</span>
              <span>24/7 Support</span>
            </div>
            <h2 style={{ fontSize: '3rem', fontWeight: '800', marginTop: '16px', color: 'white' }}>Meet Your AI Vet</h2>
            <p style={{ fontSize: '1.15rem', marginTop: '16px', color: '#a0aec0', lineHeight: '1.8' }}>
              Got a quick question at 2 AM? Our intelligent AI Vet is here to help with general advice, symptom checking, and care recommendations.
            </p>
            <ul className="ai-points" style={{ color: '#e2e8f0' }}>
              <li style={{ color: '#e2e8f0' }}>Instant answers to common pet questions</li>
              <li style={{ color: '#e2e8f0' }}>Dietary and nutrition advice</li>
              <li style={{ color: '#e2e8f0' }}>Behavioral tips and tricks</li>
              <li style={{ color: '#e2e8f0' }}>Triage assistance for minor issues</li>
            </ul>
            <Link to="/ai-vet" className="btn" style={{ 
              marginTop: '30px', 
              backgroundColor: '#ff5a79', 
              color: 'white',
              padding: '16px 32px',
              fontSize: '1.1rem'
            }}>
              Try AI Vet Now <ChevronRight size={18} />
            </Link>
          </div>
          
          <div style={{ position: 'relative' }}>
            <img 
              src={aiVetImg} 
              alt="AI Vet" 
              style={{ 
                width: '100%', 
                height: '500px', 
                objectFit: 'cover', 
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
              }} 
            />
            <div className="chat-card" style={{ 
              position: 'absolute', 
              bottom: '-30px', 
              left: '-40px', 
              width: '320px',
              background: 'rgba(16, 35, 58, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div className="chat-header">
                <div className="chat-title">
                  <div className="chat-avatar" style={{ background: '#ff5a79' }}>🤖</div>
                  <div>
                    <strong style={{ color: 'white' }}>AI Vet</strong>
                    <small style={{ display: 'block', color: '#ff8fa3' }}>Online Now</small>
                  </div>
                </div>
              </div>
              <div className="chat-bubbles">
                <div className="chat-bubble ai-bubble" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                  Hello! How can I help Luna today? 🐾
                </div>
                <div className="chat-bubble user-bubble" style={{ background: '#ff5a79', color: 'white' }}>
                  What's a good portion size for a 10kg Corgi?
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonial-section" style={{ 
          marginTop: '60px', 
          background: 'linear-gradient(135deg, #f4f7fb 0%, #eaf3ff 100%)',
          padding: '80px 40px',
          borderRadius: '32px'
        }}>
          <div className="section-heading" style={{ textAlign: 'center', margin: '0 auto 50px auto' }}>
            <h2 style={{ fontSize: '2.8rem', fontWeight: '800', color: '#0d1b2a' }}>Loved by Pet Parents</h2>
            <p style={{ fontSize: '1.1rem', color: '#5b6c83' }}>See what others are saying about Petwise.</p>
          </div>
          
          <div className="testimonial-grid">
            <div className="testimonial-card" style={{ border: 'none', boxShadow: '0 12px 30px rgba(28,75,121,0.06)' }}>
              <div className="stars" style={{ color: '#ff5a79' }}>
                <Star size={18} fill="currentColor" stroke="none" />
                <Star size={18} fill="currentColor" stroke="none" />
                <Star size={18} fill="currentColor" stroke="none" />
                <Star size={18} fill="currentColor" stroke="none" />
                <Star size={18} fill="currentColor" stroke="none" />
              </div>
              <strong style={{ fontSize: '1.2rem' }}>"A lifesaver!"</strong>
              <p style={{ marginTop: '14px', fontSize: '1.05rem', lineHeight: '1.7' }}>Petwise helped me organize all of Max's vet records. The AI Vet is incredible for quick questions at night.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: '#ffdee4', color: '#d43a57', fontWeight: '800' }}>JD</div>
                <div>
                  <strong style={{ fontSize: '0.95rem' }}>Jane Doe</strong>
                  <small style={{ display: 'block', fontSize: '0.85rem' }}>Max's Mom</small>
                </div>
              </div>
            </div>

            <div className="testimonial-card" style={{ border: 'none', boxShadow: '0 12px 30px rgba(28,75,121,0.06)' }}>
              <div className="stars" style={{ color: '#ff5a79' }}>
                <Star size={18} fill="currentColor" stroke="none" />
                <Star size={18} fill="currentColor" stroke="none" />
                <Star size={18} fill="currentColor" stroke="none" />
                <Star size={18} fill="currentColor" stroke="none" />
                <Star size={18} fill="currentColor" stroke="none" />
              </div>
              <strong style={{ fontSize: '1.2rem' }}>"Highly recommend"</strong>
              <p style={{ marginTop: '14px', fontSize: '1.05rem', lineHeight: '1.7' }}>Booking appointments through the app is so much easier than calling the clinic. Love the beautiful design!</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: '#eaf5ff', color: '#1c4b79', fontWeight: '800' }}>MS</div>
                <div>
                  <strong style={{ fontSize: '0.95rem' }}>Mark Smith</strong>
                  <small style={{ display: 'block', fontSize: '0.85rem' }}>Bella's Dad</small>
                </div>
              </div>
            </div>

            <div className="testimonial-card" style={{ border: 'none', boxShadow: '0 12px 30px rgba(28,75,121,0.06)' }}>
              <div className="stars" style={{ color: '#ff5a79' }}>
                <Star size={18} fill="currentColor" stroke="none" />
                <Star size={18} fill="currentColor" stroke="none" />
                <Star size={18} fill="currentColor" stroke="none" />
                <Star size={18} fill="currentColor" stroke="none" />
                <Star size={18} fill="currentColor" stroke="none" />
              </div>
              <strong style={{ fontSize: '1.2rem' }}>"Beautiful app"</strong>
              <p style={{ marginTop: '14px', fontSize: '1.05rem', lineHeight: '1.7' }}>Finally a pet app that looks good and works perfectly. The dashboard tells me everything I need in one glance.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: '#f1edfc', color: '#6b4c9a', fontWeight: '800' }}>AL</div>
                <div>
                  <strong style={{ fontSize: '0.95rem' }}>Anna Lee</strong>
                  <small style={{ display: 'block', fontSize: '0.85rem' }}>Charlie's Mom</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section" style={{ 
          marginTop: '60px', 
          marginBottom: '60px',
          backgroundImage: `linear-gradient(rgba(13, 27, 42, 0.8), rgba(13, 27, 42, 0.9)), url(${ctaPetsImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '100px 40px',
          borderRadius: '32px',
          color: 'white'
        }}>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'white', marginBottom: '20px' }}>Ready to give your pet the best care?</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '40px', color: '#d7e3f1' }}>Join thousands of pet parents using Petwise today.</p>
          <Link to="/signup" className="btn" style={{ 
            backgroundColor: '#ff5a79', 
            color: 'white', 
            fontSize: '1.2rem', 
            padding: '20px 40px',
            boxShadow: '0 15px 35px rgba(255, 90, 121, 0.4)'
          }}>Create Free Account</Link>
        </section>
      </main>
      
      <footer className="footer">
        <div>
          <div className="brand-lockup brand-lockup-large" style={{ color: 'white' }}>
            <span className="brand-icon">🐾</span>
            <span className="brand-name">Petwise</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#889eb8' }}>The all-in-one platform for modern pet parenting.</p>
        </div>
        <div>
          <strong style={{ color: '#b9c7d8' }}>Product</strong>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link to="/ai-vet">AI Vet</Link>
        </div>
        <div>
          <strong style={{ color: '#b9c7d8' }}>Company</strong>
          <a href="#about">About Us</a>
          <a href="#careers">Careers</a>
          <Link to="/community">Community</Link>
        </div>
        <div>
          <strong style={{ color: '#b9c7d8' }}>Support</strong>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
          <Link to="/sos">Emergency Centers</Link>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;