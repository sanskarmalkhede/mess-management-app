import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export default function MenuHistory() {
  const [posts, setPosts] = useState([]);
  const [messes, setMesses] = useState([]);
  const [selectedMess, setSelectedMess] = useState('');
  const [mealFilter, setMealFilter] = useState('all');

  useEffect(() => {
    fetchMesses();
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedMess, mealFilter]);

  const fetchMesses = async () => {
    const { data } = await supabase.from('messes').select('id, name').order('name');
    setMesses(data || []);
  };

  const fetchPosts = async () => {
    let query = supabase
      .from('menu_posts')
      .select('*, messes(name)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (selectedMess) {
      query = query.eq('mess_id', selectedMess);
    }

    if (mealFilter !== 'all') {
      query = query.eq('meal_type', mealFilter);
    }

    const { data } = await query;
    setPosts(data || []);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Menu History</h1>

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

        <select
          value={mealFilter}
          onChange={(e) => setMealFilter(e.target.value)}
          className="input max-w-xs"
        >
          <option value="all">All Meals</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <span className="text-2xl mr-2">{post.meal_type === 'lunch' ? '🌞' : '🌙'}</span>
                <div>
                  <h3 className="text-white font-semibold">{post.title}</h3>
                  <p className="text-[var(--dark-400)] text-xs">{post.messes?.name}</p>
                </div>
              </div>
              <span className={`badge ${post.is_veg ? 'badge-success' : 'badge-error'}`}>
                {post.is_veg ? 'Veg' : 'Non-Veg'}
              </span>
            </div>

            <div className="bg-[var(--dark-700)] rounded-lg p-3 mb-3">
              {(post.items || []).slice(0, 4).map((item, idx) => (
                <p key={idx} className="text-[var(--dark-300)]">• {item}</p>
              ))}
              {(post.items || []).length > 4 && (
                <p className="text-[var(--dark-500)] text-sm">+{post.items.length - 4} more</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              {post.price && <span className="text-[var(--primary-400)]">₹{post.price}</span>}
              <span className="text-[var(--dark-500)]">{format(new Date(post.created_at), 'dd MMM, hh:mm a')}</span>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="text-[var(--dark-400)]">No menu posts found</p>
        </div>
      )}
    </div>
  );
}
