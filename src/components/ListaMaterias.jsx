import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { TIPO_USUARIO } from "../constants/tipoUsuario";

export function ListaMaterias({
  materias,
  onExcluir,
  onEditar,
  onGerenciarFontes,
}) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [modo, setModo] = useState("lista");

  function irParaAtividades(idMateria) {
    navigate(`/materias/${idMateria}/atividades`);
  }

  return (
    <div>
      <div className="alternador-visualizacao">
        <button
          type="button"
          onClick={() => setModo("lista")}
          className={modo === "lista" ? "ativo" : ""}
        >
          Lista
        </button>
        <button
          type="button"
          onClick={() => setModo("cards")}
          className={modo === "cards" ? "ativo" : ""}
        >
          Cards
        </button>
      </div>

      {modo === "lista" ? (
        <ul>
          {materias.map((materia) => (
            <li key={materia.id}>
              <Link to={`/materias/${materia.id}/atividades`}>
                {materia.nome}
              </Link>
              {onEditar && (
                <button onClick={() => onEditar(materia)}>Editar</button>
              )}
              {onExcluir && (
                <button onClick={() => onExcluir(materia.id)}>Excluir</button>
              )}
              {onGerenciarFontes && (
                <>
                  <Link to={`/materias/${materia.id}/fontes`}>
                    Gerenciar materiais
                  </Link>
                  <Link to={`/materias/${materia.id}/estatisticas`}>
                    Ver estatísticas
                  </Link>
                </>
              )}
              <Link to={`/materias/${materia.id}/atividades`}>
                Ver atividades
              </Link>
              {usuario.tipoUsuario === TIPO_USUARIO.ALUNO && (
                <Link to={`/materias/${materia.id}/praticar`}>Praticar</Link>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="cards-materias">
          {materias.map((materia) => (
            <div
              key={materia.id}
              className="card-materia"
              role="button"
              tabIndex={0}
              onClick={() => irParaAtividades(materia.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") irParaAtividades(materia.id);
              }}
            >
              <h3>{materia.nome}</h3>
              <p>Carga horária: {materia.cargaHoraria}h</p>
              <p>Dificuldade: {materia.dificuldade}</p>

              <div
                className="card-materia-acoes"
                onClick={(e) => e.stopPropagation()}
              >
                {onEditar && (
                  <button onClick={() => onEditar(materia)}>Editar</button>
                )}
                {onExcluir && (
                  <button onClick={() => onExcluir(materia.id)}>Excluir</button>
                )}
                {onGerenciarFontes && (
                  <>
                    <Link to={`/materias/${materia.id}/fontes`}>
                      Gerenciar materiais
                    </Link>
                    <Link to={`/materias/${materia.id}/estatisticas`}>
                      Estatísticas
                    </Link>
                  </>
                )}
                {usuario.tipoUsuario === TIPO_USUARIO.ALUNO && (
                  <Link to={`/materias/${materia.id}/praticar`}>Praticar</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
