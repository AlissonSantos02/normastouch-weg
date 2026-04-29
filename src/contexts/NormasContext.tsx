import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Norma {
  id: string;
  titulo: string;
  categoria: string;
  descricao?: string;
  pdf_url?: string;
  pdf_path?: string;
  local?: string;
  created_at?: string;
  updated_at?: string;
}

interface NormasContextType {
  normas: Norma[];
  loading: boolean;
  addNorma: (norma: Omit<Norma, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateNorma: (id: string, data: Partial<Norma>) => Promise<void>;
  deleteNorma: (id: string) => Promise<void>;
  refreshNormas: () => Promise<void>;
}

const NormasContext = createContext<NormasContextType | undefined>(undefined);

export function NormasProvider({ children }: { children: ReactNode }) {
  const [normas, setNormas] = useState<Norma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshNormas();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
        refreshNormas();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const refreshNormas = async () => {
    setLoading(true);


    console.log("🔍 Supabase client:", supabase);
console.log("🌐 URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("🗝️  Key:", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

    const { data, error } = await supabase
      .from("normas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Erro ao carregar normas:", error.message);
    } else {
      setNormas(data || []);
    }

    setLoading(false);
  };

  const addNorma = async (novaNorma: Omit<Norma, "id" | "created_at" | "updated_at">) => {
    console.log("🔵 Tentando adicionar norma:", novaNorma);
    
    // Verifica autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("👤 Usuário autenticado:", user?.id || "nenhum");
    
    if (authError || !user) {
      console.error("❌ Erro de autenticação:", authError?.message || "Usuário não autenticado");
      throw new Error("Você precisa estar autenticado para adicionar normas");
    }

    // Busca o local do usuário (necessário para passar a RLS por local)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("local")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("❌ Erro ao obter local do usuário:", profileError?.message);
      throw new Error("Não foi possível identificar o local do usuário");
    }

    const { data, error } = await supabase.from("normas").insert([
      {
        ...novaNorma,
        id: crypto.randomUUID(),
        local: novaNorma.local || profile.local,
      },
    ]).select();

    if (error) {
      console.error("❌ Erro ao adicionar norma:", error);
      throw new Error(`Falha ao adicionar norma: ${error.message}`);
    } else {
      console.log("✅ Norma adicionada com sucesso:", data);
      await refreshNormas();
    }
  };

  const updateNorma = async (id: string, data: Partial<Norma>) => {
    console.log("🔵 Tentando atualizar norma:", id, data);
    
    const { error } = await supabase.from("normas").update(data).eq("id", id);

    if (error) {
      console.error("❌ Erro ao atualizar norma:", error);
      throw new Error(`Falha ao atualizar norma: ${error.message}`);
    } else {
      console.log("✅ Norma atualizada com sucesso");
      await refreshNormas();
    }
  };

  const deleteNorma = async (id: string) => {
    console.log("🔵 Tentando deletar norma:", id);
    
    const { error } = await supabase.from("normas").delete().eq("id", id);

    if (error) {
      console.error("❌ Erro ao deletar norma:", error);
      throw new Error(`Falha ao deletar norma: ${error.message}`);
    } else {
      console.log("✅ Norma deletada com sucesso");
      await refreshNormas();
    }
  };

  return (
    <NormasContext.Provider
      value={{ normas, loading, addNorma, updateNorma, deleteNorma, refreshNormas }}
    >
      {children}
    </NormasContext.Provider>
  );
}

export function useNormas() {
  const context = useContext(NormasContext);
  if (!context) throw new Error("useNormas deve ser usado dentro de NormasProvider");
  return context;
}
