import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { API_BASE, AUTH_BASE } from './config';

interface User {
  _id: string;
  name: string;
  email: string;
  picture?: string;
  username?: string;
  fikaPoints: number;
  referralCode: string;
}

const LoginModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ show, onClose, onSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    dateOfBirth: '',
    phoneNumber: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    referralCode: ''
  });

  useEffect(() => {
    if (!show) {
      setError(null);
      setSuccess(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        dateOfBirth: '',
        phoneNumber: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        referralCode: ''
      });
    }
  }, [show]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }
    if (isSignup) {
      if (!formData.username || !formData.name) {
        setError('Username and name are required');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    return true;
  };

  const referralCode = localStorage.getItem('fila_referral') || formData.referralCode;

  const handleTraditionalAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (isSignup) {
        await axios.post(`${AUTH_BASE}/signup`, { ...formData, referralCode }, { withCredentials: true });
        setSuccess('Account created successfully!');
        localStorage.removeItem('fila_referral');
        onSuccess();
      } else {
        await axios.post(`${AUTH_BASE}/login`, {
          identifier: formData.email || formData.username,
          password: formData.password
        }, { withCredentials: true });
        setSuccess('Login successful!');
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    const refCode = localStorage.getItem('fila_referral');
    const googleAuthUrl = refCode 
      ? `${AUTH_BASE}/google?state=${refCode}`
      : `${AUTH_BASE}/google`;
    window.location.href = googleAuthUrl;
    localStorage.removeItem('fila_referral');
  };

  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h1 className="main-title">Quiz Learning Platform</h1>
        <h2 className="subtitle">{isSignup ? 'Create your account' : 'Sign in to continue'}</h2>
        <form onSubmit={handleTraditionalAuth} className="auth-form">
          {isSignup && (
            <>
              <div className="form-group">
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required />
              </div>
            </>
          )}
          <div className="form-group">
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
          </div>
          {isSignup && (
            <>
              <div className="form-group">
                <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <input type="date" name="dateOfBirth" placeholder="Date of Birth" value={formData.dateOfBirth} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <input type="tel" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <select name="gender" value={formData.gender} onChange={handleInputChange}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <input type="text" name="referralCode" placeholder="Referral Code (optional)" value={referralCode} onChange={handleInputChange} />
              </div>
            </>
          )}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" className="auth-btn primary" disabled={loading}>{loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}</button>
        </form>
        <div className="auth-divider-centered">
          <span>or</span>
        </div>
        <button className="login-btn google-btn-centered" onClick={handleGoogleAuth} disabled={loading}>
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        <div className="auth-toggle">
          <p>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button type="button" className="toggle-btn" onClick={() => {
              setIsSignup(!isSignup);
              setError(null);
              setSuccess(null);
              setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                name: '',
                dateOfBirth: '',
                phoneNumber: '',
                gender: '',
                address: '',
                city: '',
                state: '',
                country: 'India',
                referralCode: referralCode
              });
            }}>{isSignup ? 'Sign In' : 'Sign Up'}</button>
          </p>
        </div>
      </div>
    </div>
  );
};

interface QuizScore {
  chapter: number;
  score: number;
  date: string;
}

interface UserProgress {
  quizScores: QuizScore[];
  fikaPoints: number;
  unlockedModules: Record<string, number[]>;
}

// Sidebar component
const Sidebar: React.FC<{
  user: User;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}> = ({ user, open, onClose, onLogout }) => {
  // Calculate age from dateOfBirth
  let age = '';
  if (user && (user as any).dateOfBirth) {
    const dob = new Date((user as any).dateOfBirth);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    age = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
  }
  return (
    <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={onClose}>
      <div className={`sidebar${open ? ' open' : ''}`} onClick={e => e.stopPropagation()}>
        <button className="sidebar-close" onClick={onClose}>&times;</button>
        <div className="sidebar-profile">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="sidebar-avatar" />
          ) : (
            <div className="sidebar-avatar-placeholder">{user.name.charAt(0).toUpperCase()}</div>
          )}
          <div className="sidebar-name">{user.name}</div>
          {user.username && <div className="sidebar-username">@{user.username}</div>}
        </div>
        <div className="sidebar-details">
          <div><b>Email:</b> {user.email}</div>
          {(user as any).phoneNumber && <div><b>Phone:</b> {(user as any).phoneNumber}</div>}
          {age && <div><b>Age:</b> {age}</div>}
          <div><b>Fika Points:</b> {user.fikaPoints}</div>
          {(user as any).gender && <div><b>Gender:</b> {(user as any).gender}</div>}
          {(user as any).city && <div><b>City:</b> {(user as any).city}</div>}
          {(user as any).state && <div><b>State:</b> {(user as any).state}</div>}
          {(user as any).country && <div><b>Country:</b> {(user as any).country}</div>}
        </div>
        <button className="sidebar-logout" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};

