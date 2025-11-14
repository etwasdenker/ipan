export interface CarcassColors {
  headerBg: string;
  bodyBg: string;
  line: string;
}

export interface CarcassConfig {
  leftWidth: number;         // px
  rightWidth?: number;       // px (опционально)
  headerHeight: number;      // px
  showLeftDivider: boolean;
  showHeaderDivider: boolean;
  colors: CarcassColors;
}
