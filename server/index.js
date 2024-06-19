const express = require("express");
const app = express();
const port = 3000;

const { v4: uuidv4 } = require("uuid");

const cassandra = require("cassandra-driver");

const client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "datacenter1",
  keyspace: "chat_keyspace",
});

client.execute("SELECT * from chat_keyspace.messages", (err, result) => {
  if (err) throw err;
  console.log(result.rows);
});

const message = {
  id: uuidv4(),
  message: "test",
  author: "Artist",
  recipient: "Artist2",
  sendedAt: Date.now(),
};

client.execute(
  `INSERT INTO chat_keyspace.messages JSON '${JSON.stringify(message)}';`,
  (err, result) => {
    if (err) throw err;
    console.log(result);
  }
);

app.post("/api/sendMessage", (req, res) => {
  console.log(req);
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
