export function header() {
  return (
    <header className="shared-header">
      <div className="shared-logo"><h1 className="brand-name">MyApp</h1></div>
        
      <div className="shared-bar">
        <nav className="shared-tabs">
          <a href="#home" className="shared-tab-home">Home</a>
          <a href="#about" className="shared-tab-about">About</a>
          <a href="#contact" className="shared-tab-contact">Contact</a>
        </nav>
      </div>
      <div className="shared-user-profile">
        <img src="user-avatar.png" alt="User Avatar" className="shared-avatar" />
        <span className="shared-username">Username</span>
      </div>  
    </header>
  );
}