import { Link } from "react-router-dom";

import './Logout.css';

export default function Logout() {
    return (
            <div className="logout-container">
                <h1 className="logout-title">You have been logged out.</h1>
                <p className="logout-message">Thank you for using JoFamily. We hope to see you again soon!</p>
                <Link to="/" className="btn-home">Return to Home</Link>
            </div>
    );
}