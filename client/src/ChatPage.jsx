import { useRef } from "react";
import * as styles from "./ChatPage.module.css";

export const ChatPage = () => {
  const textareaRef = useRef(null);
  const sendMessage = () => {
    console.log(textareaRef.current.value);
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.inputWrapper}>
        <textarea ref={textareaRef} className={styles.textarea}></textarea>
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
