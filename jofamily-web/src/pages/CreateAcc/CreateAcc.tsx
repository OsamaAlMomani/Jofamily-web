import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth } from '../../auth/AuthContext';
import { authErrorMessage } from '../../auth/authErrorMessage';
import { db } from '../../firebase/firebase';
import './CreateAcc.css';

export default function CreateAcc() {
    const navigate = useNavigate();
    const { signupWithEmail, loginWithGoogle } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleGoogleSignup() {
        setError(null);
        setSubmitting(true);
        try {
            const cred = await loginWithGoogle();
            // Ensure a user profile exists for chat (username can be set later)
            await setDoc(
                doc(db, 'users', cred.user.uid),
                {
                    uid: cred.user.uid,
                    email: cred.user.email ?? null,
                    username: username.trim() || null,
                    createdAt: serverTimestamp(),
                },
                { merge: true }
            );
            navigate('/');
        } catch (err) {
            setError(authErrorMessage(err, 'Google signup failed.'));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleEmailSignup(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setSubmitting(true);
        try {
            const cred = await signupWithEmail(email, password);

            await setDoc(doc(db, 'users', cred.user.uid), {
                uid: cred.user.uid,
                email: cred.user.email ?? email,
                username: username.trim(),
                createdAt: serverTimestamp(),
            });

            navigate('/');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Signup failed.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="create-acc-container">
            <div className="create-acc-box">
                <h1 className="create-acc-title">Create Account</h1>
                <p className="create-acc-subtitle">Join JoFamily and start sharing</p>

                <button className="btn-google" type="button" onClick={handleGoogleSignup} disabled={submitting}>
                    <svg className="google-icon" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign up with Google
                </button>

                <div className="divider">
                    <span>or</span>
                </div>

                <form className="create-acc-form" onSubmit={handleEmailSignup}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="text-input"
                            placeholder="Choose a username"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="text-input"
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="text-input"
                            placeholder="Create a password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirm password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="text-input"
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {error ? <div className="auth-error">{error}</div> : null}

                    <button type="submit" className="btn-create-submit" disabled={submitting}>
                        Create Account
                    </button>
                </form>

                <p className="login-link">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>

                <Link to="/" className="back-home">← Back to Home</Link>
            </div>
        </div>
    );
}