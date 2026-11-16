interface ErrorListProps {
  errors: string[];
}

export function ErrorList({ errors }: ErrorListProps) {
  if (errors.length === 0) return null;

  return (
    <ul className="error-list" role="alert">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}
