import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [messes, setMesses] = useState([]);
  const [selectedMess, setSelectedMess] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMesses();
  }, []);

  useEffect(() => {
    if (selectedMess) fetchMembers();
  }, [selectedMess, statusFilter]);

  const fetchMesses = async () => {
    const { data } = await supabase.from('messes').select('id, name').order('name');
    setMesses(data || []);
  };

  const fetchMembers = async () => {
    let query = supabase
      .from('memberships')
      .select('*, profiles:user_id(name, email, phone, temp_password)')
      .eq('mess_id', selectedMess)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;
    setMembers(data || []);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Members</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={selectedMess}
          onChange={(e) => setSelectedMess(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">Select mess...</option>
          {messes.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input max-w-xs"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {!selectedMess ? (
        <div className="card text-center py-12">
          <p className="text-5xl mb-4">👆</p>
          <p className="text-[var(--dark-400)]">Select a mess to view members</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Temp Password</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="text-white font-medium">{m.profiles?.name || '-'}</td>
                  <td>{m.profiles?.email}</td>
                  <td>{m.profiles?.phone || '-'}</td>
                  <td className="capitalize">{m.plan_type}</td>
                  <td>
                    <span className={`badge ${m.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td>
                    {m.profiles?.temp_password ? (
                      <code className="bg-[var(--dark-700)] px-2 py-1 rounded text-[var(--primary-400)]">
                        {m.profiles.temp_password}
                      </code>
                    ) : (
                      <span className="text-[var(--success)]">Changed</span>
                    )}
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-[var(--dark-400)] py-8">No members found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
