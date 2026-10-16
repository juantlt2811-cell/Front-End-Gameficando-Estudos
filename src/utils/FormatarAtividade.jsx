// src/utils/FormatarAtividade.js
export function separarEnunciadoEAlternativas(conteudo) {
  const regexAlternativa = /(?:^|\s)([A-Da-d])[)\.\-]\s*/g;
  const indices = [];
  let match;
  while ((match = regexAlternativa.exec(conteudo)) !== null) {
    indices.push(match.index + match[0].indexOf(match[1]));
  }

  // só considera que achou alternativas de verdade se tiver pelo menos 2
  if (indices.length < 2) {
    return {
      enunciado: conteudo.replace(/^Enunciado:\s*/i, "").trim(),
      alternativas: [],
    };
  }

  const enunciado = conteudo
    .slice(0, indices[0])
    .replace(/^Enunciado:\s*/i, "")
    .trim();

  const alternativas = indices.map((inicio, i) => {
    const fim = indices[i + 1] ?? conteudo.length;
    return conteudo.slice(inicio, fim).trim();
  });

  return { enunciado, alternativas };
}
