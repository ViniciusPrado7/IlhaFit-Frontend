import { Navigate, useLocation } from "react-router-dom";
import { authSession } from "../../service/AuthSession";

const ProfessionalRoute = ({ children }) => {
  const location = useLocation();

  if (!authSession.isProfissionalAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ accountType: "profissional", from: location.pathname }}
      />
    );
  }

  return children;
};

export default ProfessionalRoute;
