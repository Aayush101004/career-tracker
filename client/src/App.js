import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Fragment, useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import Login from './components/Login';
import MainTracker from './components/MainTracker';
import Navbar from './components/NavBar';
import ProfilePage from './components/ProfilePage';
import Register from './components/Register';
import ResumeModifier from './components/ResumeModifier';
import setAuthToken from './utils/setAuthToken';

// A wrapper for routes that require a logged-in user
const PrivateRoute = ({ auth, children }) => {
  if (auth.loading) {
    return <div>Loading...</div>; // Or a spinner component
  }
  return auth.isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const [auth, setAuth] = useState({
    // Use sessionStorage to ensure login is cleared when the browser tab is closed
    token: sessionStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null
  });

  // This will now also hold the detailed user data for the profile page
  const [userData, setUserData] = useState(null);

  const loadUser = () => {
    // Use sessionStorage here as well
    const token = sessionStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      try {
        const decoded = jwtDecode(token);
        setAuth({
          token,
          isAuthenticated: true,
          loading: false,
          user: decoded.user
        });
        fetchUserData();
      } catch (error) {
        logout();
      }
    } else {
      setAuth({
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null
      });
    }
  };

  // Central function to fetch user data
  const fetchUserData = async () => {
    if (sessionStorage.getItem('token')) {
      try {
        const res = await axios.get('/api/users/me');
        setUserData(res.data);
      } catch (err) {
        console.error("Could not fetch user data", err);
      }
    }
  };


  useEffect(() => {
    loadUser();
  });

  const loginSuccess = () => {
    loadUser();
  };

  const logout = () => {
    // Use sessionStorage here to clear the token on logout
    sessionStorage.removeItem('token');
    setAuthToken(null);
    setAuth({
      token: null,
      isAuthenticated: false,
      loading: false,
      user: null
    });
    setUserData(null);
  };

  return (
    <Router>
      <Fragment>
        <Navbar auth={auth} logout={logout} />
        <div className="App">
          <main className="App-main">
            <Routes>
              <Route path="/register" element={auth.isAuthenticated ? <Navigate to="/" /> : <Register />} />
              <Route path="/login" element={auth.isAuthenticated ? <Navigate to="/" /> : <Login loginSuccess={loginSuccess} />} />

              <Route
                path="/"
                element={<PrivateRoute auth={auth}><HomePage /></PrivateRoute>}
              />
              <Route
                path="/tracker"
                element={<PrivateRoute auth={auth}><MainTracker fetchUserData={fetchUserData} /></PrivateRoute>}
              />
              <Route
                path="/resume-modifier"
                element={<PrivateRoute auth={auth}><ResumeModifier /></PrivateRoute>}
              />
              <Route
                path="/profile"
                element={<PrivateRoute auth={auth}><ProfilePage userData={userData} loading={!userData} /></PrivateRoute>}
              />
            </Routes>
          </main>
        </div>
      </Fragment>
    </Router>
  );
}

export default App;

