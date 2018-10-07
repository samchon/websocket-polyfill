import { Event } from "./Event";

export class ErrorEvent extends Event
{
	public readonly error: any;
	public readonly message: string;

	public constructor(type: string, init?: ErrorEventInit)
	{
		super(type, init);
	}
}