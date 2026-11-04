import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { mensagemErro } from "../utils/erroRede";
import { buscarModulos, nomeModulo } from "../utils/modulo";

export function CaixaFontes() {
  const { id } = useParams();
  const idMateria = Number(id);
  const { fetchAutenticado } = useAuth();

  const [materiais, setMateriais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [modulos, setModulos] = useState([]);

  const [tituloTexto, setTituloTexto] = useState("");
  const [textoCompleto, setTextoCompleto] = useState("");
  const [idModuloTexto, setIdModuloTexto] = useState("");
  const [enviandoTexto, setEnviandoTexto] = useState(false);

  const [arquivo, setArquivo] = useState(null);
  const [idModuloArquivo, setIdModuloArquivo] = useState("");
  const [enviandoArquivo, setEnviandoArquivo] = useState(false);

  async function carregarMateriais() {
    setCarregando(true);
    try {
      const resposta = await fetchAutenticado(
        `${API_BASE_URL}/api/caixafontes/materia/${idMateria}/materiais`,
      );
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível carregar.");
      setMateriais(dados);
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
    carregarMateriais();
    carregarModulosLista();
  }, [idMateria]);

  async function handleEnviarTexto(e) {
    e.preventDefault();
    setEnviandoTexto(true);
    setErro(null);
    try {
      const resposta = await fetchAutenticado(
        `${API_BASE_URL}/api/caixafontes/processar-texto`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idMateria,
            tituloMaterial: tituloTexto,
            textoCompleto,
            idModulo: idModuloTexto ? Number(idModuloTexto) : null,
          }),
        },
      );
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível processar o texto.");

      setTituloTexto("");
      setTextoCompleto("");
      setIdModuloTexto("");
      carregarMateriais();
      carregarModulosLista();
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setEnviandoTexto(false);
    }
  }

  async function handleEnviarArquivo(e) {
    e.preventDefault();
    if (!arquivo) return;
    setEnviandoArquivo(true);
    setErro(null);
    try {
      const formData = new FormData();
      formData.append("idMateria", idMateria);
      formData.append("arquivo", arquivo);
      if (idModuloArquivo) formData.append("idModulo", idModuloArquivo);

      const resposta = await fetchAutenticado(
        `${API_BASE_URL}/api/caixafontes/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível processar o arquivo.");

      setArquivo(null);
      setIdModuloArquivo("");
      e.target.reset();
      carregarMateriais();
      carregarModulosLista();
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setEnviandoArquivo(false);
    }
  }

  async function handleRemover(documentoId) {
    if (!window.confirm("Remover esse material da base de conhecimento?"))
      return;
    try {
      const resposta = await fetchAutenticado(
        `${API_BASE_URL}/api/caixafontes/remover-material`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idMateria, documentoId }),
        },
      );
      if (!resposta.ok) {
        const dados = await resposta.json();
        throw new Error(dados.erro || "Não foi possível remover.");
      }
      carregarMateriais();
      carregarModulosLista();
    } catch (err) {
      setErro(mensagemErro(err));
    }
  }

  async function handleMoverMaterial(documentoId, valorSelect) {
    setErro(null);
    try {
      const idModulo = valorSelect === "" ? null : Number(valorSelect);
      const resposta = await fetchAutenticado(
        `${API_BASE_URL}/api/caixafontes/mover-material`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idMateria, documentoId, idModulo }),
        },
      );
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível mover o material.");
      carregarMateriais();
      carregarModulosLista();
    } catch (err) {
      setErro(mensagemErro(err));
    }
  }

  return (
    <div className="App">
      <Link to="/minhas-materias">← Minhas matérias</Link>
      <h1>Base de conhecimento</h1>

      <h3>Adicionar texto</h3>
      <form onSubmit={handleEnviarTexto}>
        <input
          value={tituloTexto}
          onChange={(e) => setTituloTexto(e.target.value)}
          placeholder="Título do material"
        />
        <textarea
          value={textoCompleto}
          onChange={(e) => setTextoCompleto(e.target.value)}
          placeholder="Cole o texto completo aqui"
          rows={6}
        />
        <select
          value={idModuloTexto}
          onChange={(e) => setIdModuloTexto(e.target.value)}
        >
          <option value="">Sem módulo</option>
          {modulos.map((modulo) => (
            <option key={modulo.id} value={modulo.id}>
              {modulo.nome}
            </option>
          ))}
        </select>
        <button type="submit" disabled={enviandoTexto}>
          {enviandoTexto ? "Processando..." : "Adicionar texto"}
        </button>
      </form>

      <h3>Enviar arquivo</h3>
      <form onSubmit={handleEnviarArquivo}>
        <input type="file" onChange={(e) => setArquivo(e.target.files[0])} />
        <select
          value={idModuloArquivo}
          onChange={(e) => setIdModuloArquivo(e.target.value)}
        >
          <option value="">Sem módulo</option>
          {modulos.map((modulo) => (
            <option key={modulo.id} value={modulo.id}>
              {modulo.nome}
            </option>
          ))}
        </select>
        <button type="submit" disabled={enviandoArquivo || !arquivo}>
          {enviandoArquivo ? "Processando..." : "Enviar arquivo"}
        </button>
      </form>

      {erro && <p className="erro">{erro}</p>}

      <h3>Materiais já processados</h3>
      {carregando && <p>Carregando...</p>}
      {!carregando && materiais.length === 0 && <p>Nenhum material ainda.</p>}
      <ul>
        {materiais.map((m) => (
          <li key={m.documentoId}>
            <span className="badge-modulo">
              {nomeModulo(m.idModulo, modulos)}
            </span>
            <br />
            {m.tituloMaterial} ({m.quantidadeChunks} trechos)
            <div className="acoes-item">
              <button
                className="botao-perigo"
                onClick={() => handleRemover(m.documentoId)}
              >
                Remover
              </button>
            </div>
            <div className="mover-modulo">
              <label htmlFor={`mover-material-${m.documentoId}`}>
                Mover para:
              </label>
              <select
                id={`mover-material-${m.documentoId}`}
                value={m.idModulo ?? ""}
                onChange={(e) =>
                  handleMoverMaterial(m.documentoId, e.target.value)
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
          </li>
        ))}
      </ul>
    </div>
  );
}
