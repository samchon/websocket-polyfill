export class Event
{
	public readonly target: EventTarget;
	public readonly type: string;
	public readonly timeStamp: number;

	public constructor(type: string, init?: EventInit)
	{
		this.type = type;
		if (init)
			Object.assign(this, init);
	}
}