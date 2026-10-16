import { useState, useEffect } from "react";
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
      } catch {
        // se falhar, só não preenche o seletor de matérias
      }
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
      <h1>Ranking</h1>

      <div className="ranking-colunas">
        <section className="ranking-coluna">
          <h3>Ofensiva (geral)</h3>
          {carregandoOfensiva && <p>Carregando...</p>}
          {erroOfensiva && <p className="erro">{erroOfensiva}</p>}
          {!carregandoOfensiva && !erroOfensiva && (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Ofensiva</th>
                  <th>Maior</th>
                </tr>
              </thead>
              <tbody>
                {rankingOfensiva.map((item) => (
                  <tr key={item.posicao}>
                    <td>{item.posicao}</td>
                    <td>{item.nome}</td>
                    <td>{item.ofensivaAtual}</td>
                    <td>{item.maiorOfensiva}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="ranking-coluna">
          <h3>Por matéria</h3>
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
          {erroMateria && <p className="erro">{erroMateria}</p>}
          {rankingMateria && rankingMateria.length === 0 && (
            <p>Ainda não há tentativas suficientes nessa matéria.</p>
          )}
          {rankingMateria && rankingMateria.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Acertos</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {rankingMateria.map((item) => (
                  <tr key={item.posicao}>
                    <td>{item.posicao}</td>
                    <td>{item.nome}</td>
                    <td>
                      {item.totalAcertos}/{item.totalTentativas}
                    </td>
                    <td>{item.percentualAcerto.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
