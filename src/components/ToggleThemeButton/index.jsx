import { IconButton, Tooltip } from "@mui/material";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";
import { useTheme } from "@mui/material/styles";
import { useThemeMode } from "../../contexts/ThemeModeContext";

const ToggleThemeButton = () => {
  const theme = useTheme();
  const { toggleTheme } = useThemeMode();

  return (
    <Tooltip title="Alternar tema">
      <IconButton onClick={toggleTheme} sx={{ ml: 1 }}>
        {theme.palette.mode === "dark" ? (
          <BsSunFill />
        ) : (
          <BsMoonStarsFill />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ToggleThemeButton;
