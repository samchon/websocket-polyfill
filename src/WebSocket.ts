import { 
	client as Client, 
	connection as Connection,
	IMessage
} from "websocket";

import { EventTarget } from "./events/EventTarget";
import { Event } from "./events/Event";
import { CloseEvent } from "./events/CloseEvent";
import { MessageEvent } from "./events/MessageEvent";
import { ErrorEvent } from "./events/ErrorEvent";

export class WebSocket extends EventTarget<WebSocketEventMap>
{
	/**
	 * @hidden
	 */
	private client_: Client;

	/**
	 * @hidden
	 */
	private connection_: Connection;

	/**
	 * @hidden
	 */
	private on_: Partial<Labmda<WebSocketEventMap>>;

	/* ----------------------------------------------------------------
		CONSTRUCTORS
	---------------------------------------------------------------- */
	public constructor(url: string, protocols?: string | string[])
	{
		super();
		this.on_ = {};

		//----
		// CLIENT
		//----
		// PREPARE SOCKET
		this.client_ = new Client();
		this.client_.on("connect", this._Handle_connect.bind(this));
		this.client_.on("connectFailed", this._Handle_error.bind(this));

		if (typeof protocols === "string")
			protocols = [protocols];

		// DO CONNECT
		this.client_.connect(
			url, 
			protocols as string[]
		);
	}

	public close(code?: number, reason?: string): void
	{
		if (code === undefined)
			this.connection_.sendCloseFrame();
		else
			this.connection_.sendCloseFrame(code, reason, true);
	}

	/* ================================================================
		ACCESSORS
			- PROPERTIES
			- LISTENERS
	===================================================================
		PROPERTIES
	---------------------------------------------------------------- */
	public get url(): string
	{
		return this.client_.url.href;
	}

	public get protocol(): string
	{
		return this.client_.protocols
			? this.client_.protocols[0]
			: "";
	}

	public get extensions(): string
	{
		return this.connection_ && this.connection_.extensions
			? this.connection_.extensions[0].name
			: "";
	}

	public get readyState()
	{
		let state: string = this.connection_.state;
		console.log(state);

		return state;
	}

	/* ----------------------------------------------------------------
		LISTENERS
	---------------------------------------------------------------- */
	public get onopen(): Listener<"open">
	{
		return this.on_.open;
	}
	public get onclose(): Listener<"close">
	{
		return this.on_.close;
	}
	public get onmessage(): Listener<"message">
	{
		return this.on_.message;
	}
	public get onerror(): Listener<"error">
	{
		return this.on_.error;
	}

	public set onopen(listener: Listener<"open">)
	{
		this._Set_on("open", listener);
	}
	public set onclose(listener: Listener<"close">)
	{
		this._Set_on("close", listener);
	}
	public set onmessage(listener: Listener<"message">)
	{
		this._Set_on("message", listener);
	}
	public set onerror(listener: Listener<"error">)
	{
		this._Set_on("error", listener);
	}

	/**
	 * @hidden
	 */
	private _Set_on<K extends keyof WebSocketEventMap>
		(type: K, listener: Listener<K>): void
	{
		if (this.on_[type])
			this.removeEventListener(type, <any>this.on_[type]);
		
		this.addEventListener(type, <any>listener);
		this.on_[type] = listener;
	}

	/* ----------------------------------------------------------------
		SOCKET HANDLERS
	---------------------------------------------------------------- */
	/**
	 * @hidden
	 */
	private _Handle_connect(connection: Connection): void
	{
		this.connection_ = connection;
		this.connection_.on("message", this._Handle_message.bind(this));
		this.connection_.on("error", this._Handle_error.bind(this));
		this.connection_.on("close", this._Handle_close.bind(this));

		let event: Event = new Event("open", EVENT_INIT);
		this.dispatchEvent(event);
	}

	/**
	 * @hidden
	 */
	private _Handle_close(code: number, reason: string): void
	{
		let event: CloseEvent = new CloseEvent("close", 
		{
			...EVENT_INIT,
			code: code, 
			reason: reason
		});
		this.dispatchEvent(event);
	}

	/**
	 * @hidden
	 */
	private _Handle_message(message: IMessage): void
	{
		let event: MessageEvent = new MessageEvent("message",
		{
			...EVENT_INIT,
			data: message.binaryData 
				? message.binaryData 
				: message.utf8Data
		})
		this.dispatchEvent(event);
	}

	/**
	 * @hidden
	 */
	private _Handle_error(error: Error): void
	{
		let event: ErrorEvent = new ErrorEvent("error",
		{
			...EVENT_INIT,
			error: error,
			message: error.message
		});
		this.dispatchEvent(event);
	}
}

type Listener<K extends keyof WebSocketEventMap> = (event: WebSocketEventMap[K]) => void;
type Labmda<T> = { [P in keyof T]: (event: T[P]) => void; }

const EVENT_INIT: EventInit = 
{
	bubbles: false,
	cancelable: false,
	composed: false
};