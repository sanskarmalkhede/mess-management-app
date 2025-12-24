import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { format, formatDistanceToNow, isPast } from 'date-fns';

const PollsScreen = () => {
  const { membership, user, mess } = useAuth();
  const [polls, setPolls] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPolls = useCallback(async () => {
    if (!mess?.id) return;

    try {
      const { data: pollsData } = await supabase
        .from('polls')
        .select('*')
        .eq('mess_id', mess.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch user's votes
      const pollIds = (pollsData || []).map((p) => p.id);
      const { data: votesData } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('user_id', user.id)
        .in('poll_id', pollIds);

      const votesMap = {};
      (votesData || []).forEach((v) => {
        votesMap[v.poll_id] = v;
      });
      setUserVotes(votesMap);

      // Get vote counts for each poll
      const pollsWithCounts = await Promise.all(
        (pollsData || []).map(async (poll) => {
          const { count } = await supabase
            .from('poll_votes')
            .select('*', { count: 'exact', head: true })
            .eq('poll_id', poll.id);
          return { ...poll, voteCount: count || 0 };
        })
      );

      setPolls(pollsWithCounts);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  }, [mess?.id, user?.id]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPolls();
    setRefreshing(false);
  };

  const handleVote = async (poll, optionIndex) => {
    if (membership?.status !== 'active') {
      Alert.alert('Inactive Membership', 'You need an active membership to vote.');
      return;
    }

    if (userVotes[poll.id]) {
      Alert.alert('Already Voted', "You've already voted on this poll.");
      return;
    }

    try {
      await supabase.from('poll_votes').insert({
        poll_id: poll.id,
        user_id: user.id,
        option_index: optionIndex,
      });

      setUserVotes((prev) => ({
        ...prev,
        [poll.id]: { poll_id: poll.id, option_index: optionIndex },
      }));

      setPolls((prev) =>
        prev.map((p) =>
          p.id === poll.id ? { ...p, voteCount: p.voteCount + 1 } : p
        )
      );

      Alert.alert('Vote Recorded!', 'Your vote has been submitted.');
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Failed to submit vote');
    }
  };

  const renderPoll = ({ item }) => {
    const isExpired = isPast(new Date(item.voting_deadline));
    const isClosed = item.status === 'closed' || isExpired;
    const userVote = userVotes[item.id];

    return (
      <View className="bg-dark-800 rounded-2xl p-4 mb-3 mx-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <Text className="text-xl mr-2">
              {item.target_meal === 'lunch' ? '🌞' : '🌙'}
            </Text>
            <Text className="text-white font-semibold flex-1">{item.title}</Text>
          </View>
          <View className={`px-2 py-1 rounded-full ${isClosed ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
            <Text className={`text-xs ${isClosed ? 'text-red-400' : 'text-green-400'}`}>
              {isClosed ? 'Closed' : 'Active'}
            </Text>
          </View>
        </View>

        {/* Options */}
        <View className="mb-3">
          {(item.options || []).map((option, idx) => {
            const isUserChoice = userVote?.option_index === idx;
            const isWinner = isClosed && idx === item.winning_option_index;

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => !isClosed && !userVote && handleVote(item, idx)}
                disabled={isClosed || !!userVote}
                className={`flex-row items-center py-3 px-4 rounded-xl mb-2 ${
                  isWinner ? 'bg-success/20' : isUserChoice ? 'bg-primary-600/30' : 'bg-dark-700'
                }`}
              >
                {isWinner && <Ionicons name="trophy" size={16} color="#22c55e" style={{ marginRight: 8 }} />}
                {isUserChoice && !isClosed && (
                  <Ionicons name="checkmark-circle" size={16} color="#a855f7" style={{ marginRight: 8 }} />
                )}
                <Text className={`flex-1 ${isWinner ? 'text-success' : isUserChoice ? 'text-primary-400' : 'text-white'}`}>
                  {option}
                </Text>
                {!isClosed && !userVote && (
                  <Ionicons name="radio-button-off" size={20} color="#64748b" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="flex-row items-center justify-between pt-3 border-t border-dark-700">
          <Text className="text-dark-400 text-sm">
            {item.voteCount} vote{item.voteCount !== 1 ? 's' : ''}
          </Text>
          <Text className="text-dark-500 text-xs">
            {isClosed
              ? `Ended ${formatDistanceToNow(new Date(item.voting_deadline), { addSuffix: true })}`
              : `Ends ${formatDistanceToNow(new Date(item.voting_deadline), { addSuffix: true })}`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-dark-950">
      <FlatList
        data={polls}
        renderItem={renderPoll}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="bar-chart-outline" size={48} color="#475569" />
            <Text className="text-dark-400 mt-4">No polls yet</Text>
          </View>
        }
      />
    </View>
  );
};

export default PollsScreen;
