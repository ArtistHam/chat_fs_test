const express = require("express");
const ws = require("ws");
const app = express();
const port = 3000;

const { v4: uuidv4 } = require("uuid");

const cassandra = require("cassandra-driver");

const client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "datacenter1",
  keyspace: "chat_keyspace",
});

const wsServer = new ws.Server({ noServer: true });
wsServer.on("connection", (socket) => {
  socket.on("message", (message) => {
    const msg = JSON.parse(Buffer.from(message).toString());
    const dbMessage = {
      id: uuidv4(),
      message: msg.message,
      author: msg.author,
      recipient: msg.recipient,
      sendedAt: msg.sendedAt,
    };

    client.execute(
      `INSERT INTO chat_keyspace.messages JSON '${JSON.stringify(dbMessage)}';`,
      (err, result) => {
        if (err) throw err;
        console.log(result);
        wsServer.clients.forEach(function each(client) {
          client.send(JSON.stringify(dbMessage));
        });
      }
    );
  });
});

async function executeCqlQuery(query) {
  try {
    const result = await client.execute(query);
    return result.rows;
  } catch (error) {
    console.error("Error executing query:", error);
    return [];
  }
}

async function getMessagesByAuthorOrRecipient(user, recipient) {
  const messagesByAuthor = await executeCqlQuery(
    `SELECT * FROM chat_keyspace.messages WHERE author = '${user}' ALLOW FILTERING`
  );

  if (recipient) {
    const messagesFromAuthor = await executeCqlQuery(
      `SELECT * FROM chat_keyspace.messages WHERE recipient = '${recipient}' AND author = '${user}' ALLOW FILTERING`
    );
    const messagesToAuthor = await executeCqlQuery(
      `SELECT * FROM chat_keyspace.messages WHERE recipient = '${user}' AND author = '${recipient}' ALLOW FILTERING`
    );

    const allMessages = messagesFromAuthor.concat(messagesToAuthor);

    const uniqueMessagesMap = new Map();
    allMessages.forEach((message) => {
      uniqueMessagesMap.set(message.id, message);
    });
    const messages = Array.from(uniqueMessagesMap.values());
    return messages;
  } else {
    const messagesByRecipient = await executeCqlQuery(
      `SELECT * FROM chat_keyspace.messages WHERE recipient = '${user}' ALLOW FILTERING`
    );

    const allMessages = messagesByAuthor.concat(messagesByRecipient);

    const uniqueMessagesMap = new Map();
    allMessages.forEach((message) => {
      uniqueMessagesMap.set(message.id, message);
    });
    const uniqueMessages = Array.from(uniqueMessagesMap.values());

    return uniqueMessages;
  }
}

app.get("/api/chats", async (req, res) => {
  getMessagesByAuthorOrRecipient(req.query.user).then((response) => {
    const uniqueUsersSet = new Set();
    response.forEach((message) => {
      if (message.author !== req.query.user) {
        uniqueUsersSet.add(message.author);
      }
      if (message.recipient !== req.query.user) {
        uniqueUsersSet.add(message.recipient);
      }
    });
    res.appendHeader("Access-Control-Allow-Origin", "http://localhost:3014");
    res.send([...uniqueUsersSet]);
  });
});

app.get("/api/messages", async (req, res) => {
  getMessagesByAuthorOrRecipient(req.query.user, req.query.recipient).then(
    (response) => {
      res.appendHeader("Access-Control-Allow-Origin", "http://localhost:3014");
      res.send(response);
    }
  );
});

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit("connection", socket, request);
  });
});
