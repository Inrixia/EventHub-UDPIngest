## EventHub UDP Ingest

![release status](https://github.com/Inrixia/EventHub-UDPIngest/actions/workflows/autoRelease.yml/badge.svg)

Ingest UDP data packeets into EventHub with `receivedTime` timestamp in metadata.
Intended to be used via Docker or the release binaries.

Settings are specified via Environment Variables. `.env` in the same directory as a binary is supported.

### Example Docker Compose

```yml
version: "3"

services:
 MyEventHubIngest:
  image: inrix/eventhub-udpingest:latest
  container_name: MyEventHubIngest
  restart: always
  ports:
   - "12823:12823"
  environment:
   EVENTHUB_NAME: "your eventhub name"
   EVENTHUB_CONNECTION_STRING: "your eventhub connection string"
   UDP_PORT: "12823" # The port to listen on
   SEND_INTERVAL: 5000 # The interval to send data to eventhub.
   LOGLEVEL: "slow" # Can be "slow", "fast" or nothing. Slow prints every 5s, fast prints as lines come in and rewrites the same line.
```
