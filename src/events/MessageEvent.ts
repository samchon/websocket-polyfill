import { Event } from "./Event";

export class MessageEvent extends Event
{
	public readonly data: any;

	public constructor(type: string, init?: MessageEventInit)
	{
		super(type, init);
	}
}