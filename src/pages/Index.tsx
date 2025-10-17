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
      {/* Header WEG Estilizado */}
      <header className="relative bg-gradient-to-r from-[hsl(var(--weg-blue))] via-[hsl(var(--weg-blue-light))] to-[hsl(var(--weg-red))] shadow-xl overflow-hidden">
        {/* Padrão decorativo de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-6xl drop-shadow-lg animate-pulse">📋</div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg tracking-tight">
                  Painel Digital de NormasS
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="h-1 w-12 bg-[hsl(var(--weg-red))] rounded-full" />
                  <p className="text-white/90 text-lg font-medium">
                    Sistema de consulta rápida de documentos técnicos
                  </p>
                </div>
              </div>
            </div>
            
            {/* Logo WEG Estilizada */}
            <div className="hidden md:flex items-center justify-center w-40 h-24 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border-4 border-white/30">
              <span className="text-5xl font-black bg-gradient-to-br from-[hsl(var(--weg-blue))] to-[hsl(var(--weg-red))] bg-clip-text text-transparent">
                WEG
              </span>
            </div>
          </div>
        </div>
        
        {/* Linha decorativa inferior */}
        <div className="h-2 bg-gradient-to-r from-[hsl(var(--weg-red))] via-white to-[hsl(var(--weg-blue))]" />
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Selecione uma Categoria
            </h2>
            <p className="text-muted-foreground text-lg">
              Toque em uma das categorias abaixo para visualizar as normas disponíveis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
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
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted rounded-full">
              <div className="w-3 h-3 bg-process rounded-full animate-pulse" />
              <p className="text-sm font-medium text-muted-foreground">
                Sistema ativo • {normas.length} normas disponíveis
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 WEG Equipamentos Elétricos • Painel Digital de Normas v1.0</p>
        </div>
      </footer>

      {/* Botão Admin Flutuante */}
      <AdminModal />
    </div>
  );
};

export default Index;
