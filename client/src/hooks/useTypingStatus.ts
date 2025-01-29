import { useState, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { debounce } from 'lodash';

interface UseTypingStatusProps {
  socket: Socket | null;
  receiverId: string | undefined;
  senderId: string | undefined;
}

export function useTypingStatus({ socket, receiverId, senderId }: UseTypingStatusProps) {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const clearTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleReceiveTyping = useCallback(({ userId }: { userId: string }) => {
    if (userId === receiverId) {
      setIsTyping(true);
      clearTypingTimeout();
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  }, [receiverId]);

  const emitTyping = useCallback(
    debounce(() => {
      if (socket && receiverId && senderId) {
        socket.emit('typing', {
          sender: senderId,
          receiver: receiverId
        });
      }
    }, 300),
    [socket, receiverId, senderId]
  );

  // Cleanup
  const cleanup = () => {
    clearTypingTimeout();
    emitTyping.cancel();
  };

  return {
    isTyping,
    emitTyping,
    handleReceiveTyping,
    cleanup
  };
}

