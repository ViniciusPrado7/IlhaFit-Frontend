import { createContext, useContext } from "react";

export const ThemeModeContext = createContext(null);

export const useThemeMode = () => {
  return useContext(ThemeModeContext);
};
