import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useAuth } from "../context/AuthContext";
import { TIPO_USUARIO } from "../constants/tipoUsuario";
import { TIPO_ATIVIDADE } from "../constants/tipoAtividade";
import { TAMANHOS_SESSAO } from "../constants/tamanhoSessao";
import { API_BASE_URL } from "../constants/api";
import { mensagemErro } from "../utils/erroRede";
import { buscarModulos } from "../utils/modulo";

function mensagemDesempenho(notaMedia) {
  if (notaMedia >= 90) return "Mandou muito bem!";
  if (notaMedia >= 70) return "Boa! Você foi bem.";
  if (notaMedia >= 40) return "Progredindo — continue praticando.";
  return "Vale revisar o conteúdo e tentar de novo.";
}

function construirQuery(idModulo, tamanho) {
  const params = new URLSearchParams();
  if (idModulo) params.set("idModulo", idModulo);
  if (tamanho) params.set("tamanho", tamanho);
  const texto = params.toString();
  return texto ? `?${texto}` : "";
}

export function SessaoPratica() {
  const { id } = useParams();
  const idMateria = Number(id);
  const { usuario, fetchAutenticado } = useAuth();

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [modulos, setModulos] = useState([]);
  const [idModuloEscolhido, setIdModuloEscolhido] = useState("");
  const [tamanhoEscolhido, setTamanhoEscolhido] = useState("Curta");

  const [confirmacao, setConfirmacao] = useState(null);
  const [sessao, setSessao] = useState(null);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [resposta, setResposta] = useState("");
  const [resultado, setResultado] = useState(null);
  const [respondendo, setRespondendo] = useState(false);
  const [resumoFinal, setResumoFinal] = useState(null);

  useEffect(() => {
    async function carregarModulosLista() {
      try {
        const dados = await buscarModulos(idMateria, fetchAutenticado);
        setModulos(dados);
      } catch (e) {
        setErro(mensagemErro(e));
      }
    }
    carregarModulosLista();
  }, [idMateria]);

  useEffect(() => {
    async function carregarConfirmacao() {
      setCarregando(true);
      try {
        const query = construirQuery(idModuloEscolhido, tamanhoEscolhido);
        const resp = await fetchAutenticado(
          `${API_BASE_URL}/api/sessaopratica/confirmar-inicio/${idMateria}${query}`,
        );
        const dados = await resp.json();
        if (!resp.ok)
          throw new Error(dados.erro || "Não foi possível verificar.");
        setConfirmacao(dados);
      } catch (e) {
        setErro(mensagemErro(e));
      } finally {
        setCarregando(false);
      }
    }
    carregarConfirmacao();
  }, [idMateria, idModuloEscolhido, tamanhoEscolhido]);

  async function handleIniciar() {
    setErro(null);
    try {
      const query = construirQuery(idModuloEscolhido, tamanhoEscolhido);
      const resp = await fetchAutenticado(
        `${API_BASE_URL}/api/sessaopratica/iniciar/${idMateria}${query}`,
        { method: "POST" },
      );
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || "Não foi possível iniciar.");
      setSessao(dados);
      setIndiceAtual(0);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  async function handleResponder(e) {
    e.preventDefault();
    if (!resposta) return;
    setRespondendo(true);
    setErro(null);
    try {
      const questaoAtual = sessao.questoes[indiceAtual];
      const resp = await fetchAutenticado(
        `${API_BASE_URL}/api/sessaopratica/${sessao.idSessao}/responder/${questaoAtual.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resposta }),
        },
      );
      const dados = await resp.json();
      if (!resp.ok)
        throw new Error(dados.erro || "Não foi possível responder.");
      setResultado(dados);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setRespondendo(false);
    }
  }

  function handleProxima() {
    setResposta("");
    setResultado(null);
    setIndiceAtual((i) => i + 1);
  }

  async function handleConcluir() {
    setErro(null);
    try {
      const resp = await fetchAutenticado(
        `${API_BASE_URL}/api/sessaopratica/${sessao.idSessao}/concluir`,
        { method: "POST" },
      );
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || "Não foi possível concluir.");
      setResumoFinal(dados);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  if (usuario.tipoUsuario !== TIPO_USUARIO.ALUNO) {
    return (
      <div className="App">
        <Link to="/materias">← Voltar</Link>
        <p>Essa área é exclusiva para alunos.</p>
      </div>
    );
  }

  if (resumoFinal) {
    return (
      <div className="App">
        <Link to="/materias">← Voltar</Link>
        <h1>Sessão concluída!</h1>

        <div className="resumo-sessao">
          <div className="resumo-sessao-destaque">
            <p className="resumo-sessao-nota">
              {resumoFinal.notaMedia.toFixed(0)}%
            </p>
            <p className="resumo-sessao-mensagem">
              {mensagemDesempenho(resumoFinal.notaMedia)}
            </p>
          </div>

          <div className="resumo-sessao-detalhes">
            <div>
              <p className="resumo-sessao-item-rotulo">Questões respondidas</p>
              <p className="resumo-sessao-item-valor">
                {resumoFinal.totalRespondidas}
              </p>
            </div>
            <div>
              <p className="resumo-sessao-item-rotulo">Aprovação total</p>
              <p className="resumo-sessao-item-valor">
                {resumoFinal.totalAcertos}/{resumoFinal.totalRespondidas}
              </p>
            </div>
            <div>
              <p className="resumo-sessao-item-rotulo">Ofensiva atual</p>
              <p className="resumo-sessao-item-valor">
                {resumoFinal.ofensivaAtual}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sessao) {
    const questaoAtual = sessao.questoes[indiceAtual];
    const ultimaQuestao = indiceAtual === sessao.questoes.length - 1;

    return (
      <div className="App">
        <Link to="/materias">← Voltar</Link>
        <h1>Praticando</h1>

        <div className="progresso-sessao">
          <div className="progresso-sessao-texto">
            <span>
              Questão {indiceAtual + 1} de {sessao.questoes.length}
            </span>
            <span>
              {Math.round(((indiceAtual + 1) / sessao.questoes.length) * 100)}%
            </span>
          </div>
          <div className="barra-progresso">
            <div
              className="barra-progresso-preenchida"
              style={{
                width: `${((indiceAtual + 1) / sessao.questoes.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <h3>{questaoAtual.nome}</h3>
        <p>{questaoAtual.conteudo}</p>

        {!resultado ? (
          <form onSubmit={handleResponder}>
            {questaoAtual.tipo === TIPO_ATIVIDADE.MULTIPLA_ESCOLHA ? (
              <div className="opcoes-teste">
                {questaoAtual.alternativas.map((alt, i) => {
                  const letra = alt.trim().charAt(0);
                  return (
                    <label key={i} className="opcao-teste">
                      <input
                        type="radio"
                        name="alternativa"
                        value={letra}
                        checked={resposta === letra}
                        onChange={(e) => setResposta(e.target.value)}
                      />
                      {alt}
                    </label>
                  );
                })}
              </div>
            ) : questaoAtual.tipo === TIPO_ATIVIDADE.CODIGO ? (
              <div className="editor-codigo">
                <Editor
                  height="220px"
                  defaultLanguage="python"
                  theme="vs-dark"
                  value={resposta}
                  onChange={(valor) => setResposta(valor || "")}
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
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Digite sua resposta"
                rows={6}
              />
            )}
            {erro && <p className="erro">{erro}</p>}
            <button type="submit" disabled={respondendo || !resposta}>
              {respondendo ? "Enviando..." : "Responder"}
            </button>
          </form>
        ) : (
          <div>
            <p>{resultado.feedback}</p>
            {ultimaQuestao ? (
              <button onClick={handleConcluir}>Concluir sessão</button>
            ) : (
              <button onClick={handleProxima}>Próxima questão</button>
            )}
          </div>
        )}
      </div>
    );
  }

  const modulosComAtividade = modulos.filter(
    (m) => m.quantidadeAtividades > 0,
  );

  return (
    <div className="App">
      <Link to="/materias">← Voltar</Link>
      <h1>Praticar</h1>
      {erro && <p className="erro">{erro}</p>}

      <div className="selecao-sessao">
        <div className="selecao-sessao-campo">
          <label htmlFor="selecao-modulo">O que você quer praticar?</label>
          <select
            id="selecao-modulo"
            value={idModuloEscolhido}
            onChange={(e) => setIdModuloEscolhido(e.target.value)}
          >
            <option value="">Matéria inteira</option>
            {modulos.map((modulo) => (
              <option
                key={modulo.id}
                value={modulo.id}
                disabled={modulo.quantidadeAtividades === 0}
              >
                {modulo.nome}
                {modulo.quantidadeAtividades === 0
                  ? " (sem atividades)"
                  : ""}
              </option>
            ))}
          </select>
          {modulos.length > 0 && modulosComAtividade.length === 0 && (
            <p className="resumo-confirmacao">
              Nenhum módulo tem atividades ainda — praticando a matéria
              inteira.
            </p>
          )}
        </div>

        <div className="selecao-sessao-campo">
          <label>Tamanho da sessão</label>
          <div className="opcoes-tamanho">
            {TAMANHOS_SESSAO.map((t) => {
              const desabilitado =
                t.valor !== "Todas" &&
                confirmacao &&
                t.maximo > confirmacao.totalQuestoesNoRecorte;
              const rotulo =
                t.valor === "Todas" && confirmacao
                  ? `Todas (${confirmacao.totalQuestoesNoRecorte})`
                  : t.rotulo;
              return (
                <label key={t.valor} className="opcao-tamanho">
                  <input
                    type="radio"
                    name="tamanho-sessao"
                    value={t.valor}
                    checked={tamanhoEscolhido === t.valor}
                    disabled={desabilitado}
                    onChange={(e) => setTamanhoEscolhido(e.target.value)}
                  />
                  {rotulo}
                </label>
              );
            })}
          </div>
        </div>

        {carregando && <p>Verificando...</p>}
        {confirmacao && !carregando && (
          <>
            <p className="resumo-confirmacao">
              Tentativas restantes hoje: {confirmacao.tentativasRestantesHoje}
            </p>
            {confirmacao.podeIniciar ? (
              <button onClick={handleIniciar}>Iniciar prática</button>
            ) : (
              <p className="erro">{confirmacao.motivo}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
