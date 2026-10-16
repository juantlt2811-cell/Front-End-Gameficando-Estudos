import "../App.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ContadorAtividades } from "../components/ContadorAtividades";
import { ListaMaterias } from "../components/ListaMaterias";
import { Formulario } from "../components/Formulario";
import { useAuth } from "../context/AuthContext";
import { TIPO_USUARIO } from "../constants/tipoUsuario";

export function Home() {
  const [materias, setMaterias] = useState([]);
  const [atividadesFeitas, setAtividadesFeitas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await fetch(
          "https://localhost:7259/api/materia/disponiveis",
          { headers: { Authorization: `Bearer ${usuario?.token}` } },
        );
        const dados = await resposta.json();
        setMaterias(dados);
      } catch (e) {
        setErro("Não foi possível carregar as matérias.");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const [nome, setNome] = useState("");
  useEffect(() => {
    document.title = `Atividades feitas: ${atividadesFeitas}`;
  }, [atividadesFeitas]);

  return (
    <div className="App">
      <h1>Primeiro contato com React - Projeto Gameficando Estudos</h1>
      <button onClick={handleLogout}>Sair</button>

      {usuario.tipoUsuario === TIPO_USUARIO.PROFESSOR && (
        <p>Você é professor</p>
      )}
      {usuario.tipoUsuario === TIPO_USUARIO.ALUNO && <p>Você é aluno</p>}
      {usuario.tipoUsuario === TIPO_USUARIO.ADMIN && <p>Você é admin</p>}

      <button
        onClick={() => setAtividadesFeitas(atividadesFeitas + 1)}
        disabled={atividadesFeitas >= 3}
      >
        Concluir atividade
      </button>

      <Formulario onEnviar={(nomeDigitado) => setNome(nomeDigitado)} />
      <p>Nome digitado: {nome}</p>
      <ContadorAtividades total={atividadesFeitas} />
      {carregando && <p>Carregando matérias...</p>}
      {erro && <p>{erro}</p>}
      {!carregando && !erro && <ListaMaterias materias={materias} />}
      {atividadesFeitas >= 3 && <p> Limite Diário Atingido </p>}
    </div>
  );
}
