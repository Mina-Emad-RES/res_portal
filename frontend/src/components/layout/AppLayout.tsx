import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { AppNavbar } from "../my-ui/AppNavbar";

export const AppLayout = () => {
  return (
    <>
      <AppNavbar />
      <Box as="main" p={6}>
        <Outlet />
      </Box>
    </>
  );
};
