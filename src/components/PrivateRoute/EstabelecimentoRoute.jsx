import { Navigate, useLocation } from "react-router-dom";
import { authSession } from "../../service/AuthSession";

const EstabelecimentoRoute = ({ children }) => {
  const location = useLocation();

  if (!authSession.isEstabelecimentoAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ accountType: "estabelecimento", from: location.pathname }}
      />
    );
  }

  return children;
};

export default EstabelecimentoRoute;
