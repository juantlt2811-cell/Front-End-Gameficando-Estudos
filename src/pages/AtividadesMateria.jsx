import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useAuth } from "../context/AuthContext";
import { TIPO_USUARIO } from "../constants/tipoUsuario";
import { TIPO_ATIVIDADE } from "../constants/tipoAtividade";
import { API_BASE_URL } from "../constants/api";
import { mensagemErro } from "../utils/erroRede";
import { buscarModulos, nomeModulo } from "../utils/modulo";

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

  const [modulos, setModulos] = useState([]);
  const [moduloFiltro, setModuloFiltro] = useState("");

  const [tema, setTema] = useState("");
  const [tipoAtividade, setTipoAtividade] = useState(
    TIPO_ATIVIDADE.MULTIPLA_ESCOLHA,
  );
  const [idModuloGerar, setIdModuloGerar] = useState("");
  const [gerando, setGerando] = useState(false);

  const [novoModuloNome, setNovoModuloNome] = useState("");
  const [criandoModulo, setCriandoModulo] = useState(false);
  const [moduloRenomeando, setModuloRenomeando] = useState(null);
  const [nomeRenomeio, setNomeRenomeio] = useState("");

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

  async function carregarModulosLista() {
    try {
      const dados = await buscarModulos(idMateria, fetchAutenticado);
      setModulos(dados);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  useEffect(() => {
    carregarAtividades();
    carregarModulosLista();
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
          body: JSON.stringify({
            idMateria,
            tema,
            tipoAtividade,
            idModulo: idModuloGerar ? Number(idModuloGerar) : null,
          }),
        },
      );
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível gerar a atividade.");

      setTema("");
      carregarAtividades();
      carregarModulosLista();
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setGerando(false);
    }
  }

  async function handleCriarModulo(e) {
    e.preventDefault();
    if (!novoModuloNome.trim()) return;
    setErro(null);
    setCriandoModulo(true);
    try {
      const resposta = await fetchAutenticado(`${API_BASE_URL}/api/Modulo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idMateria, nome: novoModuloNome.trim() }),
      });
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível criar o módulo.");
      setNovoModuloNome("");
      carregarModulosLista();
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setCriandoModulo(false);
    }
  }

  function iniciarRenomeioModulo(modulo) {
    setModuloRenomeando(modulo.id);
    setNomeRenomeio(modulo.nome);
  }

  async function handleRenomearModulo(e, idModulo) {
    e.preventDefault();
    setErro(null);
    try {
      const resposta = await fetchAutenticado(
        `${API_BASE_URL}/api/Modulo/${idModulo}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: nomeRenomeio.trim() }),
        },
      );
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível renomear o módulo.");
      setModuloRenomeando(null);
      carregarModulosLista();
    } catch (err) {
      setErro(mensagemErro(err));
    }
  }

  async function handleExcluirModulo(idModulo) {
    if (
      !window.confirm(
        'Excluir esse módulo? As atividades e materiais dele voltam para "Sem módulo".',
      )
    )
      return;
    setErro(null);
    try {
      const resposta = await fetchAutenticado(
        `${API_BASE_URL}/api/Modulo/${idModulo}`,
        { method: "DELETE" },
      );
      if (!resposta.ok) {
        const dados = await resposta.json();
        throw new Error(dados.erro || "Não foi possível excluir o módulo.");
      }
      if (moduloFiltro === String(idModulo)) setModuloFiltro("");
      carregarModulosLista();
      carregarAtividades();
    } catch (err) {
      setErro(mensagemErro(err));
    }
  }

  async function handleMoverAtividade(idAtividade, valorSelect) {
    setErro(null);
    try {
      const idModulo = valorSelect === "" ? null : Number(valorSelect);
      const resposta = await fetchAutenticado(
        `${API_BASE_URL}/api/atividade/${idAtividade}/modulo`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idModulo }),
        },
      );
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível mover a atividade.");
      carregarAtividades();
      carregarModulosLista();
    } catch (err) {
      setErro(mensagemErro(err));
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
      carregarModulosLista();
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

  const atividadesFiltradas = atividades.filter((atividade) => {
    if (moduloFiltro === "") return true;
    if (moduloFiltro === "sem") return atividade.idModulo == null;
    return atividade.idModulo === Number(moduloFiltro);
  });

  return (
    <div className="App">
      <Link to="/materias">← Voltar</Link>
      <h1>Atividades</h1>

      {ehProfessor && (
        <div className="secao-modulos">
          <h3 style={{ marginTop: 0 }}>Módulos</h3>
          <p>
            Divida a matéria em módulos (ex.: "Condicionais", "Laços de
            repetição") para organizar atividades e materiais, e deixar o
            aluno praticar só uma parte do conteúdo.
          </p>

          <form className="form-novo-modulo" onSubmit={handleCriarModulo}>
            <input
              id="novo-modulo-nome"
              name="nomeModulo"
              value={novoModuloNome}
              onChange={(e) => setNovoModuloNome(e.target.value)}
              placeholder="Nome do novo módulo"
              maxLength={100}
            />
            <button type="submit" disabled={criandoModulo}>
              {criandoModulo ? "Criando..." : "Novo módulo"}
            </button>
          </form>

          {modulos.length === 0 ? (
            <p>Nenhum módulo criado ainda — as atividades ficam "Sem módulo".</p>
          ) : (
            <div className="lista-modulos">
              {modulos.map((modulo) =>
                moduloRenomeando === modulo.id ? (
                  <form
                    key={modulo.id}
                    className="modulo-item"
                    onSubmit={(e) => handleRenomearModulo(e, modulo.id)}
                  >
                    <input
                      id={`renomear-modulo-${modulo.id}`}
                      name="nomeModulo"
                      value={nomeRenomeio}
                      onChange={(e) => setNomeRenomeio(e.target.value)}
                      maxLength={100}
                      autoFocus
                    />
                    <div className="modulo-item-acoes">
                      <button type="submit">Salvar</button>
                      <button
                        type="button"
                        onClick={() => setModuloRenomeando(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div key={modulo.id} className="modulo-item">
                    <div>
                      <span className="modulo-item-nome">{modulo.nome}</span>{" "}
                      <span className="modulo-item-contagem">
                        ({modulo.quantidadeAtividades} atividades,{" "}
                        {modulo.quantidadeMateriais} materiais)
                      </span>
                    </div>
                    <div className="modulo-item-acoes">
                      <button
                        type="button"
                        onClick={() => iniciarRenomeioModulo(modulo)}
                      >
                        Renomear
                      </button>
                      <button
                        type="button"
                        className="botao-perigo"
                        onClick={() => handleExcluirModulo(modulo.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      )}

      {ehProfessor && (
        <>
          <h3>Gerar atividade com IA</h3>
          <form onSubmit={handleGerar}>
            <input
              id="gerar-tema"
              name="tema"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Tema"
            />
            <select
              id="gerar-tipo"
              name="tipoAtividade"
              value={tipoAtividade}
              onChange={(e) => setTipoAtividade(Number(e.target.value))}
            >
              <option value={TIPO_ATIVIDADE.MULTIPLA_ESCOLHA}>
                Múltipla escolha
              </option>
              <option value={TIPO_ATIVIDADE.DISSERTATIVA}>Dissertativa</option>
              <option value={TIPO_ATIVIDADE.CODIGO}>Código</option>
            </select>
            <select
              id="gerar-modulo"
              name="idModulo"
              value={idModuloGerar}
              onChange={(e) => setIdModuloGerar(e.target.value)}
            >
              <option value="">Sem módulo (usa todos os materiais)</option>
              {modulos.map((modulo) => (
                <option key={modulo.id} value={modulo.id}>
                  {modulo.nome}
                </option>
              ))}
            </select>
            <button type="submit" disabled={gerando}>
              {gerando ? "Gerando..." : "Gerar"}
            </button>
          </form>
        </>
      )}

      {erro && <p className="erro">{erro}</p>}
      {carregando && <p>Carregando...</p>}

      {!carregando && atividades.length > 0 && (
        <div className="campo" style={{ maxWidth: 300, marginBottom: 20 }}>
          <label htmlFor="filtro-modulo">Filtrar por módulo</label>
          <select
            id="filtro-modulo"
            value={moduloFiltro}
            onChange={(e) => setModuloFiltro(e.target.value)}
          >
            <option value="">Todos os módulos</option>
            <option value="sem">Sem módulo</option>
            {modulos.map((modulo) => (
              <option key={modulo.id} value={modulo.id}>
                {modulo.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      <ul>
        {atividadesFiltradas.map((atividade) => (
          <li key={atividade.id}>
            <span className="badge-modulo">
              {nomeModulo(atividade.idModulo, modulos)}
            </span>
            <br />
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
              <>
                <div className="acoes-item">
                  <button onClick={() => iniciarEdicao(atividade)}>
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setIdTestando(atividade.id);
                      setResultadoTeste(null);
                      setRespostaTeste("");
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
                <div className="mover-modulo">
                  <label htmlFor={`mover-modulo-${atividade.id}`}>
                    Mover para:
                  </label>
                  <select
                    id={`mover-modulo-${atividade.id}`}
                    value={atividade.idModulo ?? ""}
                    onChange={(e) =>
                      handleMoverAtividade(atividade.id, e.target.value)
                    }
                  >
                    <option value="">Sem módulo</option>
                    {modulos.map((modulo) => (
                      <option key={modulo.id} value={modulo.id}>
                        {modulo.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {idEditando === atividade.id && (
              <form onSubmit={(e) => handleSalvarEdicao(e, atividade)}>
                <input
                  id={`edicao-nome-${atividade.id}`}
                  name="nome"
                  value={nomeEdicao}
                  onChange={(e) => setNomeEdicao(e.target.value)}
                />
                <textarea
                  id={`edicao-conteudo-${atividade.id}`}
                  name="conteudo"
                  value={conteudoEdicao}
                  onChange={(e) => setConteudoEdicao(e.target.value)}
                />
                {atividade.tipo === "MultiplaEscolha" && (
                  <div className="lista-alternativas">
                    {alternativasEdicao.map((alt, i) => (
                      <div className="linha-alternativa" key={i}>
                        <input
                          id={`edicao-alternativa-${atividade.id}-${i}`}
                          name={`alternativa-${i}`}
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
                    id={`edicao-gabarito-${atividade.id}`}
                    name="gabarito"
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
                {atividade.tipo === "MultiplaEscolha" ? (
                  <div className="opcoes-teste">
                    {atividade.alternativas.map((alt, i) => {
                      const letra = alt.trim().charAt(0);
                      return (
                        <label key={i} className="opcao-teste">
                          <input
                            type="radio"
                            name={`resposta-teste-${atividade.id}`}
                            value={letra}
                            checked={respostaTeste === letra}
                            onChange={(e) => setRespostaTeste(e.target.value)}
                          />
                          {alt}
                        </label>
                      );
                    })}
                  </div>
                ) : atividade.tipo === "Codigo" ? (
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
                    id={`teste-resposta-${atividade.id}`}
                    name="respostaTeste"
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
