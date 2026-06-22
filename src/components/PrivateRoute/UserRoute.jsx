import { Navigate, useLocation } from "react-router-dom";
import { authSession } from "../../service/AuthSession";

const UserRoute = ({ children }) => {
  const location = useLocation();
  const user = authSession.getUser();

  if (!(user?.tipo === "USUARIO" && authSession.getToken())) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ accountType: "aluno", from: location.pathname }}
      />
    );
  }

  return children;
};

export default UserRoute;
