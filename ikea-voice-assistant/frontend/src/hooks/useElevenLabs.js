import { useState, useRef, useCallback } from 'react';
import { Conversation } from '@elevenlabs/client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export function useElevenLabs({ onManualFound } = {}) {
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

        clientTools: {
          find_assembly_instructions: async ({ product_name }) => {
            console.log('Tool called: find_assembly_instructions for', product_name);
            try {
              const res = await fetch(`${BACKEND_URL}/api/tools/find-instructions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_name }),
              });

              if (!res.ok) throw new Error(`Backend error ${res.status}`);
              const data = await res.json();

              if (onManualFound) onManualFound(data);
              return data;
            } catch (err) {
              console.error('find_assembly_instructions tool error:', err);
              return { error: 'Could not find instructions. Try describing what you are building.' };
            }
          },
        },

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
  }, [onManualFound]);

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
