import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { User } from '../../types/user';
import { getAllUsers, updateUser, deleteUser } from '../../api/user';

const Admin: React.FC = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      setError('获取用户列表失败');
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setEditingUser(null);
    setOpenDialog(false);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      await updateUser(editingUser.id, editingUser);
      setSuccess('用户信息更新成功');
      fetchUsers();
      setTimeout(handleClose, 1500);
    } catch (error) {
      setError('更新用户信息失败');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('确定要删除这个用户吗？')) return;

    try {
      await deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      setError('删除用户失败');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        用户管理
      </Typography>
      <TableContainer 
        component={Paper}
        sx={{
          bgcolor: 'background.paper',
          '& .MuiTableCell-root': {
            borderColor: theme.palette.divider,
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>姓名</TableCell>
              <TableCell>邮箱</TableCell>
              <TableCell>角色</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.is_active ? '激活' : '禁用'}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEditClick(user)}
                    color="primary"
                    size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(user.id)}
                    color="error"
                    size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>编辑用户</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          {editingUser && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="姓名"
                value={editingUser.full_name}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    full_name: e.target.value,
                  })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="邮箱"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    email: e.target.value,
                  })
                }
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>角色</InputLabel>
                <Select
                  value={editingUser.role}
                  label="角色"
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value as 'admin' | 'user',
                    })
                  }>
                  <MenuItem value="admin">管理员</MenuItem>
                  <MenuItem value="user">普通用户</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>状态</InputLabel>
                <Select
                  value={editingUser.is_active ? "active" : "inactive"}
                  label="状态"
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      is_active: e.target.value === "active",
                    })
                  }>
                  <MenuItem value="active">激活</MenuItem>
                  <MenuItem value="inactive">禁用</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">
            取消
          </Button>
          <Button onClick={handleSave} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admin; 