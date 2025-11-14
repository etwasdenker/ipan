import React from "react";
import menu from "../../../config/app-menu.json";

type MenuItem = { id: string; label: string; icon?: string };
type MenuGroup = { title: string; items: MenuItem[] };
const groups = menu.groups as MenuGroup[];

interface Props {
  onSelect: (id: string) => void;
  collapsed: boolean;
}

export function MenuPanel({ onSelect, collapsed }: Props) {
  return (
    <div style={{ height: "100%", color: "#E5E5E5", fontFamily: "'Amatic SC', cursive" }}>
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        {/* логотипы */}
        {!collapsed && <img src="/brand/logo_ipan_word.svg" height={22} alt="iPan" />}
      </div>

      <div style={{ padding: "4px 0", overflowY: "auto", height: "calc(100% - 42px)" }}>
        {groups.map((g) => (
          <div key={g.title} style={{ margin: "8px 8px 12px" }}>
            {!collapsed && (
              <div style={{ opacity: 0.5, letterSpacing: 2, margin: "6px 6px 2px" }}>{g.title}</div>
            )}
            {g.items.map((it) => (
              <div
                key={it.id}
                onClick={() => onSelect(it.id)}
                style={{
                  cursor: "pointer",
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 10px"
                }}
              >
                {/* здесь могут быть твои SVG-иконки */}
                <span style={{ width: 24, textAlign: "center" }}>▣</span>
                {!collapsed && <span style={{ fontSize: 22 }}>{it.label.toUpperCase()}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
