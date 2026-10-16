import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function CriarMateriaForm({ onCriada }) {
  const { usuario } = useAuth();
  const [nome, setNome] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [dificuldade, setDificuldade] = useState("");
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch("https://localhost:7259/api/materia/criar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuario.token}`,
        },
        body: JSON.stringify({
          nome,
          cargaHoraria: Number(cargaHoraria),
          dificuldade,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível criar a matéria.");
      }

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
      <h3>Criar matéria</h3>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da matéria"
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
        placeholder="Dificuldade (ex: Iniciante)"
      />
      {erro && <p>{erro}</p>}
      <button type="submit" disabled={enviando}>
        {enviando ? "Criando..." : "Criar matéria"}
      </button>
    </form>
  );
}