// ProfileArea component
const ProfileArea: React.FC<{
  user: User | null;
  onClick: () => void;
}> = ({ user, onClick }) => (
  <div className="profile-area" onClick={onClick} style={{ cursor: user ? 'pointer' : 'pointer' }}>
    {user ? (
      <>
        {user.picture ? (
          <img src={user.picture} alt={user.name} className="user-avatar" />
        ) : (
          <div className="user-avatar-placeholder">{user.name.charAt(0).toUpperCase()}</div>
        )}
        <div className="profile-info">
          <div className="profile-name">{user.name}</div>
          <div className="profile-points">Fika Points: {user.fikaPoints}</div>
          {user.username && <div className="profile-username">@{user.username}</div>}
        </div>
      </>
    ) : (
      <>
        <div className="user-avatar-placeholder empty-avatar">?</div>
        <div className="profile-info">
          <div className="profile-name">Not signed in</div>
        </div>
      </>
    )}
  </div>
);

const ChapterModules: React.FC = () => {
  const { chapter } = useParams<{ chapter: string }>();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingModule, setPendingModule] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    axios.get<{ user: User }>(`${AUTH_BASE}/user`, { withCredentials: true })
      .then(res => {
        setIsAuthenticated(true);
        setUser(res.data.user);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUser(null);
      });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      axios.get<UserProgress>(`${API_BASE}/user/progress`, { withCredentials: true })
        .then(res => {
          setUserProgress(res.data);
          setLoading(false);
        }).catch(err => {
          setLoading(false);
        });
    } else {
      setUserProgress(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleUnlock = async (module: number) => {
    if (userProgress && userProgress.fikaPoints < 10) {
      setToast('Oops you have less fika points! Do refer your friend and earn more points! Happy learning!');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    try {
      const response = await axios.post<{ newTotalPoints: number, unlockedModules: Record<string, number[]> }>(`${API_BASE}/unlock/${chapter}/${module}`, {}, { withCredentials: true });
      setUserProgress(prev => prev ? { ...prev, fikaPoints: response.data.newTotalPoints, unlockedModules: response.data.unlockedModules } : null);
      setToast(`Module ${module} unlocked!`);
      setTimeout(() => setToast(null), 2000);
    } catch (err: any) {
      setToast(err.response?.data?.error || 'Failed to unlock module');
      setTimeout(() => setToast(null), 2000);
    }
  };

  const getModuleStatus = (module: number) => {
    if (!isAuthenticated) {
      return module === 1 ? 'unlocked' : 'locked';
    }
    if (!userProgress) return 'locked';
    const unlocked = userProgress.unlockedModules?.[chapter ?? ''] || [1];
    if (unlocked.includes(module)) return 'unlocked';
    return 'locked';
  };

  // Find completed modules for this chapter
  const completedModules: number[] = [];
  if (userProgress && userProgress.quizScores) {
    userProgress.quizScores.forEach(score => {
      if (score.chapter === Number(chapter)) {
        // Each module is 10 questions, so module = Math.ceil((score.score || 1) / 10)
        // But we don't have module info, so let's assume module number is in quizScores (if you store it)
        // For now, mark all modules as completed if a score exists for this chapter
        // You can improve this if you store module info in quizScores
        completedModules.push(1); // Only mark module 1 as completed for demo
      }
    });
  }

  const handleModuleClick = (module: number) => {
    if (!isAuthenticated) {
      setPendingModule(module);
      setShowLogin(true);
    } else {
      navigate(`/quiz/${chapter}/${module}`);
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setIsAuthenticated(true);
    axios.get<{ user: User }>(`${AUTH_BASE}/user`, { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
    if (pendingModule !== null) {
      navigate(`/quiz/${chapter}/${pendingModule}`);
      setPendingModule(null);
    }
  };

  const handleLogout = async () => {
    await axios.get(`${AUTH_BASE}/logout`, { withCredentials: true });
    setUser(null);
    setIsAuthenticated(false);
    setShowSidebar(false);
  };

  if (loading) return <div className="chapter-selection-container"><h2>Loading...</h2></div>;

  // Module icons
  const icons = ['📘'];

  return (
    <div className="chapter-selection-container">
      <div className="chapter-header-row">
        <ProfileArea user={user} onClick={() => user ? setShowSidebar(true) : setShowLogin(true)} />
      </div>
      <h1 className="main-title">Chapter {chapter} Modules</h1>
      {userProgress && (
        <div className="user-stats">
          <p>Your Fika Points: {userProgress.fikaPoints}</p>
        </div>
      )}
      <div className="modules-list-vertical">
        {[1, 2, 3, 4, 5].map((module, idx) => {
          const status = getModuleStatus(module);
          const isCompleted = completedModules.includes(module);
          return (
            <div key={module} className={`module-item-vertical ${status} ${isCompleted ? 'completed' : ''}`}>
              <div className="module-icon-vertical">📘</div>
              <div className="module-title-row">
                <span className="module-title">Module {module}</span>
                {isCompleted && <span className="module-tick">✔</span>}
              </div>
              {status === 'unlocked' ? (
                <button
                  className="module-btn-vertical unlocked"
                  onClick={() => handleModuleClick(module)}
                >
                  {isCompleted ? 'Retake Quiz' : 'Start Quiz'}
                </button>
              ) : (
                <div className="module-locked-vertical">
                  <div className="lock-icon">🔒</div>
                  <p>10 Fika Points</p>
                  <button
                    className="unlock-btn"
                    onClick={() => handleUnlock(module)}
                    disabled={!userProgress || userProgress.fikaPoints < 10}
                  >
                    Unlock
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {toast && <div className="toast-pop">{toast}</div>}
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />
      {user && <Sidebar user={user} open={showSidebar} onClose={() => setShowSidebar(false)} onLogout={handleLogout} />}
    </div>
  );
};

const ChapterSelection: React.FC = () => {
  const [chapters, setChapters] = useState<number[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [referral, setReferral] = useState<{ referralCode: string; referralCount: number; referralPoints: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();
  const chaptersListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get<{ chapters: number[] }>(`${API_BASE}/chapters`)
      .then(res => setChapters(res.data.chapters));
    axios.get<{ user: User }>(`${AUTH_BASE}/user`, { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
    axios.get<{ referralCode: string; referralCount: number; referralPoints: number }>(`${API_BASE}/user/referrals`, { withCredentials: true })
      .then(res => setReferral(res.data))
      .catch(() => setReferral(null));
    setLoading(false);
  }, []);

  const handleCopyReferral = () => {
    if (referral) {
      const link = `${window.location.origin}/?ref=${referral.referralCode}`;
      navigator.clipboard.writeText(link);
      setToast('Referral link copied!');
      setTimeout(() => setToast(null), 2000);
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    axios.get<{ user: User }>(`${AUTH_BASE}/user`, { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
    axios.get<{ referralCode: string; referralCount: number; referralPoints: number }>(`${API_BASE}/user/referrals`, { withCredentials: true })
      .then(res => setReferral(res.data))
      .catch(() => setReferral(null));
  };

  const handleLogout = async () => {
    await axios.get(`${AUTH_BASE}/logout`, { withCredentials: true });
    setUser(null);
    setShowSidebar(false);
  };

  if (loading) return <div className="chapter-selection-container"><h2>Loading...</h2></div>;

  return (
    <div className="chapter-selection-container">
      <div className="chapter-header-row">
        <ProfileArea user={user} onClick={() => user ? setShowSidebar(true) : setShowLogin(true)} />
        {referral && user && (
          <div className="referral-box">
            <div className="referral-msg">Want more points? Refer and earn if your friend signs up!</div>
            <button className="referral-link-btn" onClick={handleCopyReferral}>Copy Referral Link</button>
            <div className="referral-link">{window.location.origin}/?ref={referral.referralCode}</div>
            <div className="referral-stats">Referrals: {referral.referralCount} | Points from referrals: {referral.referralPoints}</div>
          </div>
        )}
      </div>
      {/* Hero Section */}
      <div className="fila-hero">
        {/* Animated blob background (top left, already present) */}
        <svg className="fila-hero-bg" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="110" cy="110" rx="110" ry="110" fill="#43cea2" />
        </svg>
        {/* Animated floating blob (middle right) */}
        <svg className="fila-hero-blob-mid" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="60" cy="60" rx="60" ry="60" fill="#185a9d" opacity="0.13" />
        </svg>
        {/* Animated floating circle (bottom left) */}
        <svg className="fila-hero-blob-bot" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="40" fill="#43cea2" opacity="0.10" />
        </svg>
        {/* Extra animated circles for hero section */}
        <svg className="fila-hero-circle-1" viewBox="0 0 50 50" fill="none"><circle cx="25" cy="25" r="25" fill="#43cea2" opacity="0.08"/></svg>
        <svg className="fila-hero-circle-2" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="#185a9d" opacity="0.09"/></svg>
        <svg className="fila-hero-circle-3" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#ffd600" opacity="0.07"/></svg>
        <div className="fila-hero-illustration">
          {/* Book/Quiz SVG illustration with float animation */}
          <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="fila-hero-svg floating-book">
            <ellipse cx="45" cy="80" rx="32" ry="8" fill="#43cea2" opacity="0.18"/>
            <rect x="20" y="20" width="50" height="40" rx="8" fill="#43cea2" stroke="#185a9d" strokeWidth="2"/>
            <rect x="28" y="28" width="34" height="24" rx="4" fill="#fff"/>
            <rect x="32" y="32" width="26" height="4" rx="2" fill="#43cea2"/>
            <rect x="32" y="40" width="18" height="4" rx="2" fill="#43cea2"/>
            <circle cx="60" cy="44" r="2.5" fill="#185a9d"/>
            <circle cx="66" cy="44" r="2.5" fill="#185a9d"/>
          </svg>
        </div>
        {user && (
          <div className="fila-hero-greeting">Welcome back, <b>{user.name.split(' ')[0]}</b>! 🎉</div>
        )}
        <h1 className="fila-hero-title">Welcome to Fila Learn, Your Study Companion</h1>
        <h2 className="fila-hero-subtitle">Empowering your learning journey with fun, quizzes, and rewards!</h2>
        <p className="fila-hero-desc">
          Fila Learn is designed to make studying engaging and effective. Unlock chapters, challenge yourself with quizzes, earn Fika Points, and climb the leaderboard! Whether you're preparing for exams or just want to learn something new, Fila Learn is here to support you every step of the way. Sign up to track your progress, earn rewards, and invite friends for bonus points!
        </p>
        <button className="fila-hero-btn pulse" onClick={() => chaptersListRef.current?.scrollIntoView({ behavior: 'smooth' })}>
          Get Started
        </button>
      </div>
      <h2 className="subtitle">Select a Chapter</h2>
      {/* Animated circles for chapter selection background */}
      <div className="chapter-bg-circles">
        <svg className="chapter-circle-1" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#43cea2" opacity="0.07"/></svg>
        <svg className="chapter-circle-2" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#185a9d" opacity="0.08"/></svg>
        <svg className="chapter-circle-3" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#ffd600" opacity="0.06"/></svg>
      </div>
      <div ref={chaptersListRef} className="chapter-list-vertical">
        {chapters.map((chap, idx) => {
          // Pick an icon for each module
          const icons = ['📘'];
          return (
            <button
              key={chap}
              className="chapter-list-btn"
              onClick={() => {
                navigate(`/modules/${chap}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span className="module-icon" style={{ marginRight: 8 }}>📘</span>
              Chapter {chap}
            </button>
          );
        })}
      </div>
      {toast && <div className="toast-pop">{toast}</div>}
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />
      {user && <Sidebar user={user} open={showSidebar} onClose={() => setShowSidebar(false)} onLogout={handleLogout} />}
    </div>
  );
};

interface Question {
  _id: string;
  question: string;
  A: string;
  B: string;
  C: string;
  D: string;
  answer: string;
}

const QuizPage: React.FC = () => {
  const { chapter, module } = useParams<{ chapter: string; module: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [showScore, setShowScore] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const scoreSaved = useRef(false);

  useEffect(() => {
    setLoading(true);
    axios.get<{ questions: Question[] }>(`${API_BASE}/questions/${chapter}/${module}`, { withCredentials: true }).then(res => {
      setQuestions(res.data.questions);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching questions:', err);
      setLoading(false);
    });
  }, [chapter, module]);

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [current]: option });
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      setShowScore(true);
    }
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  const saveScore = async (score: number) => {
    try {
      const response = await axios.post<{ pointsEarned: number }>(`${API_BASE}/quiz/score`, {
        chapter: Number(chapter),
        score,
        totalQuestions: questions.length
      }, { withCredentials: true });
      
      setPointsEarned(response.data.pointsEarned);
    } catch (err) {
      console.error('Error saving score:', err);
    }
  };

  if (loading) return <div className="quiz-page-container"><h2>Loading...</h2></div>;
  if (!questions.length) return <div className="quiz-page-container"><h2>No questions found.</h2></div>;

  if (showScore && !reviewMode) {
    let score = 0;
    questions.forEach((q, idx) => {
      const opt = answers[idx] as 'A' | 'B' | 'C' | 'D';
      if (opt && q[opt] === q.answer) score++;
    });
    
    // Save score only once
    if (pointsEarned === 0 && !scoreSaved.current) {
      saveScore(score);
      scoreSaved.current = true;
    }
    
    let emoji = '😢';
    if (score >= 8) emoji = '😄';
    else if (score >= 4) emoji = '🙂';
    
    return (
      <div className="quiz-page-container">
        <h2>Quiz Complete!</h2>
        <div className="score-block">Your Score: {score} / {questions.length}</div>
        {pointsEarned > 0 && (
          <div className="points-earned">+{pointsEarned} Fika Points Earned!</div>
        )}
        <div style={{ fontSize: '3rem', marginTop: '1em' }}>{emoji}</div>
        <button className="nav-btn colored" style={{ marginTop: '2em' }} onClick={() => { setReviewMode(true); setReviewIdx(0); }}>See Answers</button>
      </div>
    );
  }

  if (showScore && reviewMode) {
    const q = questions[reviewIdx];
    const userOpt = answers[reviewIdx] as 'A' | 'B' | 'C' | 'D';
    const correctOpt = (['A', 'B', 'C', 'D'] as const).find(opt => q[opt] === q.answer);
    return (
      <div className="quiz-page-container">
        <h2>Review Answers</h2>
        <div className="question-block">
          <div className="question-text">Q{reviewIdx + 1}. {q.question}</div>
          <div className="options-list-vertical">
            {(['A', 'B', 'C', 'D'] as const).map(opt => {
              let btnClass = 'option-btn-vertical';
              if (userOpt === opt && q[opt] === q.answer) btnClass += ' correct';
              else if (userOpt === opt) btnClass += ' wrong';
              else if (correctOpt === opt) btnClass += ' correct';
              return (
                <button key={opt} className={btnClass} disabled>
                  {opt}. {q[opt]}
                </button>
              );
            })}
          </div>
        </div>
        <div className="quiz-nav">
          <button
            className="nav-btn colored"
            onClick={() => setReviewIdx(i => i - 1)}
            disabled={reviewIdx === 0}
          >Previous</button>
          <button
            className="nav-btn colored"
            onClick={() => setReviewIdx(i => i + 1)}
            disabled={reviewIdx === questions.length - 1}
          >Next</button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const options = ['A', 'B', 'C', 'D'] as const;
  const answered = answers[current] !== undefined;

  return (
    <div className="quiz-page-container">
      <h2>Chapter {chapter} Quiz</h2>
      <div className="question-block">
        <div className="question-text">Q{current + 1}. {q.question}</div>
        <div className="options-list-vertical">
          {options.map(opt => (
            <button
              key={opt}
              className={`option-btn-vertical${answers[current] === opt ? ' selected' : ''}`}
              onClick={() => handleSelect(opt)}
            >
              {opt}. {q[opt]}
            </button>
          ))}
        </div>
      </div>
      <div className="quiz-nav">
        <button
          className="nav-btn colored"
          onClick={handlePrev}
          disabled={current === 0}
        >Previous</button>
        <button
          className="nav-btn colored"
          onClick={handleNext}
          disabled={!answered}
        >{current === questions.length - 1 ? 'Submit' : 'Next'}</button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('fila_referral', refCode);
    }
  }

  return (
    <Routes>
      <Route path="/chapters" element={<ChapterSelection />} />
      <Route path="/modules/:chapter" element={<ChapterModules />} />
      <Route path="/quiz/:chapter/:module" element={<QuizPage />} />
      <Route path="*" element={<ChapterSelection />} />
    </Routes>
  );
};

export default App;
