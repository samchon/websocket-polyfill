import "../index";

function handle_event(type: string, event: Event): void
{
	if (type === "open")
		(event.target as WebSocket).send("Hello, I'm a client.");

	console.log(type, (<any>event).data);
}

async function main(): Promise<void>
{
	try
	{
		let ws: WebSocket = new WebSocket("ws://127.0.0.1:37800/studies/massive");
		for (let type of ["open", "close", "error", "message"])
			ws.addEventListener(<any>type, (event: Event) =>
			{
				handle_event(type, event);
			});
	}
	catch (exp)
	{
	}
}
main();