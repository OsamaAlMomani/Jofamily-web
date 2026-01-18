import { Link } from 'react-router-dom';
import './Home.css';
import { useAuth } from '../../core';

function Home() {
  const { user, loading } = useAuth();
  const userEmail = user?.email ?? 'Not logged in';
  const loginStatus = user ? 'Logged in' : loading ? 'Checking session…' : 'Not logged in';
  const avatarLetter = user?.email ? user.email.charAt(0).toUpperCase() : '?';
  const authLink = user ? '/logout' : '/login';
  const authLabel = user ? 'Logout' : 'Login';
  const showDashboardLink = user;

  return (
    <>
      <header className="header">
        <div className="header-container">
          <nav className="navigation">
            <ul className="nav-list">
              <li className="nav-item"><a href="#intro" className="nav-link">Home</a></li>
              <li className="nav-item"><a href="#contact" className="nav-link">Contact</a></li>
              <li className="nav-item"><Link to="/chat" className="nav-link">Chat</Link></li>
              <li className="nav-item"><Link to="/rooms" className="nav-link">Rooms</Link></li>
              <li className="nav-item"><Link to="/rtc-practice" className="nav-link">RTC Practice</Link></li>
              {showDashboardLink && (
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link" style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}>
                    👑 Admin Dashboard
                  </Link>
                </li>
              )}
              {showDashboardLink && (
                <>
                  <li className="nav-item"><Link to="/dashboard/money" className="nav-link">Money</Link></li>
                  <li className="nav-item"><Link to="/dashboard/studies" className="nav-link">Studies</Link></li>
                  <li className="nav-item"><Link to="/dashboard/work" className="nav-link">Work</Link></li>
                  <li className="nav-item"><Link to="/dashboard/admin" className="nav-link">Admin/Visa</Link></li>
                </>
              )}
            </ul>
          </nav>

          <div className="auth-chip">
            <div className={`auth-status ${user ? 'auth-status--ok' : 'auth-status--warn'}`}>
              {loginStatus}
            </div>
            <div className="auth-avatar" title={userEmail}>
              {avatarLetter}
            </div>
            <div className="auth-email" title={userEmail}>
              {userEmail}
            </div>
            <Link to={authLink} className="auth-action">{authLabel}</Link>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="login-alert">
          {user ? (
            <div className="alert alert--success">Logged in as <strong>{userEmail}</strong></div>
          ) : (
            <div className="alert alert--warn">You are not logged in. Please log in to access chat, calendar, and rooms.</div>
          )}
        </div>

        {/* Section 1: Introduction with split layout */}
        <section id="intro" className="section intro-section">
          <div className="split-container">
            <div className="intro-left">
              <h1 className="intro-title">
                Connect your family.
                <br />
                Share <span className="highlight">joyfully</span>.
              </h1>
              <p className="intro-description">
                The platform for families who want to stay connected. 
                Share moments, create memories, and strengthen bonds with confidence.
              </p>
            </div>
            <div className="intro-right">
              <div className="button-group">
                <Link to="/login" className="btn-large btn-login" data-text="Log In">Log In</Link>
                <Link to="/signup" className="btn-large btn-create-account" data-text="Create An Account">Create An Account</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Contact Form */}
        <section id="contact" className="section contact-section">
          <div className="section-container">
            <h2 className="section-title">Get In Touch</h2>
            <p className="section-subtitle">Connect with your family and friends</p>
            
            <div className="form-section">
              <div className="input-group">
                <label htmlFor="username">Username</label>
                <input 
                  type="text" 
                  id="username" 
                  className="text-input" 
                  placeholder="Enter your username"
                />
              </div>

              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="text-input" 
                  placeholder="Enter your email"
                />
              </div>

              <div className="input-group">
                <label htmlFor="message">Message</label>
                <textarea 
                  id="message" 
                  className="text-area" 
                  rows={4}
                  placeholder="Write your message here..."
                />
              </div>
            </div>
          </div>
        </section>





        {/* Section 4: Gallery */}
        <section id="gallery" className="section gallery-section">
          <div className="section-container">
            <h2 className="section-title">Family Moments</h2>
            <p className="section-subtitle">Cherish every moment together</p>
          </div>
        </section>

        {/* Section 5: Community */}
        <section id="community" className="section community-section">
          <div className="section-container">
            <h2 className="section-title">Join Our Community</h2>
            <p className="section-subtitle">Connect with families around the world</p>
          </div>
        </section>
      </main>
    </>
  );
}

export default Home;
