import * as styles from "./App.module.css";
import { ChatPage } from "./ChatPage";

const App = () => {
  return (
    <div className={styles.wrapper}>
      <ChatPage />
    </div>
  );
};

export default App;
