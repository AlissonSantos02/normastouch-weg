import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Norma } from "@/data/normas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NormasContextType {
  normas: Norma[];
  loading: boolean;
  setNormas: (normas: Norma[]) => void;
  addNorma: (norma: Norma) => Promise<void>;
  updateNorma: (id: string, norma: Partial<Norma>) => Promise<void>;
  deleteNorma: (id: string) => Promise<void>;
  refreshNormas: () => Promise<void>;
}

const NormasContext = createContext<NormasContextType | undefined>(undefined);

export const NormasProvider = ({ children }: { children: ReactNode }) => {
  const [normas, setNormasState] = useState<Norma[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNormas = async () => {
    try {
      const { data, error } = await supabase
        .from('normas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapear dados do banco para interface Norma
      const normasMapeadas: Norma[] = (data || []).map((item: any) => ({
        id: item.id,
        titulo: item.titulo,
        categoria: item.categoria as Norma['categoria'],
        descricao: item.descricao,
        pdfUrl: item.pdf_url,
        pdfPath: item.pdf_url,
        ultimaAtualizacao: new Date(item.updated_at).toISOString().split('T')[0]
      }));

      setNormasState(normasMapeadas);
    } catch (error) {
      console.error('Erro ao carregar normas:', error);
      toast.error('Erro ao carregar normas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNormas();
  }, []);

  const setNormas = (newNormas: Norma[]) => {
    setNormasState(newNormas);
  };

  const addNorma = async (norma: Norma) => {
    try {
      // Mapear interface Norma para tabela do banco
      const normaParaBanco = {
        id: norma.id,
        titulo: norma.titulo,
        categoria: norma.categoria,
        descricao: norma.descricao || '',
        pdf_url: norma.pdfUrl || ''
      };

      const { error } = await supabase
        .from('normas')
        .insert([normaParaBanco]);

      if (error) throw error;

      setNormasState((prev) => [norma, ...prev]);
      toast.success('Norma adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar norma:', error);
      toast.error('Erro ao adicionar norma');
      throw error;
    }
  };

  const updateNorma = async (id: string, updatedData: Partial<Norma>) => {
    try {
      // Mapear dados atualizados para tabela do banco
      const dadosParaBanco: any = {};
      if (updatedData.titulo) dadosParaBanco.titulo = updatedData.titulo;
      if (updatedData.categoria) dadosParaBanco.categoria = updatedData.categoria;
      if (updatedData.descricao !== undefined) dadosParaBanco.descricao = updatedData.descricao;
      if (updatedData.pdfUrl !== undefined) dadosParaBanco.pdf_url = updatedData.pdfUrl;

      const { error } = await supabase
        .from('normas')
        .update(dadosParaBanco)
        .eq('id', id);

      if (error) throw error;

      setNormasState((prev) =>
        prev.map((norma) => (norma.id === id ? { ...norma, ...updatedData } : norma))
      );
      toast.success('Norma atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar norma:', error);
      toast.error('Erro ao atualizar norma');
      throw error;
    }
  };

  const deleteNorma = async (id: string) => {
    try {
      const { error } = await supabase
        .from('normas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNormasState((prev) => prev.filter((norma) => norma.id !== id));
      toast.success('Norma removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover norma:', error);
      toast.error('Erro ao remover norma');
      throw error;
    }
  };

  const refreshNormas = async () => {
    await fetchNormas();
  };

  return (
    <NormasContext.Provider
      value={{ normas, loading, setNormas, addNorma, updateNorma, deleteNorma, refreshNormas }}
    >
      {children}
    </NormasContext.Provider>
  );
};

export const useNormas = () => {
  const context = useContext(NormasContext);
  if (!context) {
    throw new Error("useNormas deve ser usado dentro de NormasProvider");
  }
  return context;
};
