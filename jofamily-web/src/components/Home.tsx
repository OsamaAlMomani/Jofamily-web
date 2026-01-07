import './Home.css';

function Home() {
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
        </div>
      </header>

      <main className="main-content">
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
                <button className="btn-large btn-login" data-text="Log In">Log In</button>
                <button className="btn-large btn-create-account" data-text="Create An Account">Create An Account</button>
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
