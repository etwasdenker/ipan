import * as React from "react";

export type RegistryItem = {
  id: string;
  title: string;
  subtitle?: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
};

export const registry: RegistryItem[] = [
  {
    id: "carcass-v1",
    title: "Carcass V1",
    subtitle: "HTML preview",
    component: React.lazy(() => import("./prototypes/carcass/v1/CarcassPreview.play")),
  },
  {
    id: "menu-v1",
    title: "Menu V1",
    component: React.lazy(() => import("./prototypes/menu/v1/Menu.play")),
  },
];
