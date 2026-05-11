import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Categoria {
  id: string;
  nome: string;
  icone: string;
  color_class: string;
  local?: string;
}

interface CategoriasContextType {
  categorias: Categoria[];
  loading: boolean;
  addCategoria: (c: Omit<Categoria, "local">) => Promise<void>;
  deleteCategoria: (id: string) => Promise<void>;
  refreshCategorias: () => Promise<void>;
}

const CategoriasContext = createContext<CategoriasContextType | undefined>(undefined);

export function CategoriasProvider({ children }: { children: ReactNode }) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCategorias = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) console.error("Erro ao carregar categorias:", error.message);
    else setCategorias(data || []);
    setLoading(false);
  };

  useEffect(() => {
    refreshCategorias();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (["SIGNED_IN", "TOKEN_REFRESHED", "INITIAL_SESSION", "SIGNED_OUT"].includes(event)) {
        refreshCategorias();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const addCategoria = async (c: Omit<Categoria, "local">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");
    const { data: profile } = await supabase
      .from("profiles").select("local").eq("user_id", user.id).single();
    if (!profile) throw new Error("Local do usuário não encontrado");
    const { error } = await supabase.from("categorias").insert([{ ...c, local: profile.local }]);
    if (error) throw new Error(error.message);
    await refreshCategorias();
  };

  const deleteCategoria = async (id: string) => {
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await refreshCategorias();
  };

  return (
    <CategoriasContext.Provider value={{ categorias, loading, addCategoria, deleteCategoria, refreshCategorias }}>
      {children}
    </CategoriasContext.Provider>
  );
}

export function useCategorias() {
  const ctx = useContext(CategoriasContext);
  if (!ctx) throw new Error("useCategorias deve ser usado dentro de CategoriasProvider");
  return ctx;
}
