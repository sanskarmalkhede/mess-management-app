import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'super_admin' | 'owner' | 'member' | null
  const [mess, setMess] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserData(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setUserRole(null);
          setMess(null);
          setMembership(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      setProfile(profileData);

      // Fetch user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (roleData) {
        setUserRole(roleData.role);

        if (roleData.role === 'owner' && roleData.mess_id) {
          // Fetch owner's mess
          const { data: messData } = await supabase
            .from('messes')
            .select('*, areas(name)')
            .eq('id', roleData.mess_id)
            .single();
          setMess(messData);
        } else if (roleData.role === 'member' && roleData.mess_id) {
          // Fetch member's mess and membership
          const { data: messData } = await supabase
            .from('messes')
            .select('*, areas(name)')
            .eq('id', roleData.mess_id)
            .single();
          setMess(messData);

          const { data: membershipData } = await supabase
            .from('memberships')
            .select('*')
            .eq('user_id', userId)
            .eq('mess_id', roleData.mess_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          setMembership(membershipData);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        userRole,
        mess,
        membership,
        loading,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
