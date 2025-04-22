import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Paper,
    Typography,
    Container,
    CircularProgress,
    Avatar,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/material/styles';
import { Message, chatService } from '../../services/chatService';

const MessageRow = styled(Box)<{ isUser: boolean }>(({ theme, isUser }) => ({
    display: 'flex',
    flexDirection: isUser ? 'row-reverse' : 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(2),
    width: '100%',
}));

const Bubble = styled(Paper)<{ isUser: boolean }>(({ theme, isUser }) => ({
    padding: theme.spacing(1.5, 2),
    borderRadius: 18,
    maxWidth: '90vw',
    backgroundColor: isUser ? theme.palette.primary.main : theme.palette.grey[100],
    color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    wordBreak: 'break-all',
    overflowWrap: 'break-word',
}));

const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // 新增：AI打字机效果相关状态
    const [isTyping, setIsTyping] = useState(false);
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
            // 打字机效果：先插入空AI消息
            const aiMessage: Message = {
                ...response,
                content: '',
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(true);
            let i = 0;
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = setInterval(() => {
                i++;
                setMessages(prev => {
                    const updated = [...prev];
                    // 只更新最后一条AI消息
                    updated[updated.length - 1] = { ...updated[updated.length - 1], content: response.content.slice(0, i) };
                    return updated;
                });
                if (i >= response.content.length) {
                    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
                    setIsTyping(false);
                    setIsLoading(false);
                }
            }, 24); // 打字速度可调整
        } catch (error) {
            console.error('发送消息失败:', error);
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
        <Box sx={{
            width: '100%',
            height: '100%',
            minHeight: 0,
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#fafcff',
            boxSizing: 'border-box',
        }}>
            {/* 消息区 */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                px: 0,
                py: { xs: 1, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                minHeight: 0,
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
            }}>
                {messages.map((message) => {
                    const isUser = message.role === 'user';
                    return (
                        <MessageRow key={message.id} isUser={isUser}>
                            <Avatar
                                src={isUser ? require('../../assets/user_avatar.png') : require('../../assets/ai_avatar.png')}
                                alt={isUser ? '用户' : 'AI'}
                                sx={{ width: 40, height: 40, mt: 0.5, mx: 1, bgcolor: isUser ? 'primary.main' : 'grey.200', alignSelf: 'flex-start' }}
                            >
                                {isUser ? 'U' : 'A'}
                            </Avatar>
                            <Bubble isUser={isUser} elevation={2} sx={{ mt: 0.5, ml: isUser ? 0 : 1, mr: isUser ? 1 : 0 }}>
                                {isUser ? (
                                    <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.content}</Typography>
                                ) : (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeHighlight]}
                                        components={{
                                            p: ({node, ...props}) => <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mb: 1 }} {...props} />,
                                            code: (props) => {
                                                const {inline, className, children, ...rest} = props as React.ComponentProps<'code'> & {inline?: boolean; className?: string; children?: React.ReactNode};
                                                let codeString = '';
                                                if (Array.isArray(children)) {
                                                    codeString = children.join('');
                                                } else if (typeof children === 'string') {
                                                    codeString = children;
                                                } else if (children) {
                                                    codeString = String(children);
                                                }
                                                if (inline) {
                                                    return <code style={{ background: '#f6f8fa', borderRadius: 4, padding: '2px 4px' }} {...rest}>{codeString}</code>;
                                                }
                                                return (
                                                    <pre className={className} style={{ background: '#f6f8fa', borderRadius: 6, padding: 12, overflow: 'auto' }}>
                                                        <code>{codeString}</code>
                                                    </pre>
                                                );
                                            }
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                )}
                            </Bubble>
                        </MessageRow>
                    );
                })}
                <div ref={messagesEndRef} />
            </Box>
            {/* 输入区固定底部 */}
            <Box sx={{
                p: { xs: 1, sm: 2 },
                borderTop: 1,
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                boxShadow: '0 -2px 8px rgba(0,0,0,0.03)',
                width: '100%',
                maxWidth: '100%',
                position: 'sticky',
                bottom: 0,
                left: 0,
                zIndex: 10,
                boxSizing: 'border-box',
            }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="输入消息..."
                        disabled={isLoading}
                        sx={{ flex: 1, background: '#fff', borderRadius: 2 }}
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        sx={{ height: 48, width: 48 }}
                    >
                        {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default ChatPage; 