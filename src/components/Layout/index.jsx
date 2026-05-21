import { Box } from "@mui/material";
import Footer from "../Footer";
import LayoutContainer from "./LayoutContainer";

const AppLayout = ({ children }) => {
  return (
    <Box sx={{ bgcolor: "background.default", flex: 1 }}>
      <Box id="app-top" sx={{ position: "relative", top: -80 }} />
      <LayoutContainer>
        <Box sx={{ pt: 14 }}>
          {children}
        </Box>
      </LayoutContainer>
      <Footer />
    </Box>
  );
};

export default AppLayout;
