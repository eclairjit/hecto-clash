import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { api } from "../utils/api";
import { RootState } from "../redux/store";

interface Player {
	id: string;
	username: string;
	rating: number;
	rank: number;
}

const LeaderboardPage: React.FC = () => {
	const navigate = useNavigate();
	const { currentUser } = useSelector((state: RootState) => state.user);
	const [players, setPlayers] = useState<Player[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [limit, setLimit] = useState<number>(10);
	const [currentUserRank, setCurrentUserRank] = useState<{
		rank: number | string;
		rating: number;
	} | null>(null);

	// Fetch leaderboard data
	useEffect(() => {
		const fetchLeaderboard = async () => {
			try {
				setIsLoading(true);
				setError(null);

				// Fetch top players
				const response = await api.get(
					`/v1/leaderboard/page?start=0&end=${limit - 1}`
				);

				if (response.data && response.data.data && response.data.data.players) {
					setPlayers(response.data.data.players);
				} else {
					setError("Invalid response from server");
				}

				// If user is logged in, fetch their rank
				if (currentUser?.id) {
					try {
						const userRankResponse = await api.get(
							`/v1/leaderboard/rank/${currentUser.id}`
						);
						if (userRankResponse.data && userRankResponse.data.data) {
							setCurrentUserRank({
								rank: userRankResponse.data.data.rank,
								rating: userRankResponse.data.data.rating,
							});
						}
					} catch (err) {
						console.error("Failed to fetch user rank:", err);
					}
				}
			} catch (err) {
				console.error("Failed to fetch leaderboard:", err);
				setError("Failed to load leaderboard. Please try again later.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchLeaderboard();
	}, [limit, currentUser?.id]);

	// Function to load more players
	const handleLoadMore = () => {
		// Increase limit by 10, up to max of 100
		setLimit((prev) => Math.min(prev + 10, 100));
	};

	// Return to dashboard
	const handleBackToDashboard = () => {
		navigate("/dashboard");
	};

	if (isLoading && players.length === 0) {
		return (
			<div
				style={{
					flex: 1,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					padding: "2rem",
				}}
			>
				<div
					style={{
						backgroundColor: "var(--bg-primary)",
						padding: "2rem",
						borderRadius: "0.5rem",
						boxShadow: "0 1px 3px var(--shadow-color)",
						textAlign: "center",
					}}
				>
					<p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
						Loading leaderboard...
					</p>
					<div
						style={{
							width: "2rem",
							height: "2rem",
							margin: "0 auto",
							border: "3px solid var(--primary)",
							borderTopColor: "transparent",
							borderRadius: "50%",
							animation: "spin 1s linear infinite",
						}}
					></div>
					<style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
				</div>
			</div>
		);
	}

	return (
		<div
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
			}}
		>
			<main
				style={{
					maxWidth: "80rem",
					margin: "0 auto",
					padding: "2rem 1rem",
					width: "100%",
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "2rem",
					}}
				>
					<div>
						<h2
							style={{
								fontSize: "1.5rem",
								fontWeight: "600",
								color: "var(--text-primary)",
							}}
						>
							HectoClash Leaderboard
						</h2>
						<p style={{ color: "var(--text-secondary)" }}>
							Top players ranked by rating
						</p>
					</div>
					<button
						onClick={handleBackToDashboard}
						style={{
							backgroundColor: "transparent",
							color: "var(--primary)",
							padding: "0.5rem 0.75rem",
							borderRadius: "0.375rem",
							fontWeight: "500",
							border: "1px solid var(--primary)",
							cursor: "pointer",
							transition: "all 0.2s",
						}}
						onMouseOver={(e) => {
							e.currentTarget.style.backgroundColor = "var(--primary)";
							e.currentTarget.style.color = "white";
						}}
						onMouseOut={(e) => {
							e.currentTarget.style.backgroundColor = "transparent";
							e.currentTarget.style.color = "var(--primary)";
						}}
					>
						Back to Dashboard
					</button>
				</div>

				{/* Current User Stats */}
				{currentUser && currentUserRank && (
					<div
						style={{
							backgroundColor: "var(--bg-primary)",
							borderRadius: "0.5rem",
							padding: "1.25rem",
							marginBottom: "2rem",
							border: "1px solid var(--border-color)",
							boxShadow: "0 2px 4px var(--shadow-color)",
						}}
					>
						<h3
							style={{
								fontSize: "1.125rem",
								fontWeight: "600",
								color: "var(--text-primary)",
								marginBottom: "0.5rem",
							}}
						>
							Your Ranking
						</h3>

						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "1.5rem",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.75rem",
								}}
							>
								<div
									style={{
										width: "2.5rem",
										height: "2.5rem",
										borderRadius: "50%",
										backgroundColor: "var(--primary)",
										color: "white",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontWeight: "bold",
									}}
								>
									{typeof currentUserRank.rank === "number"
										? `#${currentUserRank.rank}`
										: "-"}
								</div>
								<div>
									<p
										style={{ fontWeight: "600", color: "var(--text-primary)" }}
									>
										{currentUser.username}
									</p>
									<p
										style={{
											fontSize: "0.875rem",
											color: "var(--text-secondary)",
										}}
									>
										{typeof currentUserRank.rank === "number"
											? "Ranked"
											: "Unranked"}
									</p>
								</div>
							</div>

							<div
								style={{
									marginLeft: "auto",
									textAlign: "right",
								}}
							>
								<span
									style={{
										backgroundColor: "var(--bg-secondary)",
										color: "var(--primary)",
										fontWeight: "bold",
										padding: "0.25rem 0.75rem",
										borderRadius: "1rem",
									}}
								>
									{currentUserRank.rating} Rating
								</span>
							</div>
						</div>
					</div>
				)}

				{error && (
					<div
						style={{
							backgroundColor: "var(--error-bg)",
							color: "var(--error-text)",
							padding: "1rem",
							borderRadius: "0.375rem",
							marginBottom: "1.5rem",
						}}
					>
						{error}
					</div>
				)}

				{/* Leaderboard Table */}
				<div
					style={{
						backgroundColor: "var(--bg-primary)",
						borderRadius: "0.5rem",
						overflow: "hidden",
						boxShadow: "0 1px 3px var(--shadow-color)",
						border: "1px solid var(--border-color)",
					}}
				>
					{/* Table Header */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "4rem 1fr 8rem",
							padding: "1rem 1.5rem",
							backgroundColor: "var(--bg-secondary)",
							fontWeight: "600",
							color: "var(--text-primary)",
							borderBottom: "1px solid var(--border-color)",
						}}
					>
						<div>Rank</div>
						<div>Player</div>
						<div style={{ textAlign: "right" }}>Rating</div>
					</div>

					{/* Table Body */}
					<div>
						{players.length === 0 && !isLoading ? (
							<div
								style={{
									padding: "3rem 1.5rem",
									textAlign: "center",
									color: "var(--text-secondary)",
								}}
							>
								No players found in the leaderboard yet.
							</div>
						) : (
							players.map((player, index) => {
								// Highlight if this is the current user
								const isCurrentUser =
									currentUser &&
									currentUser.id &&
									player.id === currentUser.id.toString();

								return (
									<div
										key={player.id}
										style={{
											display: "grid",
											gridTemplateColumns: "4rem 1fr 8rem",
											padding: "1rem 1.5rem",
											borderBottom: "1px solid var(--border-color)",
											backgroundColor: isCurrentUser
												? "var(--highlight-bg)"
												: "transparent",
											transition: "background-color 0.2s",
										}}
										onMouseOver={(e) => {
											e.currentTarget.style.backgroundColor = isCurrentUser
												? "var(--highlight-bg)"
												: "var(--hover-bg)";
										}}
										onMouseOut={(e) => {
											e.currentTarget.style.backgroundColor = isCurrentUser
												? "var(--highlight-bg)"
												: "transparent";
										}}
									>
										<div
											style={{
												fontWeight: "600",
												color:
													index < 3 ? "var(--primary)" : "var(--text-primary)",
											}}
										>
											{index < 3 ? (
												<span
													style={{
														display: "inline-flex",
														alignItems: "center",
														justifyContent: "center",
														width: "1.875rem",
														height: "1.875rem",
														borderRadius: "50%",
														backgroundColor:
															index === 0
																? "#FFD700"
																: index === 1
																? "#C0C0C0"
																: "#CD7F32",
														color: "#000",
														fontWeight: "bold",
													}}
												>
													{index + 1}
												</span>
											) : (
												`#${index + 1}`
											)}
										</div>

										<div
											style={{
												fontWeight: isCurrentUser ? "600" : "normal",
												color: "var(--text-primary)",
											}}
										>
											{player.username || "Unknown Player"}
										</div>

										<div
											style={{
												textAlign: "right",
												fontWeight: "600",
												color: "var(--text-primary)",
											}}
										>
											{player.rating}
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>

				{/* Load more button */}
				{players.length > 0 && limit < 100 && (
					<div style={{ textAlign: "center", marginTop: "1.5rem" }}>
						<button
							onClick={handleLoadMore}
							style={{
								backgroundColor: "var(--bg-primary)",
								color: "var(--primary)",
								padding: "0.75rem 1.5rem",
								borderRadius: "0.375rem",
								fontWeight: "500",
								border: "1px solid var(--border-color)",
								cursor: "pointer",
								transition: "all 0.2s",
							}}
							onMouseOver={(e) => {
								e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
							}}
							onMouseOut={(e) => {
								e.currentTarget.style.backgroundColor = "var(--bg-primary)";
							}}
							disabled={isLoading}
						>
							{isLoading ? "Loading..." : "Load More Players"}
						</button>
					</div>
				)}
			</main>
		</div>
	);
};

export default LeaderboardPage;
