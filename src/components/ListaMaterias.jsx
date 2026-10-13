import { Link } from "react-router-dom";

export function ListaMaterias({ materias }) {
  return (
    <ul>
      {materias.map((materia) => (
        <li key={materia.id}>
          <Link to={`/materias/${materia.id}`}>{materia.name}</Link>
        </li>
      ))}
    </ul>
  );
}
