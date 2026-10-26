import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { mensagemErro } from "../utils/erroRede";

export function EstatisticasMateria() {
  const { id } = useParams();
  const idMateria = Number(id);
  const { fetchAutenticado } = useAuth();

  const [estatisticas, setEstatisticas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const resp = await fetchAutenticado(
          `${API_BASE_URL}/api/materia/${idMateria}/estatisticas`,
        );
        const dados = await resp.json();
        if (!resp.ok)
          throw new Error(dados.erro || "Não foi possível carregar.");
        setEstatisticas(dados);
      } catch (e) {
        setErro(mensagemErro(e));
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [idMateria]);

  return (
    <div className="App">
      <Link to="/minhas-materias">← Minhas matérias</Link>
      <h1>Estatísticas</h1>

      {carregando && <p>Carregando...</p>}
      {erro && <p className="erro">{erro}</p>}

      {estatisticas && estatisticas.length === 0 && (
        <p>Nenhum aluno praticou essa matéria ainda.</p>
      )}

      {estatisticas && estatisticas.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Sessões concluídas</th>
              <th>Tentativas totais</th>
              <th>% de acerto</th>
            </tr>
          </thead>
          <tbody>
            {estatisticas.map((e, i) => (
              <tr key={i}>
                <td>{e.nomeAluno}</td>
                <td>{e.sessoesConcluidas}</td>
                <td>{e.totalTentativas}</td>
                <td>{e.percentualAcerto.toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
