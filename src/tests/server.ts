import * as http from "http";
import * as ws from "websocket";

async function main(): Promise<void>
{
	let server = http.createServer();
	server.listen(37800);

	let wServer = new ws.server({ httpServer: server });
	wServer.on("request", request =>
	{
		console.log(request.resource, request.origin);

		let connection = request.accept("", request.origin);
		connection.sendUTF("Hello Newbie!");
		connection.close();

		server.close();
	});
}
main();