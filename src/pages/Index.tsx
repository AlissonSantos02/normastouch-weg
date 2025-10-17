import { categorias, normas } from "@/data/normas";
import { CategoryButton } from "@/components/CategoryButton";

const Index = () => {
  const getNormasCount = (categoriaId: string) => {
    return normas.filter((norma) => norma.categoria === categoriaId).length;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card shadow-md border-b border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">📋</div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Painel Digital de Normas WEG
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Sistema de consulta rápida de documentos técnicos
                </p>
              </div>
            </div>
            
            {/* Logo WEG - Placeholder */}
            <div className="hidden md:flex items-center justify-center w-32 h-20 bg-primary/10 rounded-xl">
              <span className="text-3xl font-bold text-primary">WEG</span>
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default Index;
