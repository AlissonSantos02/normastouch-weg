import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Norma, normas as normasIniciais } from "@/data/normas";

interface NormasContextType {
  normas: Norma[];
  setNormas: (normas: Norma[]) => void;
  addNorma: (norma: Norma) => void;
  updateNorma: (id: string, norma: Partial<Norma>) => void;
  deleteNorma: (id: string) => void;
}

const NormasContext = createContext<NormasContextType | undefined>(undefined);

export const NormasProvider = ({ children }: { children: ReactNode }) => {
  const [normas, setNormasState] = useState<Norma[]>(() => {
    const saved = localStorage.getItem("normas");
    return saved ? JSON.parse(saved) : normasIniciais;
  });

  useEffect(() => {
    localStorage.setItem("normas", JSON.stringify(normas));
  }, [normas]);

  const setNormas = (newNormas: Norma[]) => {
    setNormasState(newNormas);
  };

  const addNorma = (norma: Norma) => {
    setNormasState((prev) => [...prev, norma]);
  };

  const updateNorma = (id: string, updatedData: Partial<Norma>) => {
    setNormasState((prev) =>
      prev.map((norma) => (norma.id === id ? { ...norma, ...updatedData } : norma))
    );
  };

  const deleteNorma = (id: string) => {
    setNormasState((prev) => prev.filter((norma) => norma.id !== id));
  };

  return (
    <NormasContext.Provider
      value={{ normas, setNormas, addNorma, updateNorma, deleteNorma }}
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
