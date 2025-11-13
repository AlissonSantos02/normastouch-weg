import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Norma {
  id: string;
  titulo: string;
  categoria: string;
  descricao: string;
  pdf_url: string;
  created_at?: string;
  updated_at?: string;
}

interface NormasContextType {
  normas: Norma[];
  loading: boolean;
  addNorma: (norma: Omit<Norma, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateNorma: (id: string, data: Partial<Norma>) => Promise<void>;
  deleteNorma: (id: string) => Promise<void>;
  refreshNormas: () => Promise<void>;
}

const NormasContext = createContext<NormasContextType | undefined>(undefined);

export function NormasProvider({ children }: { children: ReactNode }) {
  const [normas, setNormas] = useState<Norma[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 🔹 Carrega normas ao iniciar
  useEffect(() => {
    refreshNormas();
  }, []);

  // 🔹 Buscar todas as normas
  const refreshNormas = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('normas').select('*').order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao carregar normas:', error.message);
    } else {
      setNormas(data || []);
    }

    setLoading(false);
  };

  // 🔹 Adicionar nova norma
  const addNorma = async (novaNorma: Omit<Norma, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('normas').insert([
      {
        ...novaNorma,
        id: crypto.randomUUID(), // gera ID único
      },
    ]);

    if (error) {
      console.error('❌ Erro ao adicionar norma:', error.message);
    } else {
      await refreshNormas();
    }
  };

  // 🔹 Atualizar norma existente
  const updateNorma = async (id: string, data: Partial<Norma>) => {
    const { error } = await supabase.from('normas').update(data).eq('id', id);

    if (error) {
      console.error('❌ Erro ao atualizar norma:', error.message);
    } else {
      await refreshNormas();
    }
  };

  // 🔹 Excluir norma
  const deleteNorma = async (id: string) => {
    const { error } = await supabase.from('normas').delete().eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar norma:', error.message);
    } else {
      await refreshNormas();
    }
  };

  return (
    <NormasContext.Provider value={{ normas, loading, addNorma, updateNorma, deleteNorma, refreshNormas }}>
      {children}
    </NormasContext.Provider>
  );
}

export function useNormas() {
  const context = useContext(NormasContext);
  if (!context) throw new Error('useNormas deve ser usado dentro de NormasProvider');
  return context;
}
