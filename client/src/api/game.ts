import { toast } from "sonner";
// types of messages

const JOIN: string = "join";
const JOIN_SUCCESS: string = "join_success";
const LEAVE: string = "leave";
const LEAVE_SUCCESS: string = "leave_success";
const OPPONENT_LEFT: string = "opponent_left";
const SUBMIT: string = "submit";
const ROOM_CREATED: string = "room_created";
const ROOM_FULL: string = "room_full";
const END: string = "end";
const ERROR: string = "error";
const WRONG_SUBMISSION: string = "wrong_submission";
const PUZZLE_ASSIGN: string = "puzzle_assign";
const CORRECT_SUBMISSION: string = "correct_submission";

const messageType = {
	JOIN,
	JOIN_SUCCESS,
	LEAVE,
	LEAVE_SUCCESS,
	OPPONENT_LEFT,
	SUBMIT,
	ROOM_CREATED,
	ROOM_FULL,
	END,
	ERROR,
	WRONG_SUBMISSION,
	PUZZLE_ASSIGN,
	CORRECT_SUBMISSION,
};

type Message = {
	type: string;
	content: string;
	roomId: string;
	userId: string;
};

// This function creates a new WebSocket connection to the game server
function create(roomId: string, userId: string): WebSocket {
	const socket = new WebSocket(
		`ws://${import.meta.env.VITE_GAME_SERVER_HOST}:${
			import.meta.env.VITE_GAME_SERVER_PORT
		}/rooms/${roomId}/join?userId=${userId}`
	);

	return socket;
}

class WebSocketClient {
	socket: WebSocket | null;
	roomId: string;
	userId: string;

	constructor(roomId: string, userId: string) {
		this.socket = null;
		this.roomId = roomId;
		this.userId = userId;
	}

	initiate() {
		this.socket = create(this.roomId, this.userId);

		window.addEventListener("beforeunload", () => {
			this.uninitiate();
		});

		console.log("WebSocketClient: initiate");
	}

	uninitiate() {
		if (!this.socket) {
			return;
		}

		const message: Message = {
			type: messageType.LEAVE,
			content: "",
			roomId: this.roomId,
			userId: this.userId,
		};

		this.socket.send(JSON.stringify(message));
		this.socket.close();
		this.socket = null;

		console.log("WebSocketClient: uninitiate");
	}

	close() {
		this.socket?.close();
	}

	sendMessage(content: string) {
		if (this.socket?.readyState === WebSocket.OPEN) {
			const message: Message = {
				type: messageType.SUBMIT,
				content: content,
				roomId: this.roomId,
				userId: this.userId,
			};

			this.socket.send(JSON.stringify(message));

			console.log("WebSocketClient: sendMessage", message);
		}
	}

	startReceivingMessages() {
		if (!this.socket) {
			return;
		}

		this.socket.onmessage = (event) => {
			const message: Message = JSON.parse(event.data);

			switch (message.type) {
				case messageType.JOIN_SUCCESS:
					toast.success("You have joined the room");
					break;
				case messageType.LEAVE_SUCCESS:
					toast.success("You have left the room");
					break;
				case messageType.OPPONENT_LEFT:
					toast.error("Your opponent has left the room");
					break;
				case messageType.ROOM_CREATED:
					toast.success("Room created successfully");
					break;
				case messageType.ROOM_FULL:
					toast.error(message.content);
					break;
				case messageType.END:
					toast.success(message.content);
					break;
				case messageType.ERROR:
					toast.error(message.content);
					break;
				case messageType.WRONG_SUBMISSION:
					toast.error(message.content);
					break;
				case messageType.PUZZLE_ASSIGN:
					toast.success("Puzzle assigned"); // message.content is the sequence
					break;
				case messageType.CORRECT_SUBMISSION:
					toast.success(message.content);
					break;
				default:
					console.log("WebSocketClient: unknown message type", message);
			}
		};
	}
}

export default WebSocketClient;
