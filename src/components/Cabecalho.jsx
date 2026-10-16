import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Cabecalho() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tema, setTema] = useState(
    () => localStorage.getItem("tema") || "claro",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-tema", tema);
    localStorage.setItem("tema", tema);
  }, [tema]);

  function alternarTema() {
    setTema((atual) => (atual === "claro" ? "escuro" : "claro"));
  }

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
        <Link to="/sobre">Sobre</Link>
        <button type="button" onClick={alternarTema}>
          {tema === "claro" ? "Tema escuro" : "Tema claro"}
        </button>
        <button type="button" onClick={handleLogout}>
          Sair
        </button>
      </nav>
    </header>
  );
}
