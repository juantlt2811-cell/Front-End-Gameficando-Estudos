import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Cabecalho() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="cabecalho">
      <Link to="/" className="cabecalho-marca">
        Gameficando Estudos
      </Link>
      <nav className="cabecalho-nav">
        <Link to="/materias">Matérias</Link>
        <Link to="/ranking">Ranking</Link>
        <Link to="/perfil">Perfil</Link>
        <button type="button" onClick={handleLogout}>
          Sair
        </button>
      </nav>
    </header>
  );
}
