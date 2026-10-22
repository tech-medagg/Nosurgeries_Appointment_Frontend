import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getMeApi,
  loginApi,
} from "../services/auth.api";

import type {
  AuthUser,
  LoginRequest,
} from "../types/auth.types";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (
    credentials: LoginRequest
  ) => Promise<void>;

  setAuthSession: (
    token: string,
    user: AuthUser
  ) => void;

  updateUser: (
    partial: Partial<AuthUser>
  ) => void;

  logout: () => void;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

interface AuthProviderProps {
  children: ReactNode;
}

const ACCESS_TOKEN_KEY = "accessToken";
const AUTH_USER_KEY = "authUser";

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] =
    useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(
      ACCESS_TOKEN_KEY
    );

    localStorage.removeItem(
      AUTH_USER_KEY
    );

    setAccessToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((partialUser: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partialUser };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const response =
        await loginApi(credentials);

      if (!response.success) {
        throw new Error(
          response.message ||
            "Login failed"
        );
      }

      const token =
        response.data.accessToken;

      const loginUser =
        response.data.user;

      const normalizedUser: AuthUser = {
        id: loginUser.id,
        roleId: loginUser.roleId,
        roleName: loginUser.roleName,
        email: loginUser.email,
        fullName: loginUser.fullName,
        mobile: loginUser.mobile,
        status: loginUser.status,
        isEmailVerified:
          loginUser.isEmailVerified,
        isMobileVerified:
          loginUser.isMobileVerified,
        lastLogin:
          loginUser.lastLogin,
        createdAt:
          loginUser.createdAt,
        updatedAt:
          loginUser.updatedAt,
      };

      localStorage.setItem(
        ACCESS_TOKEN_KEY,
        token
      );

      localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify(
          normalizedUser
        )
      );

      setAccessToken(token);
      setUser(normalizedUser);
    },
    []
  );

  const setAuthSession = useCallback(
    (token: string, sessionUser: AuthUser) => {
      localStorage.setItem(
        ACCESS_TOKEN_KEY,
        token
      );
      localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify(sessionUser)
      );
      setAccessToken(token);
      setUser(sessionUser);
    },
    []
  );

  useEffect(() => {
    const restoreSession =
      async () => {
        const storedToken =
          localStorage.getItem(
            ACCESS_TOKEN_KEY
          );

        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        setAccessToken(
          storedToken
        );

        try {
          const response =
            await getMeApi();

          if (!response.success) {
            throw new Error(
              "Session validation failed"
            );
          }

          const me =
            response.data;

          let cachedUser: Partial<AuthUser> = {};
          try {
            const raw = localStorage.getItem(AUTH_USER_KEY);
            if (raw) cachedUser = JSON.parse(raw);
          } catch {
            // ignore
          }

          const normalizedUser: AuthUser =
            {
              ...cachedUser,
              id: me.userId || me.id || cachedUser.id || "",
              roleId: me.roleId || cachedUser.roleId || "",
              roleName: me.roleName || cachedUser.roleName || "",
              email: me.email || cachedUser.email || "",
              fullName: me.fullName || cachedUser.fullName || "",
              mobile: me.mobile || cachedUser.mobile || "",
              status: me.status || cachedUser.status,
              isEmailVerified:
                me.isEmailVerified ?? cachedUser.isEmailVerified,
              isMobileVerified:
                me.isMobileVerified ?? cachedUser.isMobileVerified,
              lastLogin:
                me.lastLogin || cachedUser.lastLogin,
              createdAt:
                me.createdAt || cachedUser.createdAt,
              updatedAt:
                me.updatedAt || cachedUser.updatedAt,
            };

          localStorage.setItem(
            AUTH_USER_KEY,
            JSON.stringify(
              normalizedUser
            )
          );

          setUser(
            normalizedUser
          );
        } catch {
          logout();
        } finally {
          setIsLoading(false);
        }
      };

    restoreSession();
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated:
        Boolean(accessToken) &&
        Boolean(user),
      isLoading,
      login,
      setAuthSession,
      updateUser,
      logout,
    }),
    [
      user,
      accessToken,
      isLoading,
      login,
      setAuthSession,
      updateUser,
      logout,
    ]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};