import { createTheme } from "@mui/material/styles";

const baseTheme = {
  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: { borderRadius: 8 },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "light",

    primary: { main: "#10B981" },
    error: { main: "#EF4444" },

    custom: {
      primaryHover: "#059669",
    },

    background: {
      default: "#F0FDF4",
      paper: "#FFFFFF",
    },

    text: {
      primary: "rgba(0,0,0,0.87)",
      secondary: "rgba(0,0,0,0.60)",
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "dark",

    primary: { main: "#10B981" },
    error: { main: "#EF4444" },

    custom: {
      primaryHover: "#34D399",
    },

    background: {
      default: "#020617",
      paper: "#020617",
    },

    text: {
      primary: "#F8FAFC",
      secondary: "#CBD5E1",
    },
  },
});
