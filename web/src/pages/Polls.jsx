import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format, isPast } from 'date-fns';

export default function Polls() {
  const [polls, setPolls] = useState([]);
  const [messes, setMesses] = useState([]);
  const [selectedMess, setSelectedMess] = useState('');

  useEffect(() => {
    fetchMesses();
    fetchPolls();
  }, []);

  useEffect(() => {
    fetchPolls();
  }, [selectedMess]);

  const fetchMesses = async () => {
    const { data } = await supabase.from('messes').select('id, name').order('name');
    setMesses(data || []);
  };

  const fetchPolls = async () => {
    let query = supabase
      .from('polls')
      .select('*, messes(name)')
      .order('created_at', { ascending: false })
      .limit(30);

    if (selectedMess) {
      query = query.eq('mess_id', selectedMess);
    }

    const { data: pollsData } = await query;

    const pollsWithVotes = await Promise.all(
      (pollsData || []).map(async (poll) => {
        const { count } = await supabase
          .from('poll_votes')
          .select('*', { count: 'exact', head: true })
          .eq('poll_id', poll.id);
        return { ...poll, voteCount: count || 0 };
      })
    );

    setPolls(pollsWithVotes);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Polls</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={selectedMess}
          onChange={(e) => setSelectedMess(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">All Messes</option>
          {messes.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Polls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {polls.map((poll) => {
          const isExpired = isPast(new Date(poll.voting_deadline));
          const isClosed = poll.status === 'closed' || isExpired;

          return (
            <div key={poll.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">{poll.title}</h3>
                  <p className="text-[var(--dark-400)] text-sm">{poll.messes?.name}</p>
                </div>
                <span className={`badge ${isClosed ? 'badge-error' : 'badge-success'}`}>
                  {isClosed ? 'Closed' : 'Active'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {(poll.options || []).map((option, idx) => {
                  const isWinner = isClosed && idx === poll.winning_option_index;
                  return (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded-lg ${isWinner ? 'bg-[var(--success)]/20' : 'bg-[var(--dark-700)]'}`}
                    >
                      <span className={isWinner ? 'text-[var(--success)]' : 'text-white'}>
                        {isWinner && '🏆 '}{option}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--dark-400)]">{poll.voteCount} votes</span>
                <span className="text-[var(--dark-500)]">
                  {format(new Date(poll.voting_deadline), 'dd MMM, hh:mm a')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {polls.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-[var(--dark-400)]">No polls found</p>
        </div>
      )}
    </div>
  );
}
