import { is_node } from "tstl/utility/node";

if (is_node())
	(global as any).WebSocket = require("./WebSocket").WebSocket;