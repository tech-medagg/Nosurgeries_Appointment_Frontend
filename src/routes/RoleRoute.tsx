import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

interface RoleRouteProps {
  allowedRoles: string[];
}

const RoleRoute = ({
  allowedRoles,
}: RoleRouteProps) => {
  const { user } =
    useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const hasPermission =
    allowedRoles.includes(
      user.roleName
    );

  if (!hasPermission) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return <Outlet />;
};

export default RoleRoute;