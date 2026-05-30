import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyOTP, error: authError, setError } = useAuth();

  const [step, setStep] = useState('login'); // login or otp
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
    otp: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [riskInfo, setRiskInfo] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateLoginForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      const response = await login(formData.email, formData.password);

      if (response.requireOTP) {
        // OTP is required
        setRiskInfo({
          riskLevel: response.riskLevel,
          riskScore: response.riskScore,
        });
        setStep('otp');
        setErrors({});
      } else {
        // Login successful
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateOTP = () => {
    const newErrors = {};
    if (!formData.otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    if (!validateOTP()) return;

    setLoading(true);
    try {
      await verifyOTP(formData.email, formData.otp);
      navigate('/dashboard');
    } catch (err) {
      console.error('OTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low':
        return 'text-green-400 bg-green-500/10';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'high':
        return 'text-orange-400 bg-orange-500/10';
      case 'critical':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-slate-400 bg-slate-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="text-primary-500" size={40} />
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              SecureAuth
            </span>
          </div>
          <p className="text-slate-400">Secure Login</p>
        </div>

        {/* Form Card */}
        <div className="card-hover p-8 animate-slide-up">
          {successMessage && (
            <div className="alert alert-success mb-6 flex gap-2">
              <CheckCircle size={20} />
              {successMessage}
            </div>
          )}
          {authError && (
            <div className="alert alert-danger mb-6 flex gap-2">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Login Form */}
          {step === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleLoginChange}
                  className="input-field"
                  placeholder="you@example.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary-500 hover:text-primary-400">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleLoginChange}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full mt-6"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {/* OTP Verification Form */}
          {step === 'otp' && (
            <div className="space-y-4">
              {/* Risk Alert */}
              <div className={`p-4 rounded-lg border ${getRiskLevelColor(riskInfo?.riskLevel)}`}>
                <p className="text-sm font-medium mb-1">⚠️ Unusual Login Detected</p>
                <p className="text-xs mb-2">Risk Level: {riskInfo?.riskLevel?.toUpperCase()} ({riskInfo?.riskScore}/100)</p>
                <p className="text-xs">We've sent a verification code to your email for security.</p>
              </div>

              <form onSubmit={handleOTPSubmit} className="space-y-4">
                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleLoginChange}
                    className="input-field text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength="6"
                    disabled={loading}
                  />
                  {errors.otp && (
                    <p className="text-red-400 text-sm mt-1">{errors.otp}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    Check your email for the 6-digit code
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>

              {/* Back Button */}
              <button
                onClick={() => {
                  setStep('login');
                  setFormData(prev => ({ ...prev, otp: '' }));
                  setErrors({});
                  setError(null);
                }}
                className="w-full text-slate-400 hover:text-slate-200 text-sm py-2"
              >
                ← Back to Login
              </button>
            </div>
          )}

          {/* Signup Link */}
          <p className="text-center text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-500 hover:text-primary-400 font-medium">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Security Info */}
        <div className="mt-8 space-y-2 text-center text-sm text-slate-500">
          <p>🔒 Your data is encrypted and secure</p>
          <p>📧 OTP sent via verified email only</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;