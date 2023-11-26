import { Chat } from '@flyerhq/react-native-chat-ui';
import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Polyfill for crypto.getRandomValues() in React Native
import 'react-native-get-random-values';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = { id: '06c33e8b-e835-4736-80f4-63f44b66666c' };
  const chatRef = useRef();

  useEffect(() => {
    chatRef.current = chatRef.current;
  }, [chatRef]);

  const addMessage = (message) => {
    setMessages((prevMessages) => [message, ...prevMessages]);
  };

  const handleSendPress = async (message) => {
    try {
      setLoading(true);

      // Display user's message immediately
      const userMessage = {
        author: user,
        createdAt: Date.now(),
        id: uuidv4(),
        text: message.text,
        type: 'text',
      };
      addMessage(userMessage);

      // Send the user's message to the API
      const response = await axios.post(
        'http://43.205.42.88:11434/api/generate',
        {
          model: 'llama2',
          prompt: message.text,
          stream: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const textR = response.data.response;

      // Display the bot's response
      const botMessage = {
        author: { id: 'mario-bot' },
        createdAt: Date.now(),
        id: uuidv4(),
        text: textR,
        type: 'text',
      };
      addMessage(botMessage);

    } catch (error) {
      console.error('Error fetching response:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use React.forwardRef to forward the ref to the Chat component
  const ForwardedChat = React.forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
      // Any additional methods you want to expose
      // For example, scrollToTop: () => { /* your logic */ }
    }));

    return <Chat {...props} />;
  });

  return (
    <SafeAreaProvider>
      <ForwardedChat
        messages={messages}
        onSendPress={handleSendPress}
        user={user}
        loading={loading}
        ref={(ref) => (chatRef.current = ref)}
      />
    </SafeAreaProvider>
  );
};

export default App;
