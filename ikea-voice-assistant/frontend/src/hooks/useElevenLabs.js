import { useState, useRef, useCallback } from 'react';
import { Conversation } from '@elevenlabs/client';

export function useElevenLabs() {
  const [status, setStatus] = useState('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const conversationRef = useRef(null);

  const startConversation = useCallback(async (signedUrl) => {
    if (conversationRef.current) return;

    setStatus('connecting');

    try {
      const conversation = await Conversation.startSession({
        signedUrl,

        onConnect: () => {
          setStatus('connected');
          setIsListening(true);
        },

        onDisconnect: () => {
          setStatus('idle');
          setIsSpeaking(false);
          setIsListening(false);
          conversationRef.current = null;
        },

        onMessage: ({ message, source }) => {
          if (source === 'ai' || source === 'agent') {
            setLastMessage(message);
          }
        },

        onModeChange: ({ mode }) => {
          if (mode === 'speaking') {
            setIsSpeaking(true);
            setIsListening(false);
          } else if (mode === 'listening') {
            setIsSpeaking(false);
            setIsListening(true);
          }
        },

        onError: (err) => {
          console.error('ElevenLabs error:', err);
          setStatus('error');
          setIsSpeaking(false);
          setIsListening(false);
        },
      });

      conversationRef.current = conversation;
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setStatus('error');
      throw err;
    }
  }, []);

  const endConversation = useCallback(async () => {
    if (!conversationRef.current) return;

    try {
      await conversationRef.current.endSession();
    } catch (err) {
      console.error('Error ending session:', err);
    } finally {
      conversationRef.current = null;
      setStatus('idle');
      setIsSpeaking(false);
      setIsListening(false);
    }
  }, []);

  return {
    startConversation,
    endConversation,
    status,
    isSpeaking,
    isListening,
    lastMessage,
    isActive: conversationRef.current !== null,
  };
}
