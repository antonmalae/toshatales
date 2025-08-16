import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Lock, 
  Unlock,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  MoreHorizontal
} from "lucide-react";
import userService from "../services/userService.js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Схемы валидации
const createUserSchema = z.object({
  email: z.string().email('Некорректный email'),
  fullName: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100, 'Имя не должно превышать 100 символов'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать буквы верхнего и нижнего регистра, а также цифры'),
  isActive: z.boolean().default(true)
});

const updateUserSchema = z.object({
  email: z.string().email('Некорректный email'),
  fullName: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100, 'Имя не должно превышать 100 символов'),
  isActive: z.boolean()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
  newPassword: z.string().min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать буквы верхнего и нижнего регистра, а также цифры'),
  confirmNewPassword: z.string().min(1, 'Подтверждение пароля обязательно')
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmNewPassword']
});

const AdminUsers = () => {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Проверяем токен при загрузке компонента
  useEffect(() => {
    const token = localStorage.getItem('authToken');
  }, []);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Состояния для диалогов
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Состояния для форм
  const [selectedUser, setSelectedUser] = useState(null);
  const [tempPassword, setTempPassword] = useState('');

  // Формы
  const createForm = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      isActive: true
    }
  });

  const updateForm = useForm({
    resolver: zodResolver(updateUserSchema)
  });

  const changePasswordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  // Загрузка пользователей
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await userService.getUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        sortBy,
        sortOrder
      });
      
      if (response && response.users) {
        setUsers(response.users);
        setTotalPages(response.pagination.pages);
        setTotalUsers(response.pagination.total);
      } else {
        setUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить пользователей",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, sortBy, sortOrder, toast]);

  useEffect(() => {
    // Добавляем небольшую задержку для гарантии, что токен сохранен
    const timer = setTimeout(() => {
      loadUsers();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [loadUsers]);

  // Обработчики
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleCreateUser = async (data) => {
    try {
      await userService.createUser({
        ...data,
        role: 'ADMIN'
      });
      
      toast({
        title: "Успех",
        description: "Пользователь успешно создан"
      });
      
      setCreateDialogOpen(false);
      createForm.reset();
      loadUsers();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось создать пользователя",
        variant: "destructive"
      });
    }
  };

  const handleUpdateUser = async (data) => {
    try {
      await userService.updateUser(selectedUser.id, data);
      
      toast({
        title: "Успех",
        description: "Пользователь успешно обновлен"
      });
      
      setEditDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось обновить пользователя",
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = async (data) => {
    try {
      await userService.changePassword(data);
      
      toast({
        title: "Успех",
        description: "Пароль успешно изменен"
      });
      
      setChangePasswordDialogOpen(false);
      changePasswordForm.reset();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось изменить пароль",
        variant: "destructive"
      });
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await userService.resetPassword(selectedUser.id);
      
      setTempPassword(response.temporaryPassword);
      
      toast({
        title: "Успех",
        description: "Пароль успешно сброшен"
      });
      
      // Закрываем диалог после успешного сброса
      setTimeout(() => {
        setResetPasswordDialogOpen(false);
        setTempPassword('');
      }, 2000);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось сбросить пароль",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const updatedUser = await userService.toggleUserStatus(userId);
      
      // Обновляем состояние локально для мгновенного отображения
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, isActive: updatedUser.isActive }
            : user
        )
      );
      
      // Обновляем статистику локально
      setTotalUsers(prevTotal => prevTotal); // Пересчитываем автоматически
      
      toast({
        title: "Успех",
        description: `Пользователь ${updatedUser.isActive ? 'активирован' : 'деактивирован'}`
      });
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось изменить статус",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      await userService.deleteUser(selectedUser.id);
      
      toast({
        title: "Успех",
        description: "Пользователь успешно удален"
      });
      
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось удалить пользователя",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    updateForm.reset({
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive
    });
    setEditDialogOpen(true);
  };

  const openViewDialog = (user) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const openChangePasswordDialog = () => {
    setChangePasswordDialogOpen(true);
  };

  const openResetPasswordDialog = (user) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <span onClick={() => navigate('/admin')} className="cursor-pointer hover:text-primary">
            Админ
          </span>
          <span>/</span>
          <span onClick={() => navigate('/admin/settings')} className="cursor-pointer hover:text-primary">
            Настройки
          </span>
          <span>/</span>
          <span className="text-primary">Пользователи</span>
        </nav>

        {/* Заголовок */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">
              Управление пользователями
            </h1>
            <p className="text-muted-foreground mt-2">
              Создание, редактирование и управление пользователями системы
            </p>
          </div>
          
          <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Добавить пользователя
          </Button>
        </div>

        {/* Поиск и фильтры */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Поиск по email или имени..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={loadUsers}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </Card>

        {/* Таблица пользователей */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    Email
                    {sortBy === 'email' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Последний вход</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    Дата создания
                    {sortBy === 'createdAt' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Загрузка...
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Пользователи не найдены
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role === 'ADMIN' ? 'Администратор' : user.role}
                      </Badge>
                    </TableCell>
                                         <TableCell>
                       <Badge 
                         variant={user.isActive ? 'default' : 'destructive'}
                         className="flex items-center gap-1"
                       >
                         {user.isActive ? (
                           <>
                             <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                             Активен
                           </>
                         ) : (
                           <>
                             <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                             Неактивен
                           </>
                         )}
                       </Badge>
                     </TableCell>
                    <TableCell>
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Никогда'}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                                                 <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => openViewDialog(user)}
                           title="Просмотр пользователя"
                         >
                           <Eye className="w-4 h-4" />
                         </Button>
                         
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => openEditDialog(user)}
                           title="Редактировать пользователя"
                         >
                           <Edit className="w-4 h-4" />
                         </Button>
                        
                                                 <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => openResetPasswordDialog(user)}
                           title="Сбросить пароль"
                         >
                           <Lock className="w-4 h-4" />
                         </Button>
                         
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleToggleStatus(user.id)}
                           title={user.isActive ? "Деактивировать пользователя" : "Активировать пользователя"}
                         >
                           {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                         </Button>
                        
                                                 <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => openDeleteDialog(user)}
                           title="Удалить пользователя"
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Статистика */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalUsers}</div>
            <div className="text-sm text-muted-foreground">Всего пользователей</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Активных</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'ADMIN').length}
            </div>
            <div className="text-sm text-muted-foreground">Администраторов</div>
          </Card>
        </div>

        {/* Диалог создания пользователя */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Создать пользователя</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateUser)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="user@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Полное имя</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Иван Иванов" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="Минимум 8 символов" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Статус</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={field.value ? 'true' : 'false'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите статус" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Активен</SelectItem>
                          <SelectItem value="false">Неактивен</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button type="submit">Создать</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Диалог редактирования пользователя */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Редактировать пользователя</DialogTitle>
            </DialogHeader>
            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(handleUpdateUser)} className="space-y-4">
                <FormField
                  control={updateForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={updateForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Полное имя</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={updateForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Статус</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value ? 'true' : 'false'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Активен</SelectItem>
                          <SelectItem value="false">Неактивен</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button type="submit">Сохранить</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Диалог просмотра пользователя */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Информация о пользователе</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Полное имя</Label>
                  <p className="text-sm">{selectedUser.fullName}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Роль</Label>
                  <Badge variant={selectedUser.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {selectedUser.role === 'ADMIN' ? 'Администратор' : selectedUser.role}
                  </Badge>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Статус</Label>
                  <Badge variant={selectedUser.isActive ? 'default' : 'destructive'}>
                    {selectedUser.isActive ? 'Активен' : 'Неактивен'}
                  </Badge>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Последний вход</Label>
                  <p className="text-sm">
                    {selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Никогда'}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Дата создания</Label>
                  <p className="text-sm">{formatDate(selectedUser.createdAt)}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Дата обновления</Label>
                  <p className="text-sm">{formatDate(selectedUser.updatedAt)}</p>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={() => setViewDialogOpen(false)}>Закрыть</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Диалог смены пароля */}
        <Dialog open={changePasswordDialogOpen} onOpenChange={setChangePasswordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Сменить пароль</DialogTitle>
            </DialogHeader>
            <Form {...changePasswordForm}>
              <form onSubmit={changePasswordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                <FormField
                  control={changePasswordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Текущий пароль</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={changePasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Новый пароль</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={changePasswordForm.control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Подтвердите новый пароль</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setChangePasswordDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button type="submit">Сменить пароль</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Диалог сброса пароля */}
        <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Сбросить пароль</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <p>
                  Вы собираетесь сбросить пароль для пользователя <strong>{selectedUser.fullName}</strong> 
                  ({selectedUser.email}). Будет сгенерирован временный пароль.
                </p>
                
                {tempPassword && (
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Временный пароль:</Label>
                    <p className="text-lg font-mono bg-background p-2 rounded mt-2">{tempPassword}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Сохраните этот пароль! Он больше не будет показан.
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setResetPasswordDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button onClick={handleResetPassword}>
                    {tempPassword ? 'Сбросить еще раз' : 'Сбросить пароль'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Диалог удаления пользователя */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Удалить пользователя</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <p>
                  Вы уверены, что хотите удалить пользователя <strong>{selectedUser.fullName}</strong> 
                  ({selectedUser.email})? Это действие нельзя отменить.
                </p>
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteUser}>
                    Удалить
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Кнопка смены пароля для себя */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={openChangePasswordDialog}>
            <Lock className="w-4 h-4 mr-2" />
            Сменить мой пароль
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminUsers;
