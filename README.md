docker run --name cassandra -p 127.0.0.1:9042:9042 -p 127.0.0.1:9160:9160 -d cassandra

CREATE KEYSPACE chat_keyspace WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

CREATE TABLE chat_keyspace.messages ( id UUID PRIMARY KEY, message text, author UUID, recipient UUID, sendedAt timestamp);
