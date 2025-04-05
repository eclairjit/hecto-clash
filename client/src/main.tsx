import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import CreateRoomPage from "./pages/CreateRoomPage.tsx";
import JoinRoomPage from "./pages/JoinRoomPage.tsx";
import GamePage from "./pages/GamePage.tsx";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";

createRoot(document.getElementById("root")!).render(
	<Provider store={store}>
		<PersistGate loading={null} persistor={persistor}>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<App />}>
						<Route index element={<HomePage />} />
						<Route path="login" element={<LoginPage />} />
						<Route path="dashboard" element={<DashboardPage />} />
						<Route path="create-room" element={<CreateRoomPage />} />
						<Route path="join-room" element={<JoinRoomPage />} />
						<Route path="game/:roomId" element={<GamePage />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</PersistGate>
	</Provider>
);
