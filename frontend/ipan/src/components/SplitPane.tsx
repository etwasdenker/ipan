// frontend/ipan/src/components/SplitPane.tsx
import React from "react";

type Props = { children?: React.ReactNode };

// Ничего не рисуем и ничего не перехватываем.
// Даже если страницы продолжают импортировать SplitPane/Divider — мы их глушим.
export default function SplitPane({ children }: Props) {
  return <>{children}</>;
}

// Если где-то импортируется именованный Divider — он тоже «молчит».
export function VerticalDivider() {
  return null;
}
export function HorizontalDivider() {
  return null;
}
