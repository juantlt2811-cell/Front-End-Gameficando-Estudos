import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ListaMaterias } from "../components/ListaMaterias";
import { useAuth } from "../context/AuthContext";
import { TIPO_USUARIO } from "../constants/tipoUsuario";

export function Materias() {
  const [materias, setMaterias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const { usuario, fetchAutenticado } = useAuth();

  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [resultadosPesquisa, setResultadosPesquisa] = useState(null);
  const [pesquisando, setPesquisando] = useState(false);

  async function carregarMaterias() {
    setCarregando(true);
    try {
      const resposta = await fetchAutenticado(
        "https://localhost:7259/api/materia/disponiveis",
      );
      const dados = await resposta.json();
      setMaterias(dados);
    } catch (e) {
      setErro("Não foi possível carregar as matérias.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMaterias();
  }, []);

  async function handlePesquisar(e) {
    e.preventDefault();
    if (!termoPesquisa.trim()) return;
    setPesquisando(true);
    try {
      const resposta = await fetchAutenticado(
        `https://localhost:7259/api/materia/pesquisar?termo=${encodeURIComponent(termoPesquisa)}`,
      );
      const dados = await resposta.json();
      setResultadosPesquisa(dados);
    } catch (e) {
      setErro("Não foi possível pesquisar.");
    } finally {
      setPesquisando(false);
    }
  }

  function limparPesquisa() {
    setTermoPesquisa("");
    setResultadosPesquisa(null);
  }

  return (
    <div className="App">
      <h1>Matérias</h1>

      {usuario.tipoUsuario === TIPO_USUARIO.PROFESSOR && (
        <p>
          <Link to="/minhas-materias">Minhas matérias</Link>
        </p>
      )}

      <form onSubmit={handlePesquisar}>
        <input
          value={termoPesquisa}
          onChange={(e) => setTermoPesquisa(e.target.value)}
          placeholder="Pesquisar matéria por nome"
        />
        <button type="submit" disabled={pesquisando}>
          {pesquisando ? "Buscando..." : "Pesquisar"}
        </button>
        {resultadosPesquisa !== null && (
          <button type="button" onClick={limparPesquisa}>
            Limpar
          </button>
        )}
      </form>

      {carregando && <p>Carregando matérias...</p>}
      {erro && <p className="erro">{erro}</p>}

      {resultadosPesquisa !== null ? (
        <>
          <h3>Resultado da pesquisa</h3>
          {resultadosPesquisa.length === 0 && (
            <p>Nenhuma matéria encontrada.</p>
          )}
          <ListaMaterias materias={resultadosPesquisa} />
        </>
      ) : (
        !carregando && !erro && <ListaMaterias materias={materias} />
      )}
    </div>
  );
}
