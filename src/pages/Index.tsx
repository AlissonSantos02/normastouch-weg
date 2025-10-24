import { categorias } from "@/data/normas";
import { CategoryButton } from "@/components/CategoryButton";
import { AdminModal } from "@/components/AdminModal";
import { useNormas } from "@/contexts/NormasContext";

const Index = () => {
  const { normas } = useNormas();

  const getNormasCount = (categoriaId: string) => {
    return normas.filter((norma) => norma.categoria === categoriaId).length;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header WEG Corporativo */}
      <header className="bg-primary shadow-md">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo WEG */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-28 h-16 rounded-lg shadow-sm">
              <img
                src="/logo-weg-branco.png"
                alt="Logo WEG"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
            
            {/* Título e Subtítulo */}
            <div className="text-right">
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Painel Digital de Normas
              </h1>
              <p className="text-white/80 text-sm font-medium mt-1">
                Sistema de consulta rápida de documentos técnicos
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Selecione uma Categoria
            </h2>
            <p className="text-muted-foreground text-base">
              Toque em uma das categorias abaixo para visualizar as normas disponíveis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {categorias.map((categoria, index) => (
              <div
                key={categoria.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-scale-in"
              >
                <CategoryButton
                  {...categoria}
                  normasCount={getNormasCount(categoria.id)}
                />
              </div>
            ))}
          </div>

          {/* Info Footer */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-card border border-border rounded-lg shadow-sm">
              <div className="w-2.5 h-2.5 bg-process rounded-full animate-pulse" />
              <p className="text-sm font-medium text-muted-foreground">
                Sistema ativo • {normas.length} normas disponíveis
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-5">
        <div className="container mx-auto px-8 text-center text-xs text-muted-foreground">
          <p className="font-medium">© 2025 WEG Equipamentos Elétricos • Painel Digital de Normas v1.0</p>
        </div>
      </footer>

      {/* Botão Admin Flutuante */}
      <AdminModal />
    </div>
  );
};

export default Index;
