import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export function CriarMateriaForm({
  onCriada,
  materiaParaEditar,
  onCancelarEdicao,
}) {
  const { usuario } = useAuth();
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
        ? "https://localhost:7259/api/materia/atualizar"
        : "https://localhost:7259/api/materia/criar";
      const method = editando ? "PUT" : "POST";
      const body = editando
        ? {
            id: materiaParaEditar.id,
            nome,
            cargaHoraria: Number(cargaHoraria),
            dificuldade,
          }
        : { nome, cargaHoraria: Number(cargaHoraria), dificuldade };

      const resposta = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuario.token}`,
        },
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
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

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
      <input
        value={dificuldade}
        onChange={(e) => setDificuldade(e.target.value)}
        placeholder="Dificuldade"
      />
      {erro && <p>{erro}</p>}
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
