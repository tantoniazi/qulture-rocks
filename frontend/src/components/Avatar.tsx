interface AvatarProps {
  name: string;
  picture: string | null;
}

export function Avatar({ name, picture }: AvatarProps) {
  if (picture) {
    return <img className="avatar" src={picture} alt={`Photo of ${name}`} />;
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span className="avatar avatar-initials" aria-label={`Avatar of ${name}`}>
      {initials}
    </span>
  );
}
