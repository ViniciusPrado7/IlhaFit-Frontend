import { Container } from "@mui/material";

const LayoutContainer = ({ children }) => {
  return (
    <Container
      maxWidth="xl"
      sx={{
        px: { xs: 2, sm: 3, md: 4 }, 
      }}
    >
      {children}
    </Container>
  );
};

export default LayoutContainer;
