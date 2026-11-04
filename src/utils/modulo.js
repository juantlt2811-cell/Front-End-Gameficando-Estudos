import { API_BASE_URL } from "../constants/api";

// Busca os módulos de uma matéria. Usado tanto na visão do professor
// (gerenciar módulos, mover atividades/materiais) quanto na do aluno
// (escolher o que praticar).
export async function buscarModulos(idMateria, fetchAutenticado) {
  const resposta = await fetchAutenticado(
    `${API_BASE_URL}/api/Modulo/materia/${idMateria}`,
  );
  const dados = await resposta.json();
  if (!resposta.ok)
    throw new Error(dados.erro || "Não foi possível carregar os módulos.");
  return dados;
}

// Nome amigável de um módulo a partir do id (idModulo nulo = "Sem módulo").
export function nomeModulo(idModulo, modulos) {
  if (idModulo == null) return "Sem módulo";
  const modulo = modulos.find((m) => m.id === idModulo);
  return modulo ? modulo.nome : "Sem módulo";
}
