import { HashSet } from "tstl/container/HashSet";
import { HashMap } from "tstl/container/HashMap";

import { Event } from "./Event";

export class EventTarget<Types extends object = {}>
{
	/**
	 * @hidden
	 */
	private listeners_: HashMap<string, HashSet<Listener>>;

	/**
	 * @hidden
	 */
	private created_at_: Date;

	public constructor()
	{
		this.listeners_ = new HashMap();
		this.created_at_ = new Date();
	}

	public dispatchEvent(event: Event): void
	{
		// FIND LISTENERS
		let it = this.listeners_.find(event.type);
		if (it.equals(this.listeners_.end()))
			return;

		// SET DEFAULT ARGUMENTS
		(event as any).target = this;
		(event as any).timeStamp = new Date().getTime() - this.created_at_.getTime();

		// CALL THE LISTENERS
		for (let listener of it.second)
			listener(event);
	}

	public addEventListener<K extends keyof Types>
		(type: K, listener: Types[K]): void
	{
		let it = this.listeners_.find(<string>type);
		if (it.equals(this.listeners_.end()))
			it = this.listeners_.emplace(<string>type, new HashSet()).first;

		it.second.insert(<any>listener as Listener);
	}

	public removeEventListener<K extends keyof Types>
		(type: string, listener: Types[K]): void
	{
		let it = this.listeners_.find(type);
		if (it.equals(this.listeners_.end()))
			return;

		it.second.erase(<any>listener as Listener);
		if (it.second.empty())
			this.listeners_.erase(it);
	}
}

type Listener = (event: Event) => void;