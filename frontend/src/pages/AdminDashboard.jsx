import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, Users, Lock, TrendingUp, LogOut } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [threats, setThreats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/unauthorized');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, alertsRes, threatsRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getSecurityAlerts('all', 7),
        adminService.getThreatAnalysis(30),
      ]);

      setStats(statsRes.data.stats);
      setAlerts(alertsRes.data.alerts.slice(0, 10));
      setThreats(threatsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
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

  const COLORS = ['#667eea', '#764ba2', '#f5576c', '#ffa502'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <nav className="bg-slate-800/50 border-b border-slate-700 glass-dark">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="text-primary-500" size={32} />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              SecureAuth Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">Admin Panel</p>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'alerts', label: '🚨 Alerts' },
            { id: 'threats', label: '🔍 Threats' },
            { id: 'users', label: '👥 Users' },
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
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: 'Total Users',
                  value: stats?.totalUsers || 0,
                  icon: Users,
                  color: 'from-blue-500 to-blue-600',
                },
                {
                  label: 'Suspicious Logins',
                  value: stats?.suspiciousLogins || 0,
                  icon: AlertCircle,
                  color: 'from-red-500 to-red-600',
                },
                {
                  label: 'Blocked Attempts',
                  value: stats?.blockedAttempts || 0,
                  icon: Lock,
                  color: 'from-orange-500 to-orange-600',
                },
                {
                  label: 'Locked Accounts',
                  value: stats?.lockedAccounts || 0,
                  icon: TrendingUp,
                  color: 'from-purple-500 to-purple-600',
                },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="card-hover p-6 bg-gradient-to-br overflow-hidden relative"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`}></div>
                    <div className="relative">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                          <Icon className="text-white" size={24} />
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Risk Distribution */}
              <div className="card-hover p-6">
                <h3 className="text-xl font-bold mb-4">Risk Distribution (7 days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={
                        stats?.riskDistribution?.map(item => ({
                          name: item._id,
                          value: item.count,
                        })) || []
                      }
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Threat Trends */}
              <div className="card-hover p-6">
                <h3 className="text-xl font-bold mb-4">Threat Trends (30 days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={threats?.threatsByDay || []}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="_id" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#667eea"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="card-hover p-6 mt-6">
              <h3 className="text-xl font-bold mb-4">Recent Security Alerts</h3>
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-500' :
                        alert.severity === 'high' ? 'bg-orange-500' :
                        alert.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="font-medium">{alert.eventType}</p>
                        <p className="text-sm text-slate-400">
                          {alert.userId?.email || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{alert.severity}</p>
                      <p className="text-slate-400">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Security Alerts</h2>
            
            <div className="card-hover p-6">
              <div className="space-y-3">
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-slate-700/20 rounded-lg border border-slate-700 hover:border-primary-500/50 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle
                          size={20}
                          className={
                            alert.severity === 'critical' ? 'text-red-500' :
                            alert.severity === 'high' ? 'text-orange-500' :
                            alert.severity === 'medium' ? 'text-yellow-500' :
                            'text-green-500'
                          }
                        />
                        <span className="font-bold">{alert.eventType}</span>
                        <span className={`badge ${
                          alert.severity === 'critical' ? 'badge-danger' :
                          alert.severity === 'high' ? 'badge-warning' :
                          'badge-success'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">
                        User: {alert.userId?.email} | Risk: {alert.riskScore}/100
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button className="btn btn-secondary text-sm">
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Threats Tab */}
        {activeTab === 'threats' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Threat Analysis</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top Threats */}
              <div className="card-hover p-6">
                <h3 className="text-xl font-bold mb-4">Top Threat Types</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={threats?.topThreats || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="_id" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    />
                    <Bar dataKey="count" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Most Targeted Users */}
              <div className="card-hover p-6">
                <h3 className="text-xl font-bold mb-4">Most Targeted Users</h3>
                <div className="space-y-2">
                  {threats?.topTargetedUsers?.map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="font-medium">{user.user[0]?.email}</p>
                        <p className="text-xs text-slate-400">{user.count} threats</p>
                      </div>
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                          style={{
                            width: `${(user.count / (threats?.topTargetedUsers?.[0]?.count || 1)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">User Management</h2>
            
            <div className="card-hover p-6">
              <p className="text-slate-400">User management interface coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
