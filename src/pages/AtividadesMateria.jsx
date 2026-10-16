import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TIPO_USUARIO } from "../constants/tipoUsuario";
import { TIPO_ATIVIDADE } from "../constants/tipoAtividade";

export function AtividadesMateria() {
  const { id } = useParams();
  const idMateria = Number(id);
  const { usuario, fetchAutenticado } = useAuth();
  const ehProfessor = usuario.tipoUsuario === TIPO_USUARIO.PROFESSOR;

  const [atividades, setAtividades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // gerar
  const [tema, setTema] = useState("");
  const [tipoAtividade, setTipoAtividade] = useState(
    TIPO_ATIVIDADE.MULTIPLA_ESCOLHA,
  );
  const [gerando, setGerando] = useState(false);

  // editar
  const [idEditando, setIdEditando] = useState(null);
  const [nomeEdicao, setNomeEdicao] = useState("");
  const [conteudoEdicao, setConteudoEdicao] = useState("");
  const [gabaritoEdicao, setGabaritoEdicao] = useState("");
  const [alternativasEdicao, setAlternativasEdicao] = useState("");

  // testar
  const [idTestando, setIdTestando] = useState(null);
  const [respostaTeste, setRespostaTeste] = useState("");
  const [resultadoTeste, setResultadoTeste] = useState(null);

  async function carregarAtividades() {
    setCarregando(true);
    try {
      const resposta = await fetchAutenticado(
        `https://localhost:7259/api/atividade/materia/${idMateria}`,
      );
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível carregar.");
      setAtividades(dados);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarAtividades();
  }, [idMateria]);

  async function handleGerar(e) {
    e.preventDefault();
    setErro(null);
    setGerando(true);
    try {
      const resposta = await fetchAutenticado(
        "https://localhost:7259/api/atividade/gerar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idMateria, tema, tipoAtividade }),
        },
      );
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível gerar a atividade.");

      setTema("");
      carregarAtividades();
    } catch (err) {
      setErro(err.message);
    } finally {
      setGerando(false);
    }
  }

  function iniciarEdicao(atividade) {
    setIdEditando(atividade.id);
    setNomeEdicao(atividade.nome);
    setConteudoEdicao(atividade.conteudo);
    setGabaritoEdicao("");
    setAlternativasEdicao((atividade.alternativas || []).join("\n"));
  }

  async function handleSalvarEdicao(e, atividade) {
    e.preventDefault();
    setErro(null);
    try {
      const resposta = await fetchAutenticado(
        "https://localhost:7259/api/atividade/atualizar",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: idEditando,
            nome: nomeEdicao,
            conteudo: conteudoEdicao,
            gabarito: gabaritoEdicao,
            alternativas:
              atividade.tipo === "MultiplaEscolha"
                ? alternativasEdicao
                    .split("\n")
                    .map((a) => a.trim())
                    .filter(Boolean)
                : [],
          }),
        },
      );
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível salvar.");

      setIdEditando(null);
      carregarAtividades();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleExcluir(idAtividade) {
    if (!window.confirm("Excluir essa atividade?")) return;
    try {
      const resposta = await fetchAutenticado(
        `https://localhost:7259/api/atividade/${idAtividade}`,
        { method: "DELETE" },
      );
      if (!resposta.ok) {
        const dados = await resposta.json();
        throw new Error(dados.erro || "Não foi possível excluir.");
      }
      carregarAtividades();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleTestar(e, idAtividade) {
    e.preventDefault();
    setResultadoTeste(null);
    try {
      const resposta = await fetchAutenticado(
        `https://localhost:7259/api/atividade/${idAtividade}/testar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resposta: respostaTeste }),
        },
      );
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível testar.");
      setResultadoTeste(dados);
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div className="App">
      <Link to="/">← Voltar</Link>
      <h1>Atividades</h1>

      {ehProfessor && (
        <>
          <h3>Gerar atividade com IA</h3>
          <form onSubmit={handleGerar}>
            <input
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Tema"
            />
            <select
              value={tipoAtividade}
              onChange={(e) => setTipoAtividade(Number(e.target.value))}
            >
              <option value={TIPO_ATIVIDADE.MULTIPLA_ESCOLHA}>
                Múltipla escolha
              </option>
              <option value={TIPO_ATIVIDADE.DISSERTATIVA}>Dissertativa</option>
              <option value={TIPO_ATIVIDADE.CODIGO}>Código</option>
            </select>
            <button type="submit" disabled={gerando}>
              {gerando ? "Gerando..." : "Gerar"}
            </button>
          </form>
        </>
      )}

      {erro && <p>{erro}</p>}
      {carregando && <p>Carregando...</p>}

      <ul>
        {atividades.map((atividade) => (
          <li key={atividade.id}>
            <strong>{atividade.nome}</strong> ({atividade.tipo}){" "}
            {!atividade.ativa && "[inativa]"}
            <p>{atividade.conteudo}</p>
            {atividade.alternativas?.length > 0 && (
              <ul>
                {atividade.alternativas.map((alt, i) => (
                  <li key={i}>{alt}</li>
                ))}
              </ul>
            )}
            {ehProfessor && (
              <>
                <button onClick={() => iniciarEdicao(atividade)}>Editar</button>
                <button onClick={() => handleExcluir(atividade.id)}>
                  Excluir
                </button>
                <button
                  onClick={() => {
                    setIdTestando(atividade.id);
                    setResultadoTeste(null);
                  }}
                >
                  Testar
                </button>
              </>
            )}
            {idEditando === atividade.id && (
              <form onSubmit={(e) => handleSalvarEdicao(e, atividade)}>
                <input
                  value={nomeEdicao}
                  onChange={(e) => setNomeEdicao(e.target.value)}
                />
                <textarea
                  value={conteudoEdicao}
                  onChange={(e) => setConteudoEdicao(e.target.value)}
                />
                {atividade.tipo === "MultiplaEscolha" && (
                  <textarea
                    value={alternativasEdicao}
                    onChange={(e) => setAlternativasEdicao(e.target.value)}
                    placeholder="Uma alternativa por linha, ex: A) Texto"
                    rows={4}
                  />
                )}
                <textarea
                  value={gabaritoEdicao}
                  onChange={(e) => setGabaritoEdicao(e.target.value)}
                  placeholder="Gabarito (obrigatório reescrever, o backend não devolve o atual)"
                />
                <button type="submit">Salvar</button>
                <button type="button" onClick={() => setIdEditando(null)}>
                  Cancelar
                </button>
              </form>
            )}
            {idTestando === atividade.id && (
              <form onSubmit={(e) => handleTestar(e, atividade.id)}>
                <input
                  value={respostaTeste}
                  onChange={(e) => setRespostaTeste(e.target.value)}
                  placeholder="Resposta de teste"
                />
                <button type="submit">Enviar teste</button>
                {resultadoTeste && <p>{resultadoTeste.feedback}</p>}
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
