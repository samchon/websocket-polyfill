import import2 from "import2";
import { is_node } from "tstl";

if (is_node()) {
  (global as any).WebSocket ??= import2("ws");
}
