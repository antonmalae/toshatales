import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Users,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import characterService from "../services/characterService.js";
import roleService from "../services/roleService.js";
import uploadService from "../services/uploadService.js";
import { useTheme } from "@/hooks/use-theme";

// Константа для картинки-заглушки
const DEFAULT_CHARACTER_IMAGE = '/lovable-uploads/default-character.png';

interface Character {
  id: string;
  name: string;
  description: string;
  likes?: number;
  rating?: number;
  image?: string;
  role?: {
    id: string;
    name: string;
    description?: string;
  };
  stories?: string[];
  _count?: {
    stories: number;
    likes: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

const AdminCharacters = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [characters, setCharacters] = useState<Character[]>([]);
  
  // Отладочная функция для отслеживания изменений персонажей
  const setCharactersWithLog = (newCharacters: Character[]) => {
    console.log('Setting characters:', newCharacters);
    setCharacters(newCharacters);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Array<{id: string, name: string}>>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    roleId: '',
    image: ''
  });
  
  // Состояния для загрузки изображений
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageRemoved, setImageRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Загружаем персонажей
        const charactersResponse = await characterService.getCharacters();
        const charactersData = charactersResponse.data || charactersResponse || [];
        console.log('Loaded characters:', charactersData); // Для отладки
        setCharactersWithLog(charactersData);
        
