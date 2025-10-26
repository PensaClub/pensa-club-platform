// src/components/DigiBridge/MentorMultiChat/ChatWindowManager.jsx

import { MiniChatWindow } from "../MiniChatWindow/MiniChatWindow";

export const ChatWindowManager = ({ openChats, onCloseChat }) => {
  
  // Изчисли позицията на всеки прозорец (stack ВЛЯВО от Hub)
  const getPosition = (index) => {
    const hubWidth = 380; // Ширина на Hub прозореца
    const windowWidth = 360; // Ширина на mini прозорец
    const spacing = 20; // Разстояние между прозорци
    const rightOffset = 30; // Отстояние от дясна страна
    
    // Първият прозорец е вляво от Hub-а
    // Всеки следващ е още по-вляво
    return {
      right: rightOffset + hubWidth + spacing + (index * (windowWidth + spacing)),
      bottom: 30
    };
  };

  return (
    <>
      {openChats.map((conversation, index) => (
        <MiniChatWindow
          key={conversation.id}
          conversation={conversation}
          position={getPosition(index)}
          onClose={() => onCloseChat(conversation.id)}
        />
      ))}
    </>
  );
};