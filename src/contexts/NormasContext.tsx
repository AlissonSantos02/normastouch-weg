import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Norma {
  id: string;
  titulo: string;
  categoria: string;
  descricao?: string;
  pdf_url?: string;
  pdf_path?: string;
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
    const { error } = await supabase.from("normas").insert([
      {
        ...novaNorma,
        id: crypto.randomUUID(),
      },
    ]);

    if (error) {
      console.error("❌ Erro ao adicionar norma:", error.message);
    } else {
      await refreshNormas();
    }
  };

  const updateNorma = async (id: string, data: Partial<Norma>) => {
    const { error } = await supabase.from("normas").update(data).eq("id", id);

    if (error) {
      console.error("❌ Erro ao atualizar norma:", error.message);
    } else {
      await refreshNormas();
    }
  };

  const deleteNorma = async (id: string) => {
    const { error } = await supabase.from("normas").delete().eq("id", id);

    if (error) {
      console.error("❌ Erro ao deletar norma:", error.message);
    } else {
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
