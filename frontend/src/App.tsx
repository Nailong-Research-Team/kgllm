import React, { createContext, useContext, useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./routes/_layout/dashboard";
import Settings from "./routes/_layout/settings";
import Admin from "./routes/_layout/admin";
import TopBar from "./components/layout/TopBar";
import DashboardContent from "./components/layout/DashboardContent";
import ChatPage from "./routes/_layout/chat";
import GraphPage from "./routes/_layout/graph";
import { useAuth } from "./hooks/useAuth";

// 创建主题上下文
export const ThemeContext = createContext<{
	themeMode: "light" | "dark";
	toggleTheme: () => void;
}>({
	themeMode: "light",
	toggleTheme: () => {},
});

// 主题提供者包装器组件
const ThemeProviderWrapper: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

	const toggleTheme = () => {
		setThemeMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
	};

	const theme = createTheme({
		palette: {
			mode: themeMode,
		},
	});

	return (
		<ThemeContext.Provider value={{ themeMode, toggleTheme }}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</ThemeContext.Provider>
	);
};

// 私有路由组件
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();
	
	if (loading) {
		return <div>Loading...</div>;
	}
	
	return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// 主应用内容组件
const AppContent: React.FC = () => {
	const { logout } = useAuth();

	return (
		<div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
			<TopBar
				projectName="KGLLM"
				onLogout={logout}
			/>
			<div
				style={{
					marginTop: '50px',
					flex: 1,
					overflow: 'hidden',
				}}>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route
						path="/"
						element={
							<PrivateRoute>
								<Dashboard />
							</PrivateRoute>
						}
					>
						<Route path="dashboard" element={<DashboardContent />} />
						<Route path="settings">
							<Route path="profile" element={<Settings type="profile" />} />
							<Route path="system" element={<Settings type="system" />} />
						</Route>
						<Route path="chat" element={<ChatPage />} />
						<Route path="admin" element={<Admin />} />
						<Route path="graph" element={<GraphPage />} />
						<Route index element={<Navigate to="/dashboard" />} />
					</Route>
				</Routes>
			</div>
		</div>
	);
};

const App: React.FC = () => {
	return (
		<Router>
			<ThemeProviderWrapper>
				<AppContent />
			</ThemeProviderWrapper>
		</Router>
	);
};

export default App;
