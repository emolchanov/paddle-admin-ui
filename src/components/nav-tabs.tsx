import { memo, useEffect, useState } from "react";
import * as MUI from "@mui/material";
import * as MUIcons from "@mui/icons-material";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
  { label: "Users", icon: <MUIcons.People />, href: "/users" },
  { label: "Settings", icon: <MUIcons.Settings />, href: "/settings" },
];

function getTabIndex(path: string) {
  return MENU_ITEMS.findIndex((item) => path.startsWith(item.href));
}

export const NavTabs = memo(function NavTabs() {
  const path = usePathname();
  const [value, setValue] = useState(getTabIndex(path));

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    setValue(getTabIndex(path));
  }, [path]);

  return (
    <MUI.BottomNavigation showLabels value={value} onChange={handleChange}>
      {MENU_ITEMS.map((item, index) => (
        <MUI.BottomNavigationAction
          key={index}
          label={item.label}
          icon={item.icon}
          component={MUI.Link}
          href={item.href}
        />
      ))}
    </MUI.BottomNavigation>
  );
});
