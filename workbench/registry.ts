import * as React from "react";

export type RegistryItem = {
  id: string;
  title: string;
  subtitle?: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
};

export const registry: RegistryItem[] = [
  // 1) Старый каркас (HTML preview) — как было
  {
    id: "carcass-v1",
    title: "Carcass V1",
    subtitle: "HTML preview",
    component: React.lazy(() => import("./prototypes/carcass/v1/CarcassPreview.play")),
  },

  // 2) Старое меню — как было
  {
    id: "menu-v1",
    title: "Menu V1",
    component: React.lazy(() => import("./prototypes/menu/v1/Menu.play")),
  },

  // 3) НОВОЕ: Main Carcass V1 (React-оболочка)
  {
    id: "main_carcass-v1",
    title: "Main Carcass V1",
    subtitle: "React shell using tokens",
    component: React.lazy(() => import("./prototypes/main_carcass/v1/Carcass.play")),
  },

  // 4) НОВОЕ: Main Menu V1 (новое меню)
  {
    id: "main_menu-v1",
    title: "Main Menu V1",
    component: React.lazy(() => import("./prototypes/main_menu/v1/Menu.play")),
  },
];
