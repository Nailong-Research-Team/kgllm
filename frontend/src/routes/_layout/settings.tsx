import React, { useState, useContext, useEffect } from "react";
import {
	Box,
	Typography,
	TextField,
	Button,
	Stack,
	Alert,
	Tabs,
	Tab,
} from "@mui/material";
import { ThemeContext } from "../../App";
import axiosInstance from "../../utils/axios";
import { API_CONFIG } from "../../config/api";

interface SettingsProps {
	type: "profile" | "system";
}

const Settings: React.FC<SettingsProps> = ({ type }) => {
	const { themeMode, toggleTheme } = useContext(ThemeContext);
	const [tabValue, setTabValue] = useState(0);
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	// const [language, setLanguage] = useState("zh");
	const [loading, setLoading] = useState(true);

	// 获取用户信息
	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.USER_PROFILE);
				setFullName(response.data.full_name);
				setEmail(response.data.email);
			} catch (error) {
				console.error("获取用户信息失败:", error);
				setError("获取用户信息失败");
			}
		};

		fetchUserProfile();
	}, []);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleThemeChange = (mode: "light" | "dark") => {
		if (mode !== themeMode) {
			toggleTheme();
		}
	};

	// const handleLanguageChange = (lang: string) => {
	// 	setLanguage(lang);
	// };

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await axiosInstance.put(API_CONFIG.ENDPOINTS.USER_PROFILE, {
				full_name: fullName,
				email: email,
			});
			setSuccess("个人信息更新成功");
		} catch (error) {
			console.error("更新用户信息失败:", error);
			setError("更新用户信息失败");
		}
	};

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			setError("两次输入的密码不一致");
			return;
		}

		try {
			await axiosInstance.put(`${API_CONFIG.ENDPOINTS.USER_PROFILE}/password`, {
				old_password: oldPassword,
				new_password: newPassword,
			});
			setSuccess("密码修改成功");
			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (error) {
			console.error("修改密码失败:", error);
			setError("修改密码失败，请检查当前密码是否正确");
		}
	};

	const handleCancel = () => {
		if (type === "profile") {
			// 重新获取用户信息
			const fetchUserProfile = async () => {
				try {
					const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.USER_PROFILE);
					setFullName(response.data.full_name);
					setEmail(response.data.email);
				} catch (error) {
					console.error("获取用户信息失败:", error);
					setError("获取用户信息失败");
				}
			};

			fetchUserProfile();
		}
		setOldPassword("");
		setNewPassword("");
		setConfirmPassword("");
		setError("");
		setSuccess("");
	};

	if (type === "profile") {
		return (
			<Box sx={{ p: 3 }}>
				<Typography variant="h4" sx={{ mb: 4 }}>
					个人资料
				</Typography>
				<Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
					<Tabs value={tabValue} onChange={handleTabChange}>
						<Tab label="个人信息" sx={{ textTransform: "none" }} />
						<Tab label="密码" sx={{ textTransform: "none" }} />
					</Tabs>
				</Box>

				{tabValue === 0 && (
					<Box sx={{ maxWidth: 600 }}>
						<form onSubmit={handleSave}>
							<Stack spacing={3}>
								<Box>
									<Typography variant="body1" sx={{ mb: 1 }}>
										全名
									</Typography>
									<TextField
										value={fullName}
										onChange={(e) => setFullName(e.target.value)}
										fullWidth
										size="small"
									/>
								</Box>

								<Box>
									<Typography variant="body1" sx={{ mb: 1 }}>
										邮箱
									</Typography>
									<TextField
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										fullWidth
										size="small"
									/>
								</Box>

								<Box sx={{ display: "flex", gap: 2, mt: 2 }}>
									<Button
										variant="contained"
										color="primary"
										type="submit"
										sx={{ textTransform: "none" }}>
										保存
									</Button>
									<Button
										variant="outlined"
										onClick={handleCancel}
										sx={{
											textTransform: "none",
											bgcolor: "background.paper",
										}}>
										取消
									</Button>
								</Box>
							</Stack>
						</form>
					</Box>
				)}

				{tabValue === 1 && (
					<Box sx={{ maxWidth: 600 }}>
						<form onSubmit={handlePasswordChange}>
							<Stack spacing={3}>
								{error && <Alert severity="error">{error}</Alert>}
								{success && (
									<Alert severity="success">密码修改成功！</Alert>
								)}

								<TextField
									label="当前密码"
									type="password"
									value={oldPassword}
									onChange={(e) => setOldPassword(e.target.value)}
									required
									fullWidth
									size="small"
								/>

								<TextField
									label="新密码"
									type="password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									required
									fullWidth
									size="small"
								/>

								<TextField
									label="确认新密码"
									type="password"
									value={confirmPassword}
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
									required
									fullWidth
									size="small"
								/>

								<Box sx={{ display: "flex", gap: 2 }}>
									<Button
										type="submit"
										variant="contained"
										sx={{ textTransform: "none" }}>
										保存
									</Button>
									<Button
										variant="outlined"
										onClick={handleCancel}
										sx={{
											textTransform: "none",
											bgcolor: "background.paper",
										}}>
										取消
									</Button>
								</Box>
							</Stack>
						</form>
					</Box>
				)}
			</Box>
		);
	}

	// 系统设置
	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" sx={{ mb: 4 }}>
				系统设置
			</Typography>
			<Box sx={{ maxWidth: 600 }}>
				<Stack spacing={3}>
					<Box>
						<Typography variant="h6" sx={{ mb: 3 }}>
							外观设置
						</Typography>
						<Box>
							<Typography variant="body1" sx={{ mb: 1 }}>
								主题模式
							</Typography>
							<Button
								variant={themeMode === "light" ? "contained" : "outlined"}
								onClick={() => handleThemeChange("light")}
								sx={{ mr: 2 }}>
								浅色
							</Button>
							<Button
								variant={themeMode === "dark" ? "contained" : "outlined"}
								onClick={() => handleThemeChange("dark")}>
								深色
							</Button>
						</Box>
					</Box>
					{/* <Box>
						<Typography variant="body1" sx={{ mb: 1 }}>
							语言
						</Typography>
						<Button
							variant={language === "zh" ? "contained" : "outlined"}
							onClick={() => handleLanguageChange("zh")}
							sx={{ mr: 2 }}>
							简体中文
						</Button>
						<Button
							variant={language === "en" ? "contained" : "outlined"}
							onClick={() => handleLanguageChange("en")}>
							English
						</Button>
					</Box> */}
				</Stack>
			</Box>
		</Box>
	);
};

export default Settings; 