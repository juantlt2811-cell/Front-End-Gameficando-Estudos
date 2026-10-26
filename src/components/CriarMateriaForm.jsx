import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { mensagemErro } from "../utils/erroRede";

const OPCOES_DIFICULDADE = ["Fácil", "Médio", "Difícil"];

export function CriarMateriaForm({
  onCriada,
  materiaParaEditar,
  onCancelarEdicao,
}) {
  const { fetchAutenticado } = useAuth();
  const [nome, setNome] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [dificuldade, setDificuldade] = useState("");
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const editando = Boolean(materiaParaEditar);

  useEffect(() => {
    if (materiaParaEditar) {
      setNome(materiaParaEditar.nome);
      setCargaHoraria(String(materiaParaEditar.cargaHoraria));
      setDificuldade(materiaParaEditar.dificuldade);
    }
  }, [materiaParaEditar]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const url = editando
        ? `${API_BASE_URL}/api/materia/atualizar`
        : `${API_BASE_URL}/api/materia/criar`;
      const method = editando ? "PUT" : "POST";
      const body = editando
        ? {
            id: materiaParaEditar.id,
            nome,
            cargaHoraria: Number(cargaHoraria),
            dificuldade,
          }
        : { nome, cargaHoraria: Number(cargaHoraria), dificuldade };

      const resposta = await fetchAutenticado(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível salvar.");

      setNome("");
      setCargaHoraria("");
      setDificuldade("");
      onCriada();
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  }

  const opcoesDificuldade =
    dificuldade && !OPCOES_DIFICULDADE.includes(dificuldade)
      ? [...OPCOES_DIFICULDADE, dificuldade]
      : OPCOES_DIFICULDADE;

  return (
    <form onSubmit={handleSubmit}>
      <h3>{editando ? "Editar matéria" : "Criar matéria"}</h3>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome"
      />
      <input
        type="number"
        value={cargaHoraria}
        onChange={(e) => setCargaHoraria(e.target.value)}
        placeholder="Carga horária"
      />
      <select
        value={dificuldade}
        onChange={(e) => setDificuldade(e.target.value)}
      >
        <option value="" disabled>
          Selecione a dificuldade
        </option>
        {opcoesDificuldade.map((opcao) => (
          <option key={opcao} value={opcao}>
            {opcao}
          </option>
        ))}
      </select>
      {erro && <p className="erro">{erro}</p>}
      <button type="submit" disabled={enviando}>
        {enviando
          ? "Salvando..."
          : editando
            ? "Salvar alterações"
            : "Criar matéria"}
      </button>
      {editando && (
        <button type="button" onClick={onCancelarEdicao}>
          Cancelar
        </button>
      )}
    </form>
  );
}
