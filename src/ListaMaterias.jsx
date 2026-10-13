export function ListaMaterias({ materias }) {
  return (
    <ul>
      {materias.map((materia) => (
        <li key={materia.id}>{materia.name}</li>
      ))}
    </ul>
  );
}
