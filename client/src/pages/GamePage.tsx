import { useState, useEffect } from "react";
import WebSocketClient from "../api/game";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Toaster } from "sonner";

const MathGame = () => {
	const { roomId } = useParams<{ roomId: string }>();
	const GAME_TIME = 120; // 2 minutes in seconds
	const OPERATORS = ["+", "-", "*", "/", "^", "(", ")"];

	const currentUser = useSelector((state: RootState) => state.user.currentUser);

	// Initialize game state
	const [sequence, setSequence] = useState(() => {
		return Array(6)
			.fill(0)
			.map(() => Math.floor(Math.random() * 10).toString());
	});

	const [expression, setExpression] = useState<string[]>([]);
	const [timer, setTimer] = useState(GAME_TIME);
	const [gameOver, setGameOver] = useState(false);
	const [success, setSuccess] = useState(false);
	const [currentDigitIndex, setCurrentDigitIndex] = useState(0); // Track which digit should be selected next
	const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
	const [start, setStart] = useState<boolean>(false);

	useEffect(() => {
		let client: WebSocketClient | null = null;
		if (roomId && currentUser?.id) {
			client = new WebSocketClient(roomId, currentUser.id.toString());
			console.log("WebSocketClient initialized:", client);
		}

		// Set error handler
		// client.onError = (error: Error) => {
		// 	console.error("WebSocket error occurred:", error);
		// 	setError(
		// 		error.message ||
		// 			"Failed to connect to game server. Please try again."
		// 	);
		// };

		client?.initiate();
		client?.startReceivingMessages();
		setWsClient(client);

		return () => {
			if (wsClient) {
				wsClient.uninitiate();
			}
		};
	}, []);

	// Timer effect
	useEffect(() => {
		if (timer > 0 && !gameOver && start) {
			const timerId = setTimeout(() => {
				setTimer((prev) => {
					if (prev <= 1) {
						setGameOver(true);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			return () => clearTimeout(timerId);
		}
	}, [timer, gameOver, start]);

	// Add the next digit from the sequence to the expression
	const addNextDigit = () => {
		if (gameOver || currentDigitIndex >= sequence.length) return;

		// Add the next digit to the expression
		setExpression([...expression, sequence[currentDigitIndex]]);

		// Increment the index for the next digit
		setCurrentDigitIndex(currentDigitIndex + 1);
	};

	// Add an operator to the expression
	const addOperator = (operator: string) => {
		if (gameOver) return;

		// Only allow operators after a digit has been placed (except for initial unary + or -)
		if (expression.length === 0 && (operator === "+" || operator === "-")) {
			setExpression([operator]);
			return;
		}

		// Only allow operators after a digit or closing parenthesis
		const lastItem = expression[expression.length - 1];
		if (lastItem && (!OPERATORS.includes(lastItem) || lastItem === ")")) {
			setExpression([...expression, operator]);
		}
	};

	// Remove the last item from the expression
	const removeLastItem = () => {
		if (expression.length === 0 || gameOver) return;

		const lastItem = expression[expression.length - 1];
		const newExpression = [...expression];
		newExpression.pop();
		setExpression(newExpression);

		// If the removed item was a digit, decrement the digit index
		if (!OPERATORS.includes(lastItem)) {
			setCurrentDigitIndex(currentDigitIndex - 1);
		}
	};

	// Format time as MM:SS
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	// Get the current expression as a string
	const getExpressionString = () => {
		return expression.join("");
	};

	// Evaluate the expression
	const evaluateExpression = () => {
		try {
			const expressionStr = getExpressionString();

			// Replace ^ with ** for JavaScript's exponentiation
			const jsExpression = expressionStr.replace(/\^/g, "**");

			// Evaluate and check if equals 100
			const result = eval(jsExpression);
			return result === 100;
		} catch (error) {
			return false;
		}
	};

	// Handle submission
	const handleSubmit = () => {
		const result = evaluateExpression();
		setSuccess(result);
		setGameOver(true);
	};

	// Start a new game
	const startNewGame = () => {
		const newSequence = Array(6)
			.fill(0)
			.map(() => Math.floor(Math.random() * 10).toString());
		setSequence(newSequence);
		setExpression([]);
		setCurrentDigitIndex(0);
		setTimer(GAME_TIME);
		setGameOver(false);
		setSuccess(false);
	};

	// Determine if all digits have been used
	const allDigitsUsed = currentDigitIndex >= sequence.length;

	return (
		<div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center p-4">
			<Toaster />
			<div className="w-full max-w-lg bg-gray-800 rounded-lg shadow-lg p-6">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold text-green-400">Math Game</h1>
					<div className="bg-gray-700 px-4 py-2 rounded-md">
						<span
							className={`font-mono text-xl ${
								timer < 30 ? "text-red-500" : "text-green-400"
							}`}
						>
							{formatTime(timer)}
						</span>
					</div>
				</div>

				<div className="mb-8">
					<p className="text-center text-lg mb-2 text-green-300">
						Make it 100!
					</p>

					{/* Expression display */}
					<div className="bg-gray-700 p-6 rounded-lg my-6 min-h-[80px] text-center">
						<div className="flex justify-center items-center space-x-1 text-4xl font-mono flex-wrap">
							{expression.length > 0 ? (
								expression.map((item, index) => (
									<span
										key={index}
										className={`font-bold ${
											OPERATORS.includes(item)
												? "text-white"
												: "text-yellow-300"
										}`}
									>
										{item === "*" ? "×" : item === "/" ? "÷" : item}
									</span>
								))
							) : (
								<span className="text-gray-500 text-2xl">
									Build your expression here
								</span>
							)}
						</div>
					</div>

					{/* Available digits */}
					<div className="bg-gray-700 p-4 rounded-lg mb-6">
						<h3 className="font-bold text-yellow-300 mb-2 text-center">
							Digit Sequence:
						</h3>
						<div className="flex justify-center space-x-4">
							{sequence.map((digit, index) => (
								<div
									key={index}
									className={`relative ${
										index === currentDigitIndex
											? "ring-2 ring-yellow-400 animate-pulse"
											: index < currentDigitIndex
											? "opacity-50"
											: ""
									}`}
								>
									<div
										className={`bg-gray-800 text-yellow-300 font-bold py-3 px-4 rounded-lg text-2xl border-2 ${
											index === currentDigitIndex
												? "border-yellow-400"
												: "border-gray-700"
										}`}
									>
										{digit}
									</div>
									{index === currentDigitIndex && (
										<div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-yellow-400 text-xl">
											↑
										</div>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Controls */}
					<div className="flex justify-center space-x-4 mb-6">
						<button
							onClick={addNextDigit}
							className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xl shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 active:from-green-700 border-2 border-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={gameOver || allDigitsUsed}
						>
							Add Next Digit
						</button>
						<button
							onClick={removeLastItem}
							className="bg-gradient-to-br from-red-500 to-orange-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl text-xl shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 active:from-red-700 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-red-500/50 hover:shadow-xl"
							disabled={gameOver || expression.length === 0}
						>
							Delete Last
						</button>
					</div>

					{/* Operators */}
					<div className="grid grid-cols-4 gap-3 mb-6">
						{OPERATORS.map((op, index) => (
							<button
								key={index}
								onClick={() => addOperator(op)}
								className="bg-gradient-to-br from-purple-500 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl text-2xl shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 active:from-pink-700 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-pink-500/50 hover:shadow-xl"
								disabled={gameOver}
							>
								{op === "*" ? "×" : op === "/" ? "÷" : op}
							</button>
						))}
					</div>

					<button
						onClick={() => setExpression([])}
						className="w-full bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl text-xl shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 active:from-blue-700 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed mb-6"
						disabled={gameOver || expression.length === 0}
					>
						Clear All
					</button>

					{/* Game rules */}
					<div className="bg-gray-700 p-3 rounded-lg mt-2 text-sm">
						<h3 className="font-bold text-yellow-300 mb-1">Game Rules:</h3>
						<p>
							Use the digits in the exact sequence shown and insert operators to
							create an expression equal to 100.
						</p>
						<p>You must use the digits in the order they appear.</p>
					</div>
				</div>

				{/* Submit button */}
				{!gameOver ? (
					<button
						onClick={handleSubmit}
						className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg text-xl border-2 border-green-800"
						disabled={expression.length === 0}
					>
						Submit
					</button>
				) : (
					<div className="space-y-4">
						<div
							className={`p-4 rounded-lg text-center ${
								success ? "bg-green-800" : "bg-red-800"
							}`}
						>
							{success
								? "Success! You made it equal to 100!"
								: "Not quite! Try again."}
						</div>
						<button
							onClick={startNewGame}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg text-xl border-2 border-blue-800"
						>
							New Game
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default MathGame;
