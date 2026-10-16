import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Ranking() {
  const { fetchAutenticado } = useAuth();

  const [rankingOfensiva, setRankingOfensiva] = useState([]);
  const [carregandoOfensiva, setCarregandoOfensiva] = useState(true);
  const [erroOfensiva, setErroOfensiva] = useState(null);

  const [materias, setMaterias] = useState([]);
  const [idMateriaSelecionada, setIdMateriaSelecionada] = useState("");
  const [rankingMateria, setRankingMateria] = useState(null);
  const [carregandoMateria, setCarregandoMateria] = useState(false);
  const [erroMateria, setErroMateria] = useState(null);

  useEffect(() => {
    async function carregarOfensiva() {
      try {
        const resp = await fetchAutenticado(
          "https://localhost:7259/api/ranking/ofensiva",
        );
        const dados = await resp.json();
        if (!resp.ok)
          throw new Error(dados.erro || "Não foi possível carregar.");
        setRankingOfensiva(dados);
      } catch (e) {
        setErroOfensiva(e.message);
      } finally {
        setCarregandoOfensiva(false);
      }
    }

    async function carregarMaterias() {
      try {
        const resp = await fetchAutenticado(
          "https://localhost:7259/api/materia/disponiveis",
        );
        const dados = await resp.json();
        setMaterias(dados);
      } catch {}
    }

    carregarOfensiva();
    carregarMaterias();
  }, []);

  async function carregarRankingMateria(idMateria) {
    setIdMateriaSelecionada(idMateria);
    setRankingMateria(null);
    setErroMateria(null);
    if (!idMateria) return;

    setCarregandoMateria(true);
    try {
      const resp = await fetchAutenticado(
        `https://localhost:7259/api/ranking/materia/${idMateria}`,
      );
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || "Não foi possível carregar.");
      setRankingMateria(dados);
    } catch (e) {
      setErroMateria(e.message);
    } finally {
      setCarregandoMateria(false);
    }
  }

  return (
    <div className="App">
      <Link to="/">← Voltar</Link>
      <h1>Ranking</h1>

      <h3>Ofensiva (geral)</h3>
      {carregandoOfensiva && <p>Carregando...</p>}
      {erroOfensiva && <p>{erroOfensiva}</p>}
      {!carregandoOfensiva && !erroOfensiva && (
        <ol>
          {rankingOfensiva.map((item) => (
            <li key={item.posicao}>
              {item.nome} — ofensiva atual: {item.ofensivaAtual} (maior:{" "}
              {item.maiorOfensiva})
            </li>
          ))}
        </ol>
      )}

      <h3>Ranking por matéria</h3>
      <select
        value={idMateriaSelecionada}
        onChange={(e) => carregarRankingMateria(e.target.value)}
      >
        <option value="">Selecione uma matéria</option>
        {materias.map((materia) => (
          <option key={materia.id} value={materia.id}>
            {materia.nome}
          </option>
        ))}
      </select>

      {carregandoMateria && <p>Carregando...</p>}
      {erroMateria && <p>{erroMateria}</p>}
      {rankingMateria && rankingMateria.length === 0 && (
        <p>
          Ainda não há tentativas suficientes nessa matéria pra gerar ranking.
        </p>
      )}
      {rankingMateria && rankingMateria.length > 0 && (
        <ol>
          {rankingMateria.map((item) => (
            <li key={item.posicao}>
              {item.nome} — {item.totalAcertos}/{item.totalTentativas} acertos (
              {item.percentualAcerto.toFixed(0)}%)
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
