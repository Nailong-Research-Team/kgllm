import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Paper,
    Typography,
    Container,
    CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/material/styles';
import { Message, chatService } from '../../services/chatService';

const MessageContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    maxWidth: '80%',
    wordWrap: 'break-word',
}));

const UserMessage = styled(MessageContainer)(({ theme }) => ({
    marginLeft: 'auto',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
}));

const AssistantMessage = styled(MessageContainer)(({ theme }) => ({
    marginRight: 'auto',
    backgroundColor: theme.palette.background.paper,
}));

const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await chatService.getHistory();
                setMessages(history);
            } catch (error) {
                console.error('Failed to load chat history:', error);
            }
        };
        loadHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const trimmedInput = input.trim();
        setInput('');
        setIsLoading(true);

        const userMessage: Message = {
            id: Date.now().toString(),
            content: trimmedInput,
            role: 'user',
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            const response = await chatService.sendMessage(trimmedInput);
            setMessages(prev => [...prev, response]);
        } catch (error) {
            console.error('发送消息失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <Container maxWidth="md" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}>
                {messages.map((message) => (
                    message.role === 'user' ? (
                        <UserMessage key={message.id} elevation={1}>
                            <Typography>{message.content}</Typography>
                        </UserMessage>
                    ) : (
                        <AssistantMessage key={message.id} elevation={1}>
                            <Typography>{message.content}</Typography>
                        </AssistantMessage>
                    )
                ))}
                <div ref={messagesEndRef} />
            </Box>
            <Box sx={{ 
                p: 2, 
                borderTop: 1, 
                borderColor: 'divider',
                backgroundColor: 'background.paper',
            }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="输入消息..."
                        disabled={isLoading}
                        sx={{ flex: 1 }}
                    />
                    <IconButton 
                        color="primary" 
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                    >
                        {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
                    </IconButton>
                </Box>
            </Box>
        </Container>
    );
};

export default ChatPage; 