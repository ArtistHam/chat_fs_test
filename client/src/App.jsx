import { useEffect, useRef, useState } from "react";
import * as styles from "./App.module.css";
import { ChatPage } from "./ChatPage";
import axios from "axios";

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);
  const ws = useRef(null);
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:3000/");
    ws.current.onopen = (event) => {
      console.log("lets go");
    };
  }, []);
  useEffect(() => {
    if (currentUser) {
      axios({
        method: "GET",
        url: "http://localhost:3000/api/chats",
        params: { user: currentUser },
      }).then((response) => {
        setChats(response.data);
      });
    }
  }, [currentUser]);
  return (
    <div className={styles.wrapper}>
      <ChatPage
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        chats={chats}
        ws={ws.current}
      />
    </div>
  );
};

export default App;
