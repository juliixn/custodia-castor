
import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { supabase } from '../supabase';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchProfileAndMessages = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setUserProfile(profile);
        }

        // Fetch initial messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('id, text, created_at, user_id, profile:profiles(id, username)')
          .order('created_at', { ascending: false });

        if (!messagesError) {
          const formattedMessages = messagesData.map((message) => ({
            _id: message.id,
            text: message.text,
            createdAt: new Date(message.created_at),
            user: {
              _id: message.user_id,
              name: message.profile?.username || 'Usuario desconocido',
            },
          }));
          setMessages(formattedMessages);
        }
      }
    };

    fetchProfileAndMessages();

    const messagesSubscription = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMessage = payload.new;
          // Fetch the profile of the user who sent the message
          const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', newMessage.user_id)
            .single();

          const formattedMessage = {
            _id: newMessage.id,
            text: newMessage.text,
            createdAt: new Date(newMessage.created_at),
            user: {
              _id: newMessage.user_id,
              name: userProfile?.username || 'Usuario desconocido',
            },
          };

          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [formattedMessage])
          );
        }
      )
      .subscribe();

    return () => {
        supabase.removeChannel(messagesSubscription);
    };
  }, []);

  const onSend = useCallback(async (messages = []) => {
    if (!userProfile) return;

    const { text } = messages[0];
    await supabase.from('messages').insert([
      {
        text,
        user_id: userProfile.id,
      },
    ]);
  }, [userProfile]);

  if (!userProfile) {
    return null; // Or a loading indicator
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: userProfile.id,
        name: userProfile.username,
      }}
    />
  );
};

export default ChatScreen;
