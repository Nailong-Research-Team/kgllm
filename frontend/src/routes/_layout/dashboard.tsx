import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";

const Dashboard: React.FC = () => {
	return (
		<Box
			sx={{
				display: "flex",
				height: "100%",
				bgcolor: "background.default",
			}}>
			<Box
				component="nav"
				sx={{
					width: 240,
					flexShrink: 0,
					height: "100%",
					bgcolor: "background.paper",
					borderRight: 1,
					borderColor: "divider",
					position: "fixed",
					left: 0,
				}}>
				<Sidebar />
			</Box>
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					ml: "240px",
					height: "100%",
					bgcolor: "background.default",
					overflow: "auto",
				}}>
				<Outlet />
			</Box>
		</Box>
	);
};

export default Dashboard;
