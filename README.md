# WebSocket-Polyfill
> ## Deprecated
> This package had been developed very long time ago.
>
> It had utilized the [`websocket`](https://github.com/theturtle32/WebSocket-Node) library, but the polyfill could be just done by only one line with [`ws`](https://github.com/websockets/ws) library. In such reason, `websocket-polyfill` no more keeps long line of codes, but just have only one line like below.
>
> I think instead of importing this `websocket-polyfill` library, it would better to write the one line code by yourself.
>
> ```typescript
> import import2 from "import2"; // JUST TO AVOID TRANSPILING
> import { is_node } from "tstl"; // YOU CAN REPLACE IT LIKE BELOW
>
> // let is_node_: boolean | null = null;
> // const is_node = (): boolean =>
> //   (is_node_ ??=
> //     typeof global === "object" &&
> //     typeof global.process === "object" &&
> //     typeof global.process.versions === "object" &&
> //     typeof global.process.versions.node !== "undefined");
>
> if (is_node()) (global as any).WebSocket ??= import2("ws");
> ```

## Outline
WebSocket class for NodeJS.

## Installation
### NPM Module
```bash
npm install --save websocket-polyfill
```

### Usage
```typescript
import "websocket-polyfill";

const main = (): void => {
  const ws: WebSocket = new WebSocket("ws://127.0.0.1:38000/main");
  ws.onmessage = (msg: MessageEvent) => {
    console.log("Data from ws-server", msg.data);
  };
}
main();
```