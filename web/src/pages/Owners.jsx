import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Owners() {
  const [owners, setOwners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [createdOwner, setCreatedOwner] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('*, profiles:user_id(name, email, temp_password), messes(name)')
      .eq('role', 'owner')
      .order('created_at', { ascending: false });
    setOwners(data || []);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tempPassword = generatePassword();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: { data: { name: formData.name } },
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      await supabase.from('profiles').update({ temp_password: tempPassword }).eq('id', userId);
      await supabase.from('user_roles').insert({ user_id: userId, role: 'owner' });

      setCreatedOwner({ name: formData.name, email: formData.email, tempPassword });
      setFormData({ name: '', email: '' });
      fetchOwners();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Owners</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Add Owner
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mess</th>
              <th>Temp Password</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((owner) => (
              <tr key={owner.id}>
                <td className="text-white font-medium">{owner.profiles?.name || '-'}</td>
                <td>{owner.profiles?.email}</td>
                <td>{owner.messes?.name || 'Not assigned'}</td>
                <td>
                  {owner.profiles?.temp_password ? (
                    <code className="bg-[var(--dark-700)] px-2 py-1 rounded text-[var(--primary-400)]">
                      {owner.profiles.temp_password}
                    </code>
                  ) : (
                    <span className="text-[var(--success)]">Changed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md mx-4">
            {createdOwner ? (
              <div className="text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-white mb-4">Owner Created!</h3>
                <div className="bg-[var(--dark-700)] rounded-xl p-4 mb-6 text-left">
                  <p className="text-[var(--dark-400)] mb-1">Email</p>
                  <p className="text-white mb-3">{createdOwner.email}</p>
                  <p className="text-[var(--dark-400)] mb-1">Temporary Password</p>
                  <p className="text-[var(--primary-400)] font-mono text-lg">{createdOwner.tempPassword}</p>
                </div>
                <button
                  onClick={() => { setShowModal(false); setCreatedOwner(null); }}
                  className="btn-primary"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate}>
                <h3 className="text-xl font-bold text-white mb-6">Add New Owner</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-[var(--dark-400)] text-sm mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--dark-400)] text-sm mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
