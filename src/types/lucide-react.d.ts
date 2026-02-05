declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';

  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }

  export type Icon = FC<IconProps>;

  // 사용하는 아이콘들
  export const ArrowLeft: Icon;
  export const LayoutDashboard: Icon;
  export const Users: Icon;
  export const User: Icon;
  export const Shield: Icon;
  export const Settings: Icon;
  export const LogOut: Icon;
  export const ChevronDown: Icon;
  export const ChevronRight: Icon;
  export const Zap: Icon;
  export const ToggleLeft: Icon;
  export const ToggleRight: Icon;
  export const Search: Icon;
  export const UserPlus: Icon;
  export const MoreVertical: Icon;
  export const MoreHorizontal: Icon;
  export const Edit2: Icon;
  export const Trash2: Icon;
  export const Plus: Icon;
  export const Minus: Icon;
  export const TrendingUp: Icon;
  export const Activity: Icon;
  export const Crown: Icon;
  export const BarChart3: Icon;
  export const Image: Icon;
  export const AlertTriangle: Icon;
  export const Folder: Icon;
  export const FolderOpen: Icon;
}
