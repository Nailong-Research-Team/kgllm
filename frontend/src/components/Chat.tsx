import React from 'react';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    List,
    ListItem,
    Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Message } from '../types/chat';

interface ChatProps {
    messages: Message[];
    onSendMessage: (content: string) => void;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage }) => {
    const [newMessage, setNewMessage] = React.useState('');

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Paper
                sx={{
                    flex: 1,
                    mb: 2,
                    overflow: 'auto',
                    bgcolor: 'background.default',
                }}>
                <List>
                    {messages.map((message) => (
                        <ListItem
                            key={message.id}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems:
                                    message.sender === 'user'
                                        ? 'flex-end'
                                        : 'flex-start',
                            }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 0.5,
                                }}>
                                <Avatar>
                                    {message.sender === 'user' ? 'U' : 'S'}
                                </Avatar>
                                <Typography variant="body2" color="text.secondary">
                                    {message.sender === 'user'
                                        ? '用户'
                                        : '系统'}
                                </Typography>
                            </Box>
                            <Paper
                                sx={{
                                    p: 1.5,
                                    maxWidth: '70%',
                                    bgcolor:
                                        message.sender === 'user'
                                            ? 'primary.main'
                                            : 'grey.100',
                                    color:
                                        message.sender === 'user'
                                            ? 'white'
                                            : 'text.primary',
                                }}>
                                <Typography>{message.content}</Typography>
                            </Paper>
                        </ListItem>
                    ))}
                </List>
            </Paper>
            <Paper sx={{ p: 2, display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入消息..."
                    variant="outlined"
                />
                <IconButton
                    color="primary"
                    onClick={handleSend}
                    disabled={!newMessage.trim()}>
                    <SendIcon />
                </IconButton>
            </Paper>
        </Box>
    );
};

export default Chat;