import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import gameSocket from './services/websocket';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import './styles/theme.css';

const App: React.FC = () => {
	// Global event listeners for WebSocket
	useEffect(() => {
		// Attempt to connect to WebSocket when app loads
		const connectSocket = async () => {
			try {
				// Only connect if a user is logged in
				const user = localStorage.getItem('user');
				if (user) {
					await gameSocket.connect();
					
					// Set up global event listeners
					gameSocket.on('global_announcement', (data) => {
						// Display global announcements if needed
						console.log('Global announcement:', data);
					});
				}
			} catch (error) {
				console.error('Failed to connect to WebSocket', error);
			}
		};
		
		connectSocket();
		
		// Clean up on app unmount
		return () => {
			gameSocket.disconnect();
		};
	}, []);
	
	return (
		<ThemeProvider>
			<Layout>
				<Outlet />
			</Layout>
		</ThemeProvider>
	);
};

export default App;
