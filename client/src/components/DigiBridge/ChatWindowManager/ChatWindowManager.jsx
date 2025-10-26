// src/components/DigiBridge/MentorMultiChat/ChatWindowManager.jsx

import React, { useEffect, useState } from 'react';
import { MiniChatWindow } from '../MiniChatWindow/MiniChatWindow';

export const ChatWindowManager = ({ openChats, onCloseChat }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [minimizedStates, setMinimizedStates] = useState({});

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chatsToShow = openChats;

  // Изчисли позицията
  const getPosition = (chatId, index, isMinimized) => {
    const windowWidth = 360;
    const spacing = 20;
    const rightOffset = 30;
    const minimizedSize = 64;
    
    // ✅ MOBILE
    if (isMobile) {
      if (isMinimized) {
        // ✅ ВЕРТИКАЛЕН STACK за minimized: Обратен ред
        // Брои само minimized чатовете
        const allMinimizedChats = chatsToShow.filter((_, i) => i <= index && minimizedStates[chatsToShow[i].id]);
        const minimizedIndex = allMinimizedChats.length - 1;
        
        return {
          right: rightOffset,
          bottom: 100 + (minimizedIndex * (minimizedSize + 12)),
          left: 'auto',
          width: minimizedSize,
          height: minimizedSize
        };
      } else {
        // ✅ Open: ФИКСИРАНА позиция - винаги на едно и също място
        return {
          right: 20,
          bottom: 30, // ✅ ФИКСИРАНА - не се променя
          left: 20,
          width: 'auto',
          height: 450,
          maxWidth: 340
        };
      }
    }

    // ✅ DESKTOP
    const hubWidth = 380;
    
    if (isMinimized) {
      return {
        right: rightOffset + hubWidth + spacing + (index * (windowWidth + spacing)),
        bottom: 30,
        left: 'auto',
        width: windowWidth,
        height: 60
      };
    } else {
      return {
        right: rightOffset + hubWidth + spacing + (index * (windowWidth + spacing)),
        bottom: 30,
        left: 'auto',
        width: windowWidth,
        height: 500
      };
    }
  };

  return (
    <>
      {chatsToShow.map((conversation, index) => (
        <MiniChatWindow
          key={conversation.id}
          conversation={conversation}
          getPosition={(isMinimized) => {
            // ✅ Запази minimized state
            if (minimizedStates[conversation.id] !== isMinimized) {
              setMinimizedStates(prev => ({
                ...prev,
                [conversation.id]: isMinimized
              }));
            }
            return getPosition(conversation.id, index, isMinimized);
          }}
          onClose={() => onCloseChat(conversation.id)}
          isMobile={isMobile}
        />
      ))}
    </>
  );
};
