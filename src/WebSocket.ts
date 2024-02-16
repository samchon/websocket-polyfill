import { 
	client as Client, 
	connection as Connection,
  Message
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

	/**
	 * @hidden
	 */
	private state_: number;

	/**
	 * @hidden
	 */
	private url_: string;
	
	/**
	 * @hidden
	 */
	private protocol_: string;
	

	/* ----------------------------------------------------------------
		CONSTRUCTORS
	---------------------------------------------------------------- */
	public constructor(url: string, protocols?: string | string[])
	{
		super();

		this.on_ = {};
		this.state_ = WebSocket.CONNECTING;

		//----
		// CLIENT
		//----
		// PREPARE SOCKET
		this.client_ = new Client();
		this.client_.on("connect", this._Handle_connect.bind(this));
		this.client_.on("connectFailed", this._Handle_error.bind(this));

		if (typeof protocols === "string")
			protocols = [protocols];

		this.url_ = url;
		this.protocol_ = protocols[0];

		// DO CONNECT
		this.client_.connect(
			url, 
			protocols as string[]
		);
	}

	public close(code?: number, reason?: string): void
	{
		this.state_ = WebSocket.CLOSING;
		this.connection_.sendCloseFrame(code, reason);
	}

	/* ================================================================
		ACCESSORS
			- SENDER
			- PROPERTIES
			- LISTENERS
	===================================================================
		SENDER
	---------------------------------------------------------------- */
	public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void
	{
		if (typeof data.valueOf() === "string")
			this.connection_.sendUTF(data);
		else
		{
			let buffer: Buffer;
			if (data instanceof Buffer)
				buffer = data;
			else if (data instanceof Blob)
				buffer = new Buffer(<any>data, "blob");
			else if ((data as ArrayBufferView).buffer)
				buffer = new Buffer((data as ArrayBufferView).buffer);
			else
				buffer = new Buffer(data as ArrayBufferLike);

			this.connection_.sendBytes(buffer);
		}
	}

	/* ----------------------------------------------------------------
		PROPERTIES
	---------------------------------------------------------------- */
	public get url(): string
	{
		return this.url_
	}

	public get protocol(): string
	{
		return this.protocol_
	}

	public get extensions(): string
	{
		return this.connection_ && this.connection_.extensions
			? this.connection_.extensions[0].name
			: "";
	}

	public get readyState(): number
	{
		return this.state_;
	}

	public get bufferedAmount(): number
	{
		return this.connection_.bytesWaitingToFlush;
	}

	public get binaryType(): string
	{
		return "arraybuffer";
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
		this.on_[type] = <any>listener;
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
		this.state_ = WebSocket.OPEN;

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

		this.state_ = WebSocket.CLOSED;
		this.dispatchEvent(event);
	}

	/**
	 * @hidden
	 */
	private _Handle_message(message: Message): void
	{
		let event: MessageEvent = new MessageEvent("message",
		{
			...EVENT_INIT,
			data: message.type === 'binary'
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
		if (this.state_ === WebSocket.CONNECTING)
			this.state_ = WebSocket.CLOSED;

		this.dispatchEvent(event);
	}
}

export namespace WebSocket
{
	export const CONNECTING = 0;
	export const OPEN = 1;
	export const CLOSING = 2;
	export const CLOSED = 3;
}

type Listener<K extends keyof WebSocketEventMap> = (event: WebSocketEventMap[K]) => void;
type Labmda<T> = { [P in keyof T]: (event: T[P]) => void; }

const EVENT_INIT: EventInit = 
{
	bubbles: false,
	cancelable: false
};