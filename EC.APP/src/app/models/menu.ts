interface SubmenuItem {
  name: string;
  pageURL: string;
}

interface MenuItem {
  id: number;
  pageURL: string;
  name: string;
  submenu?: SubmenuItem[];
  isOpen?: boolean;  // 👈 optional flag to control submenu state
}