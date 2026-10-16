import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TIPO_USUARIO } from "../constants/tipoUsuario";

export function ListaMaterias({
  materias,
  onExcluir,
  onEditar,
  onGerenciarFontes,
}) {
  const { usuario } = useAuth();

  return (
    <ul>
      {materias.map((materia) => (
        <li key={materia.id}>
          <Link to={`/materias/${materia.id}`}>{materia.nome}</Link>
          {onEditar && (
            <button onClick={() => onEditar(materia)}>Editar</button>
          )}
          {onExcluir && (
            <button onClick={() => onExcluir(materia.id)}>Excluir</button>
          )}
          {onGerenciarFontes && (
            <Link to={`/materias/${materia.id}/fontes`}>
              Gerenciar materiais
            </Link>
          )}
          <Link to={`/materias/${materia.id}/atividades`}>Ver atividades</Link>
          {usuario.tipoUsuario === TIPO_USUARIO.ALUNO && (
            <Link to={`/materias/${materia.id}/praticar`}>Praticar</Link>
          )}
          {onGerenciarFontes && (
            <Link to={`/materias/${materia.id}/estatisticas`}>
              Ver estatísticas
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
