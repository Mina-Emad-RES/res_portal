import { createContext } from "react";
import type { AuthContextType } from "../types/auth";

// Only export the context here
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
