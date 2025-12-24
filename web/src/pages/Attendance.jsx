import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export default function Attendance() {
  const [messes, setMesses] = useState([]);
  const [selectedMess, setSelectedMess] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [stats, setStats] = useState({ lunch: 0, dinner: 0 });
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchMesses();
  }, []);

  useEffect(() => {
    if (selectedMess) fetchAttendance();
  }, [selectedMess, selectedDate]);

  const fetchMesses = async () => {
    const { data } = await supabase.from('messes').select('id, name').order('name');
    setMesses(data || []);
  };

  const fetchAttendance = async () => {
    const { data } = await supabase
      .from('attendance')
      .select('*, memberships!inner(mess_id, profiles:user_id(name))')
      .eq('memberships.mess_id', selectedMess)
      .eq('attendance_date', selectedDate)
      .eq('is_present', true);

    const lunchCount = (data || []).filter((a) => a.meal_type === 'lunch').length;
    const dinnerCount = (data || []).filter((a) => a.meal_type === 'dinner').length;

    setStats({ lunch: lunchCount, dinner: dinnerCount });
    setRecords(data || []);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Attendance</h1>

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

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input max-w-xs"
        />
      </div>

      {!selectedMess ? (
        <div className="card text-center py-12">
          <p className="text-5xl mb-4">👆</p>
          <p className="text-[var(--dark-400)]">Select a mess to view attendance</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card flex items-center">
              <span className="text-4xl mr-4">🌞</span>
              <div>
                <p className="text-3xl font-bold text-white">{stats.lunch}</p>
                <p className="text-[var(--dark-400)]">Lunch Present</p>
              </div>
            </div>
            <div className="card flex items-center">
              <span className="text-4xl mr-4">🌙</span>
              <div>
                <p className="text-3xl font-bold text-white">{stats.dinner}</p>
                <p className="text-[var(--dark-400)]">Dinner Present</p>
              </div>
            </div>
          </div>

          {/* Records */}
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Meal</th>
                  <th>Marked By</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="text-white">{r.memberships?.profiles?.name || '-'}</td>
                    <td>{r.meal_type === 'lunch' ? '🌞 Lunch' : '🌙 Dinner'}</td>
                    <td className="capitalize">{r.marked_by}</td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-[var(--dark-400)] py-8">No records for this date</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
