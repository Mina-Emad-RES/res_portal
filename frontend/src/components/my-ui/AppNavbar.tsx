import {
  Box,
  Flex,
  HStack,
  IconButton,
  Menu,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

export const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box
      as="nav"
      bg="bg.panel"
      borderBottom="1px solid"
      borderColor="border"
      boxShadow="sm"
    >
      <Flex
        align="center"
        justify="space-between"
        maxW="7xl"
        mx="auto"
        px={{ base: 4, md: 6 }}
        py={4}
      >
        <Box
          cursor="pointer"
          onClick={() => navigate("/")}
          _hover={{ opacity: 0.9 }}
          transition="opacity 0.2s ease"
        >
          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
            letterSpacing="-0.02em"
          >
            <Text as="span" color="brand.solid">
              RES
            </Text>
            <Text as="span" color="fg">
              -VA
            </Text>
          </Text>
        </Box>

        <HStack gap={3}>
          {user && (
            <VStack align="end" gap={0} display={{ base: "none", md: "flex" }}>
              <Text fontSize="sm" fontWeight="medium" color="fg">
                {user.username}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {user.role}
              </Text>
            </VStack>
          )}

          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton
                aria-label="User menu"
                variant="outline"
                rounded="full"
                borderColor="border"
                bg="bg.subtle"
                color="fg"
                _hover={{
                  bg: "bg.hover",
                  borderColor: "border.emphasized",
                }}
                _expanded={{
                  bg: "brand.subtle",
                  color: "brand.fg",
                  borderColor: "brand.emphasized",
                }}
              >
                <ChevronDown size={18} />
              </IconButton>
            </Menu.Trigger>

            <Portal>
              <Menu.Positioner>
                <Menu.Content
                  minW="220px"
                  p="1"
                  rounded="xl"
                  borderWidth="1px"
                  borderColor="border.emphasized"
                  bg="bg.panel"
                  shadow="lg"
                >
                  {user?.role === "ADMIN" && (
                    <>
                      <Menu.Item
                        cursor="pointer"
                        rounded="lg"
                        value="admin-panel"
                        _hover={{ bg: "bg.hover" }}
                        onClick={() => navigate("/admin")}
                      >
                        Admin Panel
                      </Menu.Item>

                      <Menu.Item
                        cursor="pointer"
                        rounded="lg"
                        value="client-view"
                        _hover={{ bg: "bg.hover" }}
                        onClick={() => navigate("/home")}
                      >
                        Client View
                      </Menu.Item>

                      <Box h="1px" bg="border.muted" my="1" mx="1" />
                    </>
                  )}

                  <Menu.Item
                    cursor="pointer"
                    rounded="lg"
                    value="logout"
                    _hover={{ bg: "bg.hover" }}
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </HStack>
      </Flex>
    </Box>
  );
};
