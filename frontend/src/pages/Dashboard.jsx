import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, Lock, Smartphone, MapPin, Clock, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProfile();
    
    // Fetch profile every 10 seconds (not every 5) to reduce renders
    const interval = setInterval(() => {
      fetchProfileSilent(); // Silent update without loading state
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      setProfile(response.data.user);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Silent fetch without loading spinner (for real-time updates)
  const fetchProfileSilent = async () => {
    try {
      const response = await authService.getProfile();
      setProfile(response.data.user);
    } catch (err) {
      console.error('Silent profile fetch error:', err);
      // Don't show error for silent updates
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <nav className="bg-slate-800/50 border-b border-slate-700 glass-dark">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="text-primary-500" size={32} />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              SecureAuth
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="alert alert-danger mb-6 flex gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'devices', label: '📱 Devices' },
            { id: 'history', label: '📜 Login History' },
            { id: 'security', label: '🔒 Security Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'text-primary-500 border-primary-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Account Overview</h2>
            
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: 'Account Status',
                  value: 'Active',
                  icon: '✓',
                  color: 'success',
                },
                {
                  label: 'Devices Connected',
                  value: profile?.devices?.length || 0,
                  icon: '📱',
                  color: 'info',
                },
                {
                  label: 'Last Login',
                  value: profile?.loginHistory?.[0]
                    ? new Date(profile.loginHistory[0].timestamp).toLocaleDateString()
                    : 'N/A',
                  icon: '⏰',
                  color: 'warning',
                },
                {
                  label: 'Security Level',
                  value: 'Strong',
                  icon: '🔐',
                  color: 'success',
                },
              ].map((stat, i) => (
                <div key={i} className="card-hover p-6">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="card-hover p-6">
              <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
              <div className="space-y-2">
                {profile?.loginHistory?.slice(0, 5).map((login, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-primary-500" />
                      <div>
                        <p className="font-medium">{login.location?.city}</p>
                        <p className="text-sm text-slate-400">
                          {login.deviceName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(login.timestamp).toLocaleDateString()}
                      </p>
                      <p className={`text-xs ${
                        login.riskLevel === 'low' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {login.riskLevel} risk
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Devices Tab */}
        {activeTab === 'devices' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Connected Devices</h2>
              <button className="btn btn-primary flex items-center gap-2">
                <Plus size={18} />
                Add Device
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {profile?.devices && profile.devices.length > 0 ? (
                profile.devices.map((device, i) => (
                  <div key={i} className="card-hover p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <Smartphone className="text-primary-500" size={24} />
                        <div>
                          <p className="font-bold">{device.deviceName}</p>
                          <p className="text-sm text-slate-400">{device.browser}</p>
                        </div>
                      </div>
                      {device.isVerified && (
                        <span className="badge badge-success">Verified</span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Device Type:</span>
                        <span>{device.deviceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">OS:</span>
                        <span>{device.osType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">IP Address:</span>
                        <span className="font-mono text-xs">{device.ipAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Location:</span>
                        <span>{device.location?.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Last Login:</span>
                        <span>{new Date(device.lastLogin).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all">
                      <Trash2 size={16} />
                      Remove Device
                    </button>
                  </div>
                ))
              ) : (
                <div className="card-hover p-6 text-center col-span-2">
                  <Smartphone size={48} className="mx-auto text-slate-600 mb-4" />
                  <p className="text-slate-400">No devices registered yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Login History Tab */}
        {activeTab === 'history' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Login History</h2>
            
            <div className="card-hover p-6">
              <div className="space-y-3">
                {profile?.loginHistory && profile.loginHistory.length > 0 ? (
                  profile.loginHistory.map((login, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-700/20 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-4 flex-1">
                        <Clock className="text-primary-500 flex-shrink-0" size={20} />
                        <div className="flex-1">
                          <p className="font-medium">
                            {login.location?.city}, {login.location?.country}
                          </p>
                          <div className="text-sm text-slate-400 flex gap-4 mt-1">
                            <span>{login.deviceName}</span>
                            <span>IP: {login.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium">
                          {new Date(login.timestamp).toLocaleString()}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className={`badge ${
                            login.riskLevel === 'low' ? 'badge-success' :
                            login.riskLevel === 'medium' ? 'badge-warning' :
                            'badge-danger'
                          }`}>
                            {login.riskLevel}
                          </span>
                          <span className="badge badge-info">
                            {login.riskScore}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No login history available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Security Settings Tab */}
        {activeTab === 'security' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
            
            <div className="space-y-4">
              <div className="card-hover p-6 flex justify-between items-center">
                <div>
                  <p className="font-bold mb-1">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button className="btn btn-primary">
                  {profile?.twoFactorEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>

              <div className="card-hover p-6 flex justify-between items-center">
                <div>
                  <p className="font-bold mb-1">Change Password</p>
                  <p className="text-sm text-slate-400">
                    Update your password regularly for security
                  </p>
                </div>
                <button className="btn btn-secondary">
                  Change
                </button>
              </div>

              <div className="card-hover p-6 flex justify-between items-center">
                <div>
                  <p className="font-bold mb-1">Trusted Devices</p>
                  <p className="text-sm text-slate-400">
                    Manage devices that don't require OTP verification
                  </p>
                </div>
                <button className="btn btn-secondary">
                  Manage
                </button>
              </div>

              <div className="card-hover p-6 flex justify-between items-center">
                <div>
                  <p className="font-bold mb-1">Session Timeout</p>
                  <p className="text-sm text-slate-400">
                    Automatically logout after inactivity
                  </p>
                </div>
                <select className="input-field w-auto">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>2 hours</option>
                  <option>Never</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
