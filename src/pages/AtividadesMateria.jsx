import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useAuth } from "../context/AuthContext";
import { TIPO_USUARIO } from "../constants/tipoUsuario";
import { TIPO_ATIVIDADE } from "../constants/tipoAtividade";
import { API_BASE_URL } from "../constants/api";
import { mensagemErro } from "../utils/erroRede";

function adivinharLinguagem(codigo) {
  if (!codigo) return "jsx";
  if (/^\s*(def |import |print\()/m.test(codigo)) return "python";
  if (
    /\bpublic\s+(class|static)\b/.test(codigo) &&
    /System\.out\.println/.test(codigo)
  )
    return "java";
  if (/\busing\s+System\b/.test(codigo) || /\bConsole\.Write/.test(codigo))
    return "csharp";
  if (/#include\s*</.test(codigo)) return "c";
  return "jsx";
}

export function AtividadesMateria() {
  const { id } = useParams();
  const idMateria = Number(id);
  const { usuario, fetchAutenticado } = useAuth();
  const ehProfessor = usuario.tipoUsuario === TIPO_USUARIO.PROFESSOR;

  const [atividades, setAtividades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [tema, setTema] = useState("");
  const [tipoAtividade, setTipoAtividade] = useState(
    TIPO_ATIVIDADE.MULTIPLA_ESCOLHA,
  );
  const [gerando, setGerando] = useState(false);

  const [idEditando, setIdEditando] = useState(null);
  const [nomeEdicao, setNomeEdicao] = useState("");
  const [conteudoEdicao, setConteudoEdicao] = useState("");
  const [gabaritoEdicao, setGabaritoEdicao] = useState("");
  const [alternativasEdicao, setAlternativasEdicao] = useState([]);

  const [idTestando, setIdTestando] = useState(null);
  const [respostaTeste, setRespostaTeste] = useState("");
  const [resultadoTeste, setResultadoTeste] = useState(null);
  const [testando, setTestando] = useState(false);

  async function carregarAtividades() {
    setCarregando(true);
    try {
      const resposta = await fetchAutenticado(
        `${API_BASE_URL}/api/atividade/materia/${idMateria}`,
      );
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível carregar.");
      setAtividades(dados);
    } catch (e) {
      setErro(mensagemErro(e));
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
        `${API_BASE_URL}/api/atividade/gerar`,
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
      setErro(mensagemErro(err));
    } finally {
      setGerando(false);
    }
  }

  function iniciarEdicao(atividade) {
    setIdEditando(atividade.id);
    setNomeEdicao(atividade.nome);
    setConteudoEdicao(atividade.conteudo);
    setGabaritoEdicao("");
    setAlternativasEdicao(
      atividade.alternativas?.length > 0
        ? [...atividade.alternativas]
        : ["", ""],
    );
  }

  function atualizarAlternativa(indice, valor) {
    setAlternativasEdicao((atuais) =>
      atuais.map((a, i) => (i === indice ? valor : a)),
    );
  }

  function adicionarAlternativa() {
    setAlternativasEdicao((atuais) => [...atuais, ""]);
  }

  function removerAlternativa(indice) {
    setAlternativasEdicao((atuais) => atuais.filter((_, i) => i !== indice));
  }

  async function handleSalvarEdicao(e, atividade) {
    e.preventDefault();
    setErro(null);
    try {
      const resposta = await fetchAutenticado(
        `${API_BASE_URL}/api/atividade/atualizar`,
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
                ? alternativasEdicao.map((a) => a.trim()).filter(Boolean)
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
      setErro(mensagemErro(err));
    }
  }

  async function handleExcluir(idAtividade) {
    if (!window.confirm("Excluir essa atividade?")) return;
    try {
      const resposta = await fetchAutenticado(
        `${API_BASE_URL}/api/atividade/${idAtividade}`,
        { method: "DELETE" },
      );
      if (!resposta.ok) {
        const dados = await resposta.json();
        throw new Error(dados.erro || "Não foi possível excluir.");
      }
      carregarAtividades();
    } catch (err) {
      setErro(mensagemErro(err));
    }
  }

  async function handleTestar(e, idAtividade) {
    e.preventDefault();
    setResultadoTeste(null);
    setTestando(true);
    try {
      const resposta = await fetchAutenticado(
        `${API_BASE_URL}/api/atividade/${idAtividade}/testar`,
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
      setErro(mensagemErro(err));
    } finally {
      setTestando(false);
    }
  }

  return (
    <div className="App">
      <Link to="/materias">← Voltar</Link>
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

      {erro && <p className="erro">{erro}</p>}
      {carregando && <p>Carregando...</p>}

      <ul>
        {atividades.map((atividade) => (
          <li key={atividade.id}>
            <strong>{atividade.nome}</strong> ({atividade.tipo}){" "}
            {!atividade.ativa && "[inativa]"}
            <p className="corpo-atividade">{atividade.conteudo}</p>
            {atividade.alternativas?.length > 0 && (
              <ul>
                {atividade.alternativas.map((alt, i) => (
                  <li key={i}>{alt}</li>
                ))}
              </ul>
            )}
            {ehProfessor && (
              <div className="acoes-item">
                <button onClick={() => iniciarEdicao(atividade)}>Editar</button>
                <button
                  onClick={() => {
                    setIdTestando(atividade.id);
                    setResultadoTeste(null);
                  }}
                >
                  Testar
                </button>
                <button
                  className="botao-perigo"
                  onClick={() => handleExcluir(atividade.id)}
                >
                  Excluir
                </button>
              </div>
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
                  <div className="lista-alternativas">
                    {alternativasEdicao.map((alt, i) => (
                      <div className="linha-alternativa" key={i}>
                        <input
                          value={alt}
                          onChange={(e) =>
                            atualizarAlternativa(i, e.target.value)
                          }
                          placeholder={`Alternativa (ex: A) Texto)`}
                        />
                        <button
                          type="button"
                          className="botao-perigo"
                          onClick={() => removerAlternativa(i)}
                          disabled={alternativasEdicao.length <= 2}
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={adicionarAlternativa}>
                      + Adicionar alternativa
                    </button>
                  </div>
                )}
                {atividade.tipo === "Codigo" ? (
                  <div className="editor-codigo">
                    <Editor
                      height="140px"
                      defaultLanguage={adivinharLinguagem(conteudoEdicao)}
                      theme="vs-dark"
                      value={gabaritoEdicao}
                      onChange={(valor) => setGabaritoEdicao(valor || "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        automaticLayout: true,
                        tabSize: 2,
                      }}
                    />
                  </div>
                ) : (
                  <textarea
                    value={gabaritoEdicao}
                    onChange={(e) => setGabaritoEdicao(e.target.value)}
                    placeholder="Gabarito (obrigatório reescrever, o backend não devolve o atual)"
                  />
                )}
                <button type="submit">Salvar</button>
                <button type="button" onClick={() => setIdEditando(null)}>
                  Cancelar
                </button>
              </form>
            )}
            {idTestando === atividade.id && (
              <form onSubmit={(e) => handleTestar(e, atividade.id)}>
                {atividade.tipo === "Codigo" ? (
                  <div className="editor-codigo">
                    <Editor
                      height="160px"
                      defaultLanguage={adivinharLinguagem(atividade.conteudo)}
                      theme="vs-dark"
                      value={respostaTeste}
                      onChange={(valor) => setRespostaTeste(valor || "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        automaticLayout: true,
                        tabSize: 2,
                      }}
                    />
                  </div>
                ) : (
                  <input
                    value={respostaTeste}
                    onChange={(e) => setRespostaTeste(e.target.value)}
                    placeholder="Resposta de teste"
                  />
                )}
                <button type="submit" disabled={testando}>
                  {testando ? "Testando..." : "Enviar teste"}
                </button>
                {resultadoTeste && <p>{resultadoTeste.feedback}</p>}
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
