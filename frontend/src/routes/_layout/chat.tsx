import React from "react";
import { Box } from "@mui/material";
import Chat from "../../components/Chat";

const ChatPage: React.FC = () => {
	return (
		<Box sx={{ p: 3, height: "100%" }}>
			<Chat messages={[]} onSendMessage={() => {}} />
		</Box>
	);
};

export default ChatPage; 