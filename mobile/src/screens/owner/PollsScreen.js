import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { format, formatDistanceToNow, isPast } from 'date-fns';

const PollsScreen = ({ navigation }) => {
  const { mess } = useAuth();
  const [polls, setPolls] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPolls = useCallback(async () => {
    if (!mess?.id) return;

    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('mess_id', mess.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      // Fetch vote counts
      const pollsWithVotes = await Promise.all(
        (data || []).map(async (poll) => {
          const { count } = await supabase
            .from('poll_votes')
            .select('*', { count: 'exact', head: true })
            .eq('poll_id', poll.id);
          return { ...poll, voteCount: count || 0 };
        })
      );

      setPolls(pollsWithVotes);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  }, [mess?.id]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPolls();
    setRefreshing(false);
  };

  const renderPoll = ({ item }) => {
    const isExpired = isPast(new Date(item.voting_deadline));
    const isClosed = item.status === 'closed';

    return (
      <View className="bg-dark-800 rounded-2xl p-4 mb-3 mx-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className={`w-10 h-10 rounded-xl items-center justify-center ${
              item.target_meal === 'lunch' ? 'bg-orange-500/20' : 'bg-blue-500/20'
            }`}>
              <Text className="text-xl">{item.target_meal === 'lunch' ? '🌞' : '🌙'}</Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-white font-semibold">{item.title}</Text>
              <Text className="text-dark-400 text-xs">
                {format(new Date(item.created_at), 'dd MMM, hh:mm a')}
              </Text>
            </View>
          </View>
          <View className={`px-2 py-1 rounded-full ${
            isClosed || isExpired ? 'bg-red-500/20' : 'bg-green-500/20'
          }`}>
            <Text className={`text-xs font-medium ${
              isClosed || isExpired ? 'text-red-400' : 'text-green-400'
            }`}>
              {isClosed ? 'Closed' : isExpired ? 'Expired' : 'Active'}
            </Text>
          </View>
        </View>

        {/* Options */}
        <View className="mb-3">
          {(item.options || []).map((option, idx) => {
            const isWinner = isClosed && idx === item.winning_option_index;
            return (
              <View
                key={idx}
                className={`flex-row items-center py-2 px-3 rounded-lg mb-1 ${
                  isWinner ? 'bg-success/20' : 'bg-dark-700'
                }`}
              >
                {isWinner && <Ionicons name="trophy" size={16} color="#22c55e" style={{ marginRight: 8 }} />}
                <Text className={isWinner ? 'text-success flex-1' : 'text-white flex-1'}>{option}</Text>
              </View>
            );
          })}
        </View>

        <View className="flex-row items-center justify-between pt-3 border-t border-dark-700">
          <View className="flex-row items-center">
            <Ionicons name="people" size={16} color="#94a3b8" />
            <Text className="text-dark-400 ml-2">{item.voteCount} votes</Text>
          </View>
          <Text className="text-dark-400 text-xs">
            {isClosed || isExpired
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
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="bar-chart-outline" size={48} color="#475569" />
            <Text className="text-dark-400 mt-4 text-center">
              No polls yet{'\n'}Create a poll to get member feedback!
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('CreatePoll')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 5 }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default PollsScreen;
