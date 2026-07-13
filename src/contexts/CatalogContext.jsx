import { createContext, useContext } from "react";

export const CatalogContext = createContext(null);

export const useCatalog = () => {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error("useCatalog deve ser usado dentro de um CatalogProvider");
  }
  return ctx;
};
