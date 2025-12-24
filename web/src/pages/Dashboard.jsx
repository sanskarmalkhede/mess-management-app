import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMesses: 0,
    totalOwners: 0,
    totalMembers: 0,
    activeMembers: 0,
  });
  const [recentMesses, setRecentMesses] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentMesses();
  }, []);

  const fetchStats = async () => {
    const { count: messCount } = await supabase.from('messes').select('*', { count: 'exact', head: true });
    const { count: ownerCount } = await supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'owner');
    const { count: memberCount } = await supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'member');
    const { count: activeCount } = await supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('status', 'active');

    setStats({
      totalMesses: messCount || 0,
      totalOwners: ownerCount || 0,
      totalMembers: memberCount || 0,
      activeMembers: activeCount || 0,
    });
  };

  const fetchRecentMesses = async () => {
    const { data } = await supabase
      .from('messes')
      .select('*, areas(name)')
      .order('created_at', { ascending: false })
      .limit(5);
    setRecentMesses(data || []);
  };

  const StatCard = ({ label, value, icon, color }) => (
    <div className="card flex items-center">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl`} style={{ backgroundColor: `${color}20` }}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-[var(--dark-400)]">{label}</p>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Messes" value={stats.totalMesses} icon="🏪" color="#a855f7" />
        <StatCard label="Total Owners" value={stats.totalOwners} icon="👤" color="#3b82f6" />
        <StatCard label="Total Members" value={stats.totalMembers} icon="👥" color="#22c55e" />
        <StatCard label="Active Memberships" value={stats.activeMembers} icon="✅" color="#f59e0b" />
      </div>

      {/* Recent Messes */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Messes</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Area</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentMesses.map((mess) => (
              <tr key={mess.id}>
                <td className="text-white font-medium">{mess.name}</td>
                <td>{mess.areas?.name || '-'}</td>
                <td>
                  <span className={`badge ${mess.is_active ? 'badge-success' : 'badge-error'}`}>
                    {mess.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