        // Загружаем роли
        const rolesResponse = await roleService.getRoles();
        const rolesData = rolesResponse.data || rolesResponse || [];
        setRoles(rolesData);
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    console.log('handleDelete called with id:', id); // Для отладки
    if (window.confirm("Вы уверены, что хотите удалить этого персонажа?")) {
      try {
        console.log('Deleting character with id:', id); // Для отладки
        await characterService.deleteCharacter(id);
        console.log('Character deleted successfully'); // Для отладки
        setCharactersWithLog(characters.filter(char => char.id !== id));
      } catch (error) {
        console.error('Error deleting character:', error);
        alert('Ошибка при удалении персонажа');
      }
    }
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      description: character.description,
      roleId: character.role?.id || '',
      image: character.image || ''
    });
    // Устанавливаем превью изображения если оно есть
    setImagePreview(character.image || DEFAULT_CHARACTER_IMAGE);
    setSelectedImage(null);
    setImageRemoved(false);
    setShowAddForm(true);
  };

  const handleSave = async (characterData: Partial<Character>) => {
    console.log('handleSave called with data:', characterData); // Для отладки
    try {
      // Если есть выбранное изображение, загружаем его
      let imageUrl = characterData.image;
      if (selectedImage) {
        try {
          setUploadingImage(true);
          // Добавляем небольшую задержку для избежания ошибки 429
          await new Promise(resolve => setTimeout(resolve, 500));
          const uploadResponse = await uploadService.uploadFile(selectedImage);
          imageUrl = uploadResponse.data.url;
        } catch (err) {
          console.error('Error uploading image:', err);
          let errorMessage = 'Ошибка при загрузке изображения';
          if (err.message.includes('429')) {
            errorMessage += ': Слишком много запросов. Попробуйте через несколько секунд.';
          } else {
            errorMessage += ': ' + err.message;
          }
          alert(errorMessage);
          return;
        } finally {
          setUploadingImage(false);
        }
      } else if (imageRemoved) {
        // Пользователь удалил изображение
        imageUrl = DEFAULT_CHARACTER_IMAGE;
      }

      if (editingCharacter) {
        // Обновляем существующего персонажа
        const updateData: any = {};
        
        // Проверяем, что хотя бы одно поле изменилось
        const hasChanges = 
          (characterData.name?.trim() !== editingCharacter.name) ||
          (characterData.description?.trim() !== editingCharacter.description) ||
          (characterData.roleId?.trim() !== editingCharacter.role?.id) ||
          (imageUrl !== editingCharacter.image) ||
          imageRemoved;
        
        if (!hasChanges) {
          setShowAddForm(false);
          setEditingCharacter(null);
          setSelectedImage(null);
          setImagePreview(null);
          setFormData({
            name: '',
            description: '',
            roleId: '',
            image: ''
          });
          return;
        }
        
        // Добавляем поля только если они изменились и не пустые
        if (characterData.name && characterData.name.trim() !== '' && characterData.name.trim() !== editingCharacter.name) {
          updateData.name = characterData.name.trim();
        }
        if (characterData.description && characterData.description.trim() !== '' && characterData.description.trim() !== editingCharacter.description) {
          updateData.description = characterData.description.trim();
        }
        if (characterData.roleId && characterData.roleId.trim() !== '' && characterData.roleId.trim() !== editingCharacter.role?.id) {
          updateData.roleId = characterData.roleId.trim();
        }
        // Обрабатываем изображение
        if (imageUrl !== editingCharacter.image || imageRemoved) {
          if (imageUrl && imageUrl.trim() !== '') {
            // Новое изображение
            updateData.image = imageUrl.trim();
          } else if (editingCharacter.image || imageRemoved) {
            // Устанавливаем картинку-заглушку вместо удаления
            updateData.image = DEFAULT_CHARACTER_IMAGE;
          }
        }
        
        // Если нет изменений, просто закрываем форму
        if (Object.keys(updateData).length === 0) {
          setShowAddForm(false);
          setEditingCharacter(null);
          setSelectedImage(null);
          setImagePreview(null);
          setFormData({
            name: '',
            description: '',
            roleId: '',
            image: ''
          });
          return;
        }
        
        console.log('Updating character with data:', updateData); // Для отладки
        console.log('Character ID:', editingCharacter.id); // Для отладки
        console.log('Image URL being sent:', updateData.image); // Для отладки
        
        const updatedCharacter = await characterService.updateCharacter(editingCharacter.id, updateData);
        
        setCharactersWithLog(characters.map(char => 
          char.id === editingCharacter.id 
            ? { ...char, ...updatedCharacter.data }
            : char
        ));
        setEditingCharacter(null);
      } else {
        // Создаем нового персонажа
        const createData: any = {
          name: characterData.name?.trim() || '',
          description: characterData.description?.trim() || '',
          roleId: characterData.roleId?.trim() || ''
        };
        
        // Проверяем обязательные поля
        if (!createData.name || !createData.description || !createData.roleId) {
          alert('Пожалуйста, заполните все обязательные поля');
          return;
        }
        
        // Добавляем image - либо загруженное, либо картинку-заглушку
        if (imageUrl && imageUrl.trim() !== '') {
          createData.image = imageUrl.trim();
        } else {
          // Всегда устанавливаем картинку-заглушку для новых персонажей
          createData.image = DEFAULT_CHARACTER_IMAGE;
        }
        
        console.log('Creating character with data:', createData); // Для отладки
        console.log('Image URL being sent:', createData.image); // Для отладки
        
        const newCharacter = await characterService.createCharacter(createData);
        
        setCharactersWithLog([...characters, newCharacter.data]);
      }
      
      // Очищаем состояние изображения
      setSelectedImage(null);
      setImagePreview(null);
      setImageRemoved(false);
      setShowAddForm(false);
      setFormData({
        name: '',
        description: '',
        roleId: '',
        image: ''
      });
    } catch (error) {
      console.error('Error saving character:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Ошибка при сохранении персонажа: ${error.response?.data?.error || error.message}`);
    }
  };

  // Функции для работы с изображениями
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }
      
      // Проверяем размер файла (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Создаем превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(DEFAULT_CHARACTER_IMAGE);
    setImageRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredCharacters = characters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         character.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || character.role?.id === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Заголовок */}
              <div className="flex items-center justify-between mb-8">
                  <div>
            <h1 className="text-3xl font-heading font-bold text-primary mb-2">
                      Управление персонажами
                    </h1>
            <p className="text-muted-foreground">
              Создавайте и редактируйте персонажей сказок
                    </p>
                  </div>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
                  Добавить персонажа
                </Button>
              </div>

        {/* Фильтры */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <Input
                      placeholder="Поиск персонажей..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
                    />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
                  >
            <option value="all">Все роли</option>
                    {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

              {/* Список персонажей */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Загружаем персонажей...</p>
          </div>
        ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCharacters.map((character) => (
              <Card key={character.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-soft">
                      <img
                        src={character.image || DEFAULT_CHARACTER_IMAGE}
                        alt={character.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Если изображение не загружается, используем заглушку
                          const target = e.target as HTMLImageElement;
                          target.src = DEFAULT_CHARACTER_IMAGE;
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {character.name}
                      </h3>
                        <Badge variant="outline" className="text-xs">
                          {character.role?.name || 'Без роли'}
                        </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {character._count?.likes || character.likes || 0}
                  </div>
                      </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {character.description}
                </p>

                      <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {character._count?.stories || 0} сказок
                  </Badge>
                  
                  <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(character)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(character.id);
                            }}
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

        {!loading && filteredCharacters.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Персонажи не найдены
            </h3>
            <p className="text-muted-foreground">
              Попробуйте изменить фильтры или создайте нового персонажа
            </p>
          </div>
        )}

        {/* Форма создания/редактирования персонажа */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-bold text-foreground">
                    {editingCharacter ? 'Редактировать персонажа' : 'Создать персонажа'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingCharacter(null);
                      setSelectedImage(null);
                      setImagePreview(null);
                      setImageRemoved(false);
                      setFormData({
                        name: '',
                        description: '',
                        roleId: '',
                        image: ''
                      });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Form submitted'); // Для отладки
                  handleSave(formData);
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Имя персонажа</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Введите имя персонажа"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Опишите персонажа"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Роль</Label>
                    <Select
                      value={formData.roleId}
                      onValueChange={(value) => setFormData({...formData, roleId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите роль" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="image">Изображение персонажа</Label>
                    <div className="space-y-2">
                      {/* Скрытый input для выбора файла */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      
                      {/* Превью изображения */}
                      {(imagePreview || editingCharacter?.image) && (
                        <div className="relative">
                          <img
                            src={imagePreview || editingCharacter?.image || DEFAULT_CHARACTER_IMAGE}
                            alt="Превью изображения"
                            className="w-32 h-32 object-cover rounded-lg border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = DEFAULT_CHARACTER_IMAGE;
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 w-6 h-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Кнопки загрузки */}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleImageUpload}
                          disabled={uploadingImage}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {uploadingImage ? 'Загрузка...' : 'Выбрать изображение'}
                        </Button>
                        {imagePreview && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={removeImage}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Удалить
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      {editingCharacter ? 'Обновить' : 'Создать'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingCharacter(null);
                        setSelectedImage(null);
                        setImagePreview(null);
                        setImageRemoved(false);
                        setFormData({
                          name: '',
                          description: '',
                          roleId: '',
                          image: ''
                        });
                      }}
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminCharacters; 