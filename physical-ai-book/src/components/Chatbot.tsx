import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from './Chatbot.module.css';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Handle text selection
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        setSelectedText(selection.toString());
      } else {
        // Only clear if we click somewhere else and it's not inside the chatbot
        // Actually, let's keep it until the user clears it or selects something else
        // setSelectedText('');
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    const currentSelection = selectedText; // Capture selection at send time

    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    // If there's selected text, we can append a note or send it separately
    // But the backend expects `selectedText` in the body

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: userMessage,
            selectedText: currentSelection
        }),
      });

      const data = await res.json();

      if (data.error) {
         setMessages(prev => [...prev, { role: 'bot', text: "Error: " + data.error }]);
      } else {
         setMessages(prev => [...prev, { role: 'bot', text: data.answer }]);
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to server." }]);
    } finally {
      setLoading(false);
      // Optional: Clear selection after sending?
      // setSelectedText('');
    }
  };

  return (
    <div className={clsx(styles.chatbotWrapper, { [styles.open]: isOpen })}>
      {!isOpen && (
        <button className={styles.toggleButton} onClick={() => setIsOpen(true)}>
          Chat with Book
        </button>
      )}

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
             <h3>Course Assistant</h3>
             <button onClick={() => setIsOpen(false)}>X</button>
          </div>

          <div className={styles.chatBody} ref={chatBodyRef}>
             {messages.length === 0 && (
                <div className={styles.welcome}>
                    <p>Ask me anything about the course!</p>
                    <p><i>Tip: Select text on the page to ask about it specifically.</i></p>
                </div>
             )}
             {messages.map((m, i) => (
                <div key={i} className={clsx(styles.message, m.role === 'user' ? styles.user : styles.bot)}>
                    {m.text}
                </div>
             ))}
             {loading && <div className={styles.loading}>Thinking...</div>}
          </div>

          <div className={styles.selectionIndicator} style={{ display: selectedText ? 'block' : 'none' }}>
             <small>Selected Context: "{selectedText.substring(0, 30)}..." <button onClick={() => setSelectedText('')}>(x)</button></small>
          </div>

          <form onSubmit={handleSubmit} className={styles.chatFooter}>
             <input
               type="text"
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder="Type your question..."
             />
             <button type="submit" disabled={loading}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
