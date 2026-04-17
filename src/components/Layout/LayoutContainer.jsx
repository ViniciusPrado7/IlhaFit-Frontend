import { Container } from "@mui/material";

const LayoutContainer = ({ children }) => {
  return (
    <Container
      maxWidth={false}
      sx={{
        maxWidth: "1680px",
        px: { xs: 2, sm: 3, md: 4, xl: 5 },
      }}
    >
      {children}
    </Container>
  );
};

export default LayoutContainer;
