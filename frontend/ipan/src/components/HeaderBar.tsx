// frontend/ipan/src/components/HeaderBar.tsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * Источники значений для Header:
 *   ui.header.height      -> высота (px), по умолчанию 80
 *   ui.header.bg          -> фон, по умолчанию #353535
 *   ui.header.border      -> "1" если нужна нижняя линия, иначе "0"
 *   ui.separator.color    -> цвет линий, по умолчанию #3C3C3C
 *
 * Шрифты: "Amatic SC" как главный для Header.
 */

function getHeaderHeight(): number {
  const v = localStorage.getItem("ui.header.height");
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 80;
}

function getHeaderBg(): string {
  return localStorage.getItem("ui.header.bg") || "#353535";
}

function getHeaderBorder(): boolean {
  return (localStorage.getItem("ui.header.border") || "0") === "1";
}

function getSeparatorColor(): string {
  return localStorage.getItem("ui.separator.color") || "#3C3C3C";
}

function two(n: number) {
  return String(n).padStart(2, "0");
}

const WEEKDAYS_RU = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];

function formatDateTime(d: Date) {
  // Пример: "4 ноября 2025 · ВТ · 20:22"
  const day = d.getDate();
  const monthLong = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(d);
  const year = d.getFullYear();
  const wd = WEEKDAYS_RU[d.getDay()];
  const hh = two(d.getHours());
  const mm = two(d.getMinutes());
  return `${day} ${monthLong} ${year} · ${wd} · ${hh}:${mm}`;
}

type HeaderBarProps = {
  sectionGroup?: string;  // Головной раздел, например "ПАНЕЛЬ"
  sectionItem?: string;   // Вложенный, например "DASHBOARD"
  userName?: string;      // Имя пользователя (по умолчанию Master)
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  sectionGroup = "ПАНЕЛЬ",
  sectionItem = "DASHBOARD",
  userName = "Master",
}) => {
  const [now, setNow] = useState<Date>(new Date());

  // таймер часов
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const headerHeight = useMemo(getHeaderHeight, []);
  const headerBg = useMemo(getHeaderBg, []);
  const showBorder = useMemo(getHeaderBorder, []);
  const sepColor = useMemo(getSeparatorColor, []);

  const rootStyle: React.CSSProperties = {
    height: headerHeight,
    background: headerBg,
    borderBottom: showBorder ? `1px solid ${sepColor}` : "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    width: "100%",            // В пределах основной (правой) колонки
    fontFamily: `"Amatic SC", "Playpen Sans", system-ui, -apple-system, "Segoe UI", Roboto, Arial`,
    color: "#E5E5E5",
    letterSpacing: "0.06em",
  };

  const leftClusterStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  };

  const midTitleStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 700,
    fontSize: 26,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const rightClusterStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 16,
  };

  const iconButton: React.CSSProperties = {
    cursor: "pointer",
    userSelect: "none",
    height: 36,
    width: 36,
    display: "grid",
    placeItems: "center",
    borderRadius: 8,
    border: "1px solid transparent",
  };

  const metaText: React.CSSProperties = {
    fontWeight: 700,
    fontSize: 24,
  };

  return (
    <div className="headerBar" data-slot="header" style={rootStyle}>
      {/* Левый кластер: Back + Refresh + текущий раздел */}
      <div style={leftClusterStyle}>
        {/* Back — простой символ-стрелка, чтобы не тянуть лишние пакеты */}
        <div
          role="button"
          title="Назад"
          style={iconButton}
          onClick={() => window.history.length > 1 && window.history.back()}
        >
          {/* Символ стрелки влево */}
          <span style={{ fontSize: 22, lineHeight: 1, color: "#E5E5E5" }}>←</span>
        </div>

        {/* Refresh — брендовая иконка */}
        <div
          role="button"
          title="Обновить"
          style={iconButton}
          onClick={() => window.location.reload()}
        >
          <img
            src="/brand/refresh.svg"
            alt="refresh"
            style={{ height: 20, width: 20, display: "block", filter: "invert(90%)" }}
          />
        </div>

        {/* Текущий раздел */}
        <div style={midTitleStyle} aria-label="current-section">
          <span>{sectionGroup}</span>
          <span>·</span>
          <span>{sectionItem}</span>
        </div>
      </div>

      {/* Правый кластер: пользователь · DB · дата/время */}
      <div style={rightClusterStyle}>
        {/* Пользователь */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src="/brand/account.svg"
            alt="user"
            style={{ height: 22, width: 22, display: "block", filter: "invert(90%)" }}
          />
          <span style={{ ...metaText }}>{userName}</span>
        </div>

        {/* DB online (только иконка) */}
        <img
          src="/brand/base_online.svg"
          alt="db"
          title="DB online"
          style={{ height: 22, width: 22, display: "block", filter: "invert(90%)" }}
        />

        {/* Дата/время */}
        <div style={metaText}>{formatDateTime(now)}</div>
      </div>
    </div>
  );
};

export default HeaderBar;
