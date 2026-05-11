export type Categoria = string;

export interface Norma {
  id: string;
  titulo: string;
  categoria: Categoria;
  descricao?: string;
  pdfUrl?: string;
  pdfPath?: string; // Caminho do arquivo no storage
  ultimaAtualizacao: string;
}

export const categorias = [
  {
    id: "eletrica" as Categoria,
    nome: "MONTAGEM ELÉTRICA",
    icon: "⚡",
    colorClass: "electric",
  },
  {
    id: "mecanica" as Categoria,
    nome: "MONTAGEM MECÂNICA",
    icon: "⚙️",
    colorClass: "mechanical",
  },
  {
    id: "processos" as Categoria,
    nome: "PROCESSOS",
    icon: "🔄",
    colorClass: "process",
  },
  {
    id: "apts" as Categoria,
    nome: "APT'S",
    icon: "📋",
    colorClass: "apt",
  },
];

export const normas: Norma[] = [
  // Montagem Elétrica
  {
    id: "me-001",
    titulo: "NR-10 - Segurança em Instalações Elétricas",
    categoria: "eletrica",
    descricao: "Normas de segurança para trabalhos em instalações elétricas",
    ultimaAtualizacao: "2024-01-15",
  },
  {
    id: "me-002",
    titulo: "Procedimento de Montagem de Painéis Elétricos",
    categoria: "eletrica",
    descricao: "Guia completo para montagem de painéis elétricos industriais",
    ultimaAtualizacao: "2024-02-10",
  },
  {
    id: "me-003",
    titulo: "Checklist de Inspeção Elétrica",
    categoria: "eletrica",
    descricao: "Lista de verificação para inspeção de instalações elétricas",
    ultimaAtualizacao: "2024-01-28",
  },
  {
    id: "me-004",
    titulo: "Padrões de Cabeamento Industrial",
    categoria: "eletrica",
    descricao: "Diretrizes para organização e identificação de cabos",
    ultimaAtualizacao: "2024-03-05",
  },

  // Montagem Mecânica
  {
    id: "mm-001",
    titulo: "Torques de Aperto - Parafusos e Porcas",
    categoria: "mecanica",
    descricao: "Tabela de torques recomendados para fixações mecânicas",
    ultimaAtualizacao: "2024-01-20",
  },
  {
    id: "mm-002",
    titulo: "Montagem de Motores Elétricos",
    categoria: "mecanica",
    descricao: "Procedimento padrão para montagem e alinhamento de motores",
    ultimaAtualizacao: "2024-02-15",
  },
  {
    id: "mm-003",
    titulo: "Inspeção de Rolamentos",
    categoria: "mecanica",
    descricao: "Técnicas de inspeção e critérios de aceitação",
    ultimaAtualizacao: "2024-01-18",
  },
  {
    id: "mm-004",
    titulo: "Balanceamento de Rotores",
    categoria: "mecanica",
    descricao: "Normas e procedimentos para balanceamento dinâmico",
    ultimaAtualizacao: "2024-03-01",
  },

  // Processos
  {
    id: "pr-001",
    titulo: "Fluxo de Produção - Linha A",
    categoria: "processos",
    descricao: "Mapeamento completo do processo produtivo",
    ultimaAtualizacao: "2024-02-20",
  },
  {
    id: "pr-002",
    titulo: "Controle de Qualidade - Inspeção Final",
    categoria: "processos",
    descricao: "Procedimentos de inspeção e critérios de aprovação",
    ultimaAtualizacao: "2024-02-25",
  },
  {
    id: "pr-003",
    titulo: "Procedimento de Embalagem e Expedição",
    categoria: "processos",
    descricao: "Normas para embalagem e preparação para envio",
    ultimaAtualizacao: "2024-01-30",
  },
  {
    id: "pr-004",
    titulo: "Gestão de Não Conformidades",
    categoria: "processos",
    descricao: "Tratamento e registro de produtos não conformes",
    ultimaAtualizacao: "2024-03-08",
  },

  // APT's
  {
    id: "apt-001",
    titulo: "APT - Trabalho em Altura",
    categoria: "apts",
    descricao: "Análise Preliminar de Tarefa para trabalhos acima de 2m",
    ultimaAtualizacao: "2024-01-25",
  },
  {
    id: "apt-002",
    titulo: "APT - Espaço Confinado",
    categoria: "apts",
    descricao: "Procedimentos de segurança para entrada em espaços confinados",
    ultimaAtualizacao: "2024-02-05",
  },
  {
    id: "apt-003",
    titulo: "APT - Movimentação de Cargas",
    categoria: "apts",
    descricao: "Segurança na operação de pontes rolantes e talhas",
    ultimaAtualizacao: "2024-02-12",
  },
  {
    id: "apt-004",
    titulo: "APT - Máquinas e Equipamentos",
    categoria: "apts",
    descricao: "Análise de riscos na operação de máquinas industriais",
    ultimaAtualizacao: "2024-03-10",
  },
];
