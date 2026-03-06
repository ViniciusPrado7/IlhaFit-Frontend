import { Box } from "@mui/material";
import LayoutContainer from "./LayoutContainer";

const AppLayout = ({ children }) => {
  return (
    <Box sx={{ bgcolor: "background.default", flex: 1 }}>
      <LayoutContainer>
        <Box sx={{ pt: 14 }}>
          {children}
        </Box>
      </LayoutContainer>
    </Box>
  );
};

export default AppLayout;
