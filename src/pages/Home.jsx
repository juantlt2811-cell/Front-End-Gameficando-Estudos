import "../App.css";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ListaMaterias } from "../components/ListaMaterias";
import { CriarMateriaForm } from "../components/CriarMateriaForm";
import { useAuth } from "../context/AuthContext";
import { TIPO_USUARIO } from "../constants/tipoUsuario";

export function Home() {
  const [materias, setMaterias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  async function carregarMaterias() {
    setCarregando(true);
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

  useEffect(() => {
    carregarMaterias();
  }, []);

  return (
    <div className="App">
      <h1>Gameficando Estudos</h1>
      <button onClick={handleLogout}>Sair</button>

      {usuario.tipoUsuario === TIPO_USUARIO.PROFESSOR && (
        <Link to="/minhas-materias">Minhas matérias</Link>
      )}
      {usuario.tipoUsuario === TIPO_USUARIO.ALUNO && <p>Você é aluno</p>}
      {usuario.tipoUsuario === TIPO_USUARIO.ADMIN && <p>Você é admin</p>}

      {carregando && <p>Carregando matérias...</p>}
      {erro && <p>{erro}</p>}
      {!carregando && !erro && <ListaMaterias materias={materias} />}
    </div>
  );
}
