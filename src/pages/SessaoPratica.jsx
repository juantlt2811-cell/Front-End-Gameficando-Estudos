import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useAuth } from "../context/AuthContext";
import { TIPO_USUARIO } from "../constants/tipoUsuario";
import { TIPO_ATIVIDADE } from "../constants/tipoAtividade";
import { API_BASE_URL } from "../constants/api";
import { mensagemErro } from "../utils/erroRede";

function mensagemDesempenho(notaMedia) {
  if (notaMedia >= 90) return "Mandou muito bem!";
  if (notaMedia >= 70) return "Boa! Você foi bem.";
  if (notaMedia >= 40) return "Progredindo — continue praticando.";
  return "Vale revisar o conteúdo e tentar de novo.";
}

export function SessaoPratica() {
  const { id } = useParams();
  const idMateria = Number(id);
  const { usuario, fetchAutenticado } = useAuth();

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [confirmacao, setConfirmacao] = useState(null);
  const [sessao, setSessao] = useState(null);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [resposta, setResposta] = useState("");
  const [resultado, setResultado] = useState(null);
  const [respondendo, setRespondendo] = useState(false);
  const [resumoFinal, setResumoFinal] = useState(null);

  useEffect(() => {
    async function carregarConfirmacao() {
      try {
        const resp = await fetchAutenticado(
          `${API_BASE_URL}/api/sessaopratica/confirmar-inicio/${idMateria}`,
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
  }, [idMateria]);

  async function handleIniciar() {
    setErro(null);
    try {
      const resp = await fetchAutenticado(
        `${API_BASE_URL}/api/sessaopratica/iniciar/${idMateria}`,
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

  if (carregando) return <p>Carregando...</p>;

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
              <div>
                {questaoAtual.alternativas.map((alt, i) => {
                  const letra = alt.trim().charAt(0);
                  return (
                    <label key={i} style={{ display: "block" }}>
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

  return (
    <div className="App">
      <Link to="/materias">← Voltar</Link>
      <h1>Praticar</h1>
      {erro && <p className="erro">{erro}</p>}
      {confirmacao && (
        <>
          <p>Questões disponíveis: {confirmacao.totalQuestoesDisponiveis}</p>
          <p>
            Tentativas restantes hoje: {confirmacao.tentativasRestantesHoje}
          </p>
          {confirmacao.podeIniciar ? (
            <button onClick={handleIniciar}>Iniciar prática</button>
          ) : (
            <p>{confirmacao.motivo}</p>
          )}
        </>
      )}
    </div>
  );
}
