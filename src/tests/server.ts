import * as http from "http";
import * as ws from "websocket";

async function main(): Promise<void>
{
	let server = http.createServer();
	server.listen(37800);

	let wServer = new ws.server({ httpServer: server });
	wServer.on("request", request =>
	{
		console.log("A client has connected", request.resource, request.origin);

		let connection = request.accept("", request.origin);
		connection.on("message", data =>
		{
			console.log("Message from client", data);
		});
		connection.sendUTF("Hello Newbie! I'm a server");
		connection.close();

		server.close();
	});
}
main();