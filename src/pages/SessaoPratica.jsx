import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TIPO_USUARIO } from "../constants/tipoUsuario";
import { TIPO_ATIVIDADE } from "../constants/tipoAtividade";
import { API_BASE_URL } from "../constants/api";

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
        setErro(e.message);
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
      setErro(e.message);
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
      setErro(e.message);
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
      setErro(e.message);
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
        <p>Questões respondidas: {resumoFinal.totalRespondidas}</p>
        <p>Acertos: {resumoFinal.totalAcertos}</p>
        <p>Percentual de acerto: {resumoFinal.percentualAcerto.toFixed(0)}%</p>
        <p>Ofensiva atual: {resumoFinal.ofensivaAtual}</p>
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
        <p>
          Questão {indiceAtual + 1} de {sessao.questoes.length}
        </p>

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
            ) : (
              <textarea
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Digite sua resposta"
                rows={6}
              />
            )}
            {erro && <p>{erro}</p>}
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
      {erro && <p>{erro}</p>}
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
