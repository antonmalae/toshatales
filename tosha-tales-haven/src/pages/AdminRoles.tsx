import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Shield,
  Users
} from "lucide-react";
import roleService from "../services/roleService.js";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";

interface Role {
  id: number;
  name: string;
  description: string;
  type: "protagonist" | "antagonist" | "supporting" | "mentor" | "helper";
  charactersCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminRoles() {
  const { darkMode, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'protagonist' as Role['type']
  });

  // Загружаем роли
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const response = await roleService.getRoles();
        setRoles(response.data || []);
      } catch (err) {
        console.error('Error loading roles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.id.toString(), formData);
        toast({
          title: "Успех",
          description: "Роль успешно обновлена"
        });
      } else {
        await roleService.createRole(formData);
        toast({
          title: "Успех",
          description: "Роль успешно создана"
        });
      }
      
      // Обновляем список
      const response = await roleService.getRoles();
      setRoles(response.data || []);
      
      // Сбрасываем форму
      setFormData({ name: '', description: '', type: 'protagonist' });
      setEditingRole(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error saving role:', err);
      toast({
        title: "Ошибка",
        description: err.response?.data?.error || "Не удалось сохранить роль",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      type: role.type
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту роль?')) {
      try {
        await roleService.deleteRole(id.toString());
        setRoles(roles.filter(role => role.id !== id));
        toast({
          title: "Успех",
          description: "Роль успешно удалена"
        });
      } catch (err) {
        console.error('Error deleting role:', err);
        toast({
          title: "Ошибка",
          description: err.response?.data?.error || "Не удалось удалить роль",
          variant: "destructive"
        });
      }
    }
  };

  const getRoleTypeColor = (type: Role["type"]) => {
    const colors = {
      protagonist: "bg-green-500",
      antagonist: "bg-red-500", 
      supporting: "bg-blue-500",
      mentor: "bg-purple-500",
      helper: "bg-orange-500"
    };
    return colors[type];
  };

  const getRoleTypeLabel = (type: Role["type"]) => {
    const labels = {
      protagonist: "Главный герой",
      antagonist: "Антагонист", 
      supporting: "Второстепенный",
      mentor: "Наставник",
      helper: "Помощник"
    };
    return labels[type];
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary mb-2">
              Управление ролями
            </h1>
            <p className="text-muted-foreground">
              Создавайте и редактируйте роли персонажей
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Добавить роль
          </Button>
        </div>

        {/* Форма добавления/редактирования */}
        {showForm && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {editingRole ? 'Редактировать роль' : 'Новая роль'}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowForm(false);
                setEditingRole(null);
                setFormData({ name: '', description: '', type: 'protagonist' });
              }}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Введите название роли"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Тип роли</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Role['type'] })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    required
                  >
                    <option value="protagonist">Главный герой</option>
                    <option value="antagonist">Антагонист</option>
                    <option value="supporting">Второстепенный</option>
                    <option value="mentor">Наставник</option>
                    <option value="helper">Помощник</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Краткое описание роли"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingRole ? 'Сохранить' : 'Создать'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRole(null);
                    setFormData({ name: '', description: '', type: 'protagonist' });
                  }}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Список ролей */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Загружаем роли...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card key={role.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${getRoleTypeColor(role.type)} rounded-lg flex items-center justify-center`}>
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {role.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {getRoleTypeLabel(role.type)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {role.charactersCount}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {role.description}
                </p>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {new Date(role.createdAt).toLocaleDateString()}
                  </Badge>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(role)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(role.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && roles.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Роли не найдены
            </h3>
            <p className="text-muted-foreground">
              Создайте первую роль для персонажей
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
} 