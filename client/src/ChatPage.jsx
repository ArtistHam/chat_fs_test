import { useRef, useState, useEffect } from "react";
import * as styles from "./ChatPage.module.css";
import axios from "axios";

export const ChatPage = ({ currentUser, setCurrentUser, chats, ws }) => {
  const [username, setUsername] = useState();
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatRecipient, setNewChatRecipient] = useState(null);
  const textareaRef = useRef(null);
  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        setMessages((oldMessages) => [...oldMessages, JSON.parse(event.data)]);
      };
    }
  }, [ws]);
  useEffect(() => {
    if (currentChat) {
      axios({
        method: "GET",
        url: "http://localhost:3000/api/messages",
        params: { user: currentUser, recipient: currentChat },
      }).then((response) => {
        setMessages(
          response.data.toSorted((a, b) => {
            const date1 = new Date(a.sendedat);
            const date2 = new Date(b.sendedat);
            const unixTimestamp1 = date1.getTime();
            const unixTimestamp2 = date2.getTime();
            return unixTimestamp1 - unixTimestamp2;
          })
        );
      });
    }
  }, [currentChat]);
  const sendMessage = () => {
    const newMessage = {
      message: `${textareaRef.current.value}`,
      author: username,
      recipient: currentChat,
      sendedAt: Date.now(),
    };
    textareaRef.current.value = "";
    ws.send(JSON.stringify(newMessage));
  };

  const sendStartMessage = () => {
    const newMessage = {
      message: "start",
      author: username,
      recipient: newChatRecipient,
      sendedAt: Date.now(),
    };
    ws.send(JSON.stringify(newMessage));
  };

  const startNewChat = () => {
    setShowNewChat(true);
  };
  return (
    <div className={styles.wrapper}>
      {currentUser && (
        <div className={styles.header}>
          <span>{`Hello, ${currentUser}!`}</span>
          {currentChat && <span>Write to {currentChat}</span>}
        </div>
      )}
      <div className={styles.sidebar}>
        {currentUser ? (
          <>
            {chats.map((chat) => (
              <button
                className={`${styles.chatButton} ${
                  currentChat === chat ? styles.activeButton : ""
                }`}
                onClick={() => {
                  setCurrentChat(chat);
                }}
              >
                {chat}
              </button>
            ))}
            {showNewChat ? (
              <>
                <input
                  type="text"
                  value={newChatRecipient}
                  onChange={(e) => {
                    setNewChatRecipient(e.target.value);
                  }}
                  placeHolder="Enter recipient username"
                />
                <button onClick={sendStartMessage}>Start</button>
              </>
            ) : (
              <button onClick={startNewChat} className={styles.chatButton}>
                New chat+
              </button>
            )}
          </>
        ) : (
          "Enter username first"
        )}
      </div>
      <div className={styles.chat}>
        {currentUser ? (
          <>
            <div className={styles.inputWrapper}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
              ></textarea>
              <button onClick={sendMessage}>Send</button>
            </div>
            <div className={styles.messages}>
              {messages.map((message) => {
                return (
                  <div
                    className={`${styles.message} ${
                      username === message.author ? styles.my : ""
                    }`}
                  >
                    {message.message}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className={styles.inputWrapper}>
            <input
              className={styles.textarea}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              placeholder="Enter your username"
            />
            <button
              onClick={() => {
                setCurrentUser(username);
              }}
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
