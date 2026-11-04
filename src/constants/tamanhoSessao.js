// Tamanhos de sessão de prática aceitos pelo backend (parâmetro `tamanho`).
// `maximo` é quantas questões cada tamanho sorteia no máximo — usado só para
// decidir, na tela do aluno, quando um tamanho maior não faz diferença.
export const TAMANHOS_SESSAO = [
  { valor: "Curta", rotulo: "Curta", maximo: 5 },
  { valor: "Media", rotulo: "Média", maximo: 10 },
  { valor: "Longa", rotulo: "Longa", maximo: 20 },
  { valor: "Todas", rotulo: "Todas", maximo: Infinity },
];
