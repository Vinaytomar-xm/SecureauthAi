import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, AlertCircle, Activity, Eye, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 glass-dark">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="text-primary-500" size={32} />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              SecureAuth AI
            </span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Intelligent Login
              </span>
              <br />
              Security for Your Business
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              Protect your users from phishing, brute force attacks, and suspicious logins with AI-powered risk detection.
            </p>
            <div className="flex gap-4">
              <Link to="/signup" className="btn btn-primary text-lg px-8">
                Start Free Trial
              </Link>
              <button className="btn btn-outline text-lg px-8">
                Watch Demo
              </button>
            </div>
          </div>

          <div className="relative h-96">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl opacity-10 blur-3xl"></div>
            <div className="relative bg-slate-800/50 border border-primary-500/20 rounded-2xl p-8 glass">
              <div className="space-y-4">
                {[
                  { label: 'Risk Score', value: '42/100', color: 'success' },
                  { label: 'Status', value: 'Secure', color: 'success' },
                  { label: 'Last Login', value: '2 min ago', color: 'info' },
                  { label: 'Threats Blocked', value: '3', color: 'danger' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center pb-4 border-b border-slate-700">
                    <span className="text-slate-400">{item.label}</span>
                    <span className={`font-bold badge badge-${item.color}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Powerful Security Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: 'Secure Authentication',
                description: 'Military-grade encryption for passwords with bcrypt hashing',
              },
              {
                icon: AlertCircle,
                title: 'Brute Force Detection',
                description: 'Automatic account lockout after suspicious login attempts',
              },
              {
                icon: Eye,
                title: 'Device Tracking',
                description: 'Monitor all devices accessing your account in real-time',
              },
              {
                icon: Activity,
                title: 'Risk Scoring',
                description: 'AI-powered risk assessment for every login attempt',
              },
              {
                icon: Zap,
                title: 'Real-time Alerts',
                description: 'Instant notifications of suspicious activity',
              },
              {
                icon: Shield,
                title: 'Phishing Protection',
                description: 'Advanced detection of phishing attempts and fraud',
              },
            ].map((feature, i) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={i}
                  className="card-hover p-6 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-primary-500/50 transition-all">
                    <IconComponent className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center card-hover p-12 gradient-primary">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Secure Your Logins?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of businesses protecting their users with SecureAuth AI
          </p>
          <Link to="/signup" className="btn btn-secondary text-lg px-8">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4 bg-black/50">
        <div className="max-w-6xl mx-auto text-center text-slate-500">
          <p>&copy; 2024 SecureAuth AI. Protecting businesses worldwide. 🔐</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
