require("./");
const W3CWebSocket = require("websocket").w3cwebsocket;

if (WebSocket !== W3CWebSocket) {
  throw new Error("global WebSocket is not W3CWebSocket");
}
