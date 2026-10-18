import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { apiAuth, getStoredToken, setStoredToken } from './lib/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatbotWidget } from './components/ChatbotWidget';

import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { SafetyGuidelinesPage } from './pages/SafetyGuidelinesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RestaurantDashboard } from './pages/RestaurantDashboard';
import { NgoDashboard } from './pages/NgoDashboard';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<string>('home');
  const [loading, setLoading] = useState<boolean>(true);

  // Check stored auth on load
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      apiAuth.getMe()
        .then(user => {
          setCurrentUser(user);
        })
        .catch(err => {
          console.warn("Stored token invalid or expired:", err);
          setStoredToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleNavigate = (page: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActivePage(page);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Role aware redirect
    switch (user.role) {
      case 'restaurant': handleNavigate('restaurant_dashboard'); break;
      case 'ngo': handleNavigate('ngo_dashboard'); break;
      case 'volunteer': handleNavigate('volunteer_dashboard'); break;
      case 'admin': handleNavigate('admin_dashboard'); break;
      default: handleNavigate('home');
    }
  };

  const handleLogout = () => {
    setStoredToken(null);
    setCurrentUser(null);
    handleNavigate('home');
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    setLoading(true);
    let demoEmail = '';
    let demoPass = 'password123';

    switch (role) {
      case 'restaurant': demoEmail = 'restaurant@foodbridge.org'; break;
      case 'ngo': demoEmail = 'ngo@foodbridge.org'; break;
      case 'volunteer': demoEmail = 'volunteer@foodbridge.org'; break;
      case 'admin': demoEmail = 'admin@foodbridge.org'; demoPass = 'admin123'; break;
    }

    try {
      const res = await apiAuth.login(demoEmail, demoPass);
      setStoredToken(res.token);
      setCurrentUser(res.user);
      handleLoginSuccess(res.user);
    } catch (err: any) {
      alert(`Demo login error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F5] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#E8630A] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-cause font-extrabold text-[#1F1B18] text-lg">Connecting FoodBridge Network...</p>
      </div>
    );
  }

  const renderCurrentPage = () => {
    if (activePage === 'home') {
      return <LandingPage currentUser={currentUser} onNavigate={handleNavigate} />;
    }

    if (activePage === 'about') {
      return <AboutPage onNavigate={handleNavigate} />;
    }

    if (activePage === 'safety') {
      return <SafetyGuidelinesPage onNavigate={handleNavigate} />;
    }

    if (activePage === 'login') {
      return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
    }

    if (activePage.startsWith('register')) {
      const urlParams = new URLSearchParams(activePage.split('?')[1] || '');
      const roleParam = (urlParams.get('role') as UserRole) || 'restaurant';
      return (
        <RegisterPage 
          initialRole={roleParam} 
          onRegisterSuccess={handleLoginSuccess} 
          onNavigate={handleNavigate} 
        />
      );
    }

    if (activePage === 'restaurant_dashboard') {
      if (!currentUser || (currentUser.role !== 'restaurant' && currentUser.role !== 'admin')) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
      }
      return <RestaurantDashboard currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }

    if (activePage === 'ngo_dashboard') {
      if (!currentUser || (currentUser.role !== 'ngo' && currentUser.role !== 'admin')) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
      }
      return <NgoDashboard currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }

    if (activePage === 'volunteer_dashboard') {
      if (!currentUser || (currentUser.role !== 'volunteer' && currentUser.role !== 'admin')) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
      }
      return <VolunteerDashboard currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }

    if (activePage === 'admin_dashboard') {
      if (!currentUser || currentUser.role !== 'admin') {
        return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
      }
      return <AdminDashboard currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }

    if (activePage === 'profile') {
      if (!currentUser) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
      }
      return <ProfilePage currentUser={currentUser} onUpdateUser={setCurrentUser} />;
    }

    return <NotFoundPage onNavigate={handleNavigate} />;
  };

  return (
    <div className="min-h-screen bg-[#FFF9F5] text-[#1F1B18] flex flex-col font-sans selection:bg-orange-200 selection:text-[#C2410C]">
      
      {/* Main Header Navbar */}
      <Navbar 
        currentUser={currentUser} 
        onNavigate={handleNavigate} 
        activePage={activePage} 
        onLogout={handleLogout} 
      />

      {/* Main View Area */}
      <main className="flex-grow">
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      <ChatbotWidget />

    </div>
  );
}
