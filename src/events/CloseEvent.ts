import { Event } from "./Event";

export class CloseEvent extends Event
{
	public readonly code: number;
	public readonly reason: string;

	public constructor(type: string, init?: CloseEventInit)
	{
		super(type, init);
	}
}