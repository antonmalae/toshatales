import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import characterService from "@/services/characterService.js";

interface Character {
  id: string;
  name: string;
  image?: string;
  role?: {
    id: string;
    name: string;
  };
}

interface CharacterMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CharacterMultiSelect({
  value,
  onChange,
  placeholder = "Выберите персонажей...",
  disabled = false,
}: CharacterMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setLoading(true);
        const response = await characterService.getAllCharacters();
        setCharacters(response.data || []);
      } catch (error) {
        console.error("Error loading characters:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, []);

  const selectedCharacters = characters.filter((char) => value.includes(char.id));

  const handleSelect = (characterId: string) => {
    const newValue = value.includes(characterId)
      ? value.filter((id) => id !== characterId)
      : [...value, characterId];
    onChange(newValue);
  };

  const handleRemove = (characterId: string) => {
    onChange(value.filter((id) => id !== characterId));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {value.length === 0
              ? placeholder
              : `${value.length} персонаж(ей) выбрано`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Поиск персонажей..." />
            <CommandList>
              <CommandEmpty>
                {loading ? "Загрузка..." : "Персонажи не найдены."}
              </CommandEmpty>
              <CommandGroup>
                {characters.map((character) => (
                  <CommandItem
                    key={character.id}
                    value={character.name}
                    onSelect={() => handleSelect(character.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(character.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2">
                      {character.image && (
                        <img
                          src={character.image}
                          alt={character.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                      <span>{character.name}</span>
                      {character.role && (
                        <Badge variant="secondary" className="text-xs">
                          {character.role.name}
                        </Badge>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Отображение выбранных персонажей */}
      {selectedCharacters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCharacters.map((character) => (
            <Badge
              key={character.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <div className="flex items-center gap-1">
                {character.image && (
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                )}
                <span>{character.name}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(character.id)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
} 