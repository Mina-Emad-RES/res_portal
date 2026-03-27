import { Box } from "@chakra-ui/react";
import { AppNavbar } from "../my-ui/AppNavbar";
import type { ReactNode } from "react";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <AppNavbar />
      <Box as="main" p={6}>
        {children}
      </Box>
    </>
  );
};
