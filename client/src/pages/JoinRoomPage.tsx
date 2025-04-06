import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import gameService from "../services/game";
import authService from "../services/auth";

const JoinRoomPage: React.FC = () => {
	const navigate = useNavigate();
	const [roomId, setRoomId] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	// Check if user is logged in
	React.useEffect(() => {
		// if (!authService.isAuthenticated()) {
		//   navigate('/');
		//   return;
		// }
	}, [navigate]);

	const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setRoomId(e.target.value);
	};

	const handleJoinRoom = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!roomId.trim()) {
			setError("Please enter a room code");
			return;
		}

		try {
			setIsLoading(true);
			setError("");

			// Ensure we're connected to the WebSocket before proceeding
			// try {
			// 	await gameService.connectToWebSocket();
			// } catch (wsError) {
			// 	console.error("Failed to connect to WebSocket server:", wsError);
			// 	throw new Error(
			// 		"Cannot connect to game server. Please make sure the server is running."
			// 	);
			// }

			// Navigate to the game page
			navigate(`/game/${roomId}`);
		} catch (error) {
			console.error("Failed to join room:", error);
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError(
					"Failed to join the game room. Please check the room code and try again."
				);
			}
			setIsLoading(false);
		}
	};

	return (
		<div
			style={{
				flex: 1,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "2rem",
			}}
		>
			<div
				style={{
					width: "100%",
					maxWidth: "32rem",
					display: "flex",
					flexDirection: "column",
					gap: "1.5rem",
				}}
			>
				<div
					style={{
						backgroundColor: "var(--bg-primary)",
						padding: "2.5rem",
						borderRadius: "1rem",
						boxShadow: "0 4px 6px var(--shadow-color)",
					}}
				>
					<h2
						style={{
							fontSize: "2rem",
							fontWeight: "bold",
							marginBottom: "2rem",
							textAlign: "center",
						}}
						className="gradient-text"
					>
						Join a Game
					</h2>

					{error && (
						<div
							style={{
								backgroundColor: "var(--error-bg)",
								color: "var(--error-text)",
								padding: "1rem",
								borderRadius: "0.5rem",
								marginBottom: "1.5rem",
								border: "1px solid var(--error-border)",
							}}
						>
							{error}
						</div>
					)}

					<form onSubmit={handleJoinRoom}>
						<div style={{ marginBottom: "2rem" }}>
							<label
								htmlFor="roomId"
								style={{
									display: "block",
									marginBottom: "0.75rem",
									fontWeight: "500",
									color: "var(--text-primary)",
								}}
							>
								Room Code
							</label>
							<input
								id="roomId"
								type="text"
								value={roomId}
								onChange={handleRoomIdChange}
								placeholder="Enter room code"
								autoComplete="off"
								style={{
									width: "100%",
									padding: "1rem",
									backgroundColor: "var(--bg-secondary)",
									border: "1px solid var(--border-color)",
									borderRadius: "0.5rem",
									fontSize: "1.1rem",
									color: "var(--text-primary)",
									transition: "all 0.2s ease",
								}}
								onFocus={(e) => {
									e.target.style.borderColor = "var(--primary)";
									e.target.style.boxShadow =
										"0 0 0 2px var(--primary-transparent)";
								}}
								onBlur={(e) => {
									e.target.style.borderColor = "var(--border-color)";
									e.target.style.boxShadow = "none";
								}}
							/>
						</div>

						<div
							style={{
								display: "flex",
								gap: "1rem",
							}}
						>
							<button
								type="submit"
								disabled={isLoading}
								style={{
									flex: 1,
									padding: "1rem",
									backgroundColor: "var(--primary)",
									color: "white",
									border: "none",
									borderRadius: "0.5rem",
									fontWeight: "600",
									cursor: isLoading ? "not-allowed" : "pointer",
									opacity: isLoading ? 0.7 : 1,
									transition: "all 0.2s ease",
								}}
								onMouseOver={(e) => {
									if (!isLoading) {
										e.currentTarget.style.transform = "translateY(-2px)";
										e.currentTarget.style.boxShadow =
											"0 6px 8px var(--shadow-color)";
									}
								}}
								onMouseOut={(e) => {
									if (!isLoading) {
										e.currentTarget.style.transform = "translateY(0)";
										e.currentTarget.style.boxShadow = "none";
									}
								}}
							>
								{isLoading ? (
									<div
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											gap: "0.5rem",
										}}
									>
										<div
											style={{
												width: "1rem",
												height: "1rem",
												borderRadius: "50%",
												border: "2px solid rgba(255, 255, 255, 0.3)",
												borderTopColor: "white",
												animation: "spin 1s linear infinite",
											}}
										></div>
										Joining...
									</div>
								) : (
									"Join Game"
								)}
							</button>
							<button
								type="button"
								onClick={() => navigate("/dashboard")}
								style={{
									padding: "1rem",
									backgroundColor: "var(--bg-primary)",
									color: "var(--text-primary)",
									border: "1px solid var(--border-color)",
									borderRadius: "0.5rem",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 0.2s ease",
								}}
								onMouseOver={(e) => {
									e.currentTarget.style.backgroundColor = "var(--hover-bg)";
									e.currentTarget.style.borderColor = "var(--hover-border)";
								}}
								onMouseOut={(e) => {
									e.currentTarget.style.backgroundColor = "var(--bg-primary)";
									e.currentTarget.style.borderColor = "var(--border-color)";
								}}
							>
								Cancel
							</button>
						</div>
					</form>
				</div>

				<div
					style={{
						backgroundColor: "var(--info-bg)",
						padding: "1.5rem",
						borderRadius: "0.75rem",
						border: "1px solid var(--info-border)",
					}}
				>
					<h3
						style={{
							fontWeight: "600",
							marginBottom: "0.75rem",
							color: "var(--info-text)",
						}}
					>
						Don't have a code?
					</h3>
					<p
						style={{
							fontSize: "0.9rem",
							color: "var(--info-text)",
							marginBottom: "1rem",
						}}
					>
						Ask your friend to create a room and share the code with you.
					</p>
					<button
						onClick={() => navigate("/create-room")}
						style={{
							backgroundColor: "var(--primary)",
							color: "white",
							padding: "0.75rem 1.25rem",
							borderRadius: "0.5rem",
							fontWeight: "500",
							border: "none",
							fontSize: "0.9rem",
							cursor: "pointer",
							transition: "all 0.2s ease",
						}}
						onMouseOver={(e) => {
							e.currentTarget.style.transform = "translateY(-2px)";
							e.currentTarget.style.boxShadow = "0 6px 8px var(--shadow-color)";
						}}
						onMouseOut={(e) => {
							e.currentTarget.style.transform = "translateY(0)";
							e.currentTarget.style.boxShadow = "none";
						}}
					>
						Create a Room Instead
					</button>
				</div>
			</div>
		</div>
	);
};

export default JoinRoomPage;
