import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Messes() {
  const [messes, setMesses] = useState([]);
  const [areas, setAreas] = useState([]);
  const [owners, setOwners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', area_id: '', owner_id: '', tagline: '', address: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMesses();
    fetchAreas();
    fetchOwners();
  }, []);

  const fetchMesses = async () => {
    const { data } = await supabase
      .from('messes')
      .select('*, areas(name), owner:owner_id(name, email)')
      .order('created_at', { ascending: false });
    setMesses(data || []);
  };

  const fetchAreas = async () => {
    const { data } = await supabase.from('areas').select('*').eq('is_active', true).order('name');
    setAreas(data || []);
  };

  const fetchOwners = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('user_id, profiles:user_id(name, email)')
      .eq('role', 'owner')
      .is('mess_id', null);
    setOwners(data || []);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: mess, error } = await supabase
        .from('messes')
        .insert({
          name: formData.name,
          area_id: formData.area_id || null,
          owner_id: formData.owner_id || null,
          tagline: formData.tagline,
          address: formData.address,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      if (formData.owner_id) {
        await supabase.from('user_roles').update({ mess_id: mess.id }).eq('user_id', formData.owner_id);
      }

      setShowModal(false);
      setFormData({ name: '', area_id: '', owner_id: '', tagline: '', address: '' });
      fetchMesses();
      fetchOwners();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (mess) => {
    await supabase.from('messes').update({ is_active: !mess.is_active }).eq('id', mess.id);
    fetchMesses();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Messes</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Add Mess
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {messes.map((mess) => (
          <div key={mess.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{mess.name}</h3>
              <span className={`badge ${mess.is_active ? 'badge-success' : 'badge-error'}`}>
                {mess.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {mess.tagline && <p className="text-[var(--dark-400)] mb-2">{mess.tagline}</p>}
            <div className="space-y-2 text-sm">
              <p><span className="text-[var(--dark-500)]">Area:</span> {mess.areas?.name || '-'}</p>
              <p><span className="text-[var(--dark-500)]">Owner:</span> {mess.owner?.name || 'Not assigned'}</p>
            </div>
            <button
              onClick={() => toggleActive(mess)}
              className={`mt-4 w-full py-2 rounded-lg text-sm ${mess.is_active ? 'bg-[var(--error)]/20 text-[var(--error)]' : 'bg-[var(--success)]/20 text-[var(--success)]'}`}
            >
              {mess.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md mx-4">
            <form onSubmit={handleCreate}>
              <h3 className="text-xl font-bold text-white mb-6">Add New Mess</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[var(--dark-400)] text-sm mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[var(--dark-400)] text-sm mb-2">Area</label>
                  <select
                    value={formData.area_id}
                    onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                    className="input"
                  >
                    <option value="">Select area</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--dark-400)] text-sm mb-2">Owner</label>
                  <select
                    value={formData.owner_id}
                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                    className="input"
                  >
                    <option value="">Select owner</option>
                    {owners.map((o) => (
                      <option key={o.user_id} value={o.user_id}>{o.profiles?.name} ({o.profiles?.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--dark-400)] text-sm mb-2">Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="input"
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
          </div>
        </div>
      )}
    </div>
  );
}
