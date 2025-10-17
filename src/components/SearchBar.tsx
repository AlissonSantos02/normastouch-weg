import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = "Buscar normas..." }: SearchBarProps) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-6 w-6" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-14 h-16 text-lg rounded-2xl shadow-md border-2 focus-visible:ring-4 focus-visible:ring-primary/20"
      />
    </div>
  );
};
