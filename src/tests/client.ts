import "../index";

function handle_event(type: string, event: Event): void
{
	if (!event)
	{
		console.log(type, "is undefined");
		return;
	}

	delete (<any>event).target;
	console.log(type, event);
}

async function main(): Promise<void>
{
	try
	{
		let ws: WebSocket = new WebSocket("ws://127.0.0.1:37800/studies/massive");

		ws.onopen = handle_event.bind(null, "open");
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