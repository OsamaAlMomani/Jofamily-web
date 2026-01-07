import './Home.css';

interface HomeProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

function Home({ theme, onToggleTheme }: HomeProps) {
  return (
    <>
      <header className="header">
        <div className="header-container">
          <nav className="navigation">
            <ul className="nav-list">
              <li className="nav-item"><a href="#intro" className="nav-link">Home</a></li>
              <li className="nav-item"><a href="#contact" className="nav-link">Contact</a></li>
              <li className="nav-item"><a href="#features" className="nav-link">Features</a></li>
            </ul>
          </nav>
          <button 
            onClick={onToggleTheme} 
            className="theme-toggle"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* Section 1: Introduction with split layout */}
        <section id="intro" className="section intro-section">
          <div className="split-container">
            <div className="intro-left">
              <h1 className="intro-title">Welcome to JoFamily</h1>
              <p className="intro-description">
                Connect with your family and friends in a whole new way. 
                Share moments, create memories, and stay close to the ones you love.
              </p>
              <p className="intro-subtitle">
                Join thousands of families building stronger connections every day.
              </p>
            </div>
            <div className="intro-right">
              <div className="button-group">
                <button className="btn-large btn-login">Log In</button>
                <button className="btn-large btn-create-account">Create An Account</button>
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

        {/* Section 3: Features Table */}
        <section id="features" className="section features-section">
          <div className="section-container">
            <div className="table-section">
              <h3 className="section-title">Our Features</h3>
              <table className="features-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Family Chat</td>
                    <td>Connect with your loved ones</td>
                    <td><span className="status-active">Active</span></td>
                  </tr>
                  <tr>
                    <td>Photo Sharing</td>
                    <td>Share memories instantly</td>
                    <td><span className="status-active">Active</span></td>
                  </tr>
                  <tr>
                    <td>Video Calls</td>
                    <td>Face-to-face conversations</td>
                    <td><span className="status-coming">Coming Soon</span></td>
                  </tr>
                  <tr>
                    <td>Event Planning</td>
                    <td>Organize family gatherings</td>
                    <td><span className="status-active">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Home;
