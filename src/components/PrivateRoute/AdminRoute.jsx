import { Navigate, useLocation } from "react-router-dom";
import { authSession } from "../../service/AuthSession";

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const user = authSession.getUser();

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default AdminRoute;
