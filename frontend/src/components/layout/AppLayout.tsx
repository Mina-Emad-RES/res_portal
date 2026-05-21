import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { AppNavbar } from "../my-ui/AppNavbar";
import ClientTour from "../my-ui/ClientTour";

export const AppLayout = () => {
  return (
    <>
      <AppNavbar />
      <Box as="main" p={6}>
        <ClientTour />
        <Outlet />
      </Box>
    </>
  );
};
