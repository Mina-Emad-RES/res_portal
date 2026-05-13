import { Box, Flex, HStack, Image, Menu, Portal, Text } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAuth } from "../../context/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

export const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminOrClient = user?.role === "ADMIN" || user?.role === "CLIENT";

  const navLinks = isAdminOrClient
    ? [
        ...(user?.role === "ADMIN"
          ? [{ label: "Home", path: "/dashboard" }]
          : []),
        { label: "Reports", path: "/reports" },
        { label: "Campaign", path: "/campaign" },
      ]
    : [];

  // Remember the most recent search params per route, so re-clicking a nav
  // link returns the user to their last view on that page.
  const lastParamsRef = useRef<Record<string, string>>({});
  // Track the previous pathname so we can tell whether an empty-search URL
  // is a fresh arrival on the page (don't clear) or an in-place clear (do).
  const prevPathRef = useRef<string>(location.pathname);

  useEffect(() => {
    const samePage = prevPathRef.current === location.pathname;

    if (location.search) {
      // User is on a page with params — remember them.
      lastParamsRef.current[location.pathname] = location.search;
    } else if (samePage) {
      // URL just went from having params to none on the same page — that's
      // an explicit clear (e.g. "Clear all" button). Forget the stored value.
      delete lastParamsRef.current[location.pathname];
    }
    // else: fresh arrival on this page with no params — leave the ref alone
    // so the next nav-link click can still restore the last meaningful state.

    prevPathRef.current = location.pathname;
  }, [location.pathname, location.search]);

  const goTo = (path: string) => {
    if (path === location.pathname) return;
    const stored = lastParamsRef.current[path];
    navigate(stored ? `${path}${stored}` : path);
  };

  return (
    <Box as="nav" bg="bg.panel" borderBottom="1px solid" borderColor="border">
      <Flex
        align="center"
        justify="space-between"
        position="relative"
        maxW="7xl"
        mx="auto"
        px={{ base: 4, md: 8 }}
        h="82px"
      >
        {/* Logo */}
        <Box
          cursor="pointer"
          onClick={() => navigate("/")}
          _hover={{ opacity: 0.7 }}
          transition="opacity 0.2s ease"
          zIndex={1}
        >
          <Image
            src="/logo-color.png"
            alt="RES-VA Logo"
            maxW={{ base: "70px", md: "90px" }}
            objectFit="contain"
          />
        </Box>

        {/* Nav links — absolutely centered */}
        {navLinks.length > 0 && (
          <HStack
            gap={2}
            display={{ base: "none", md: "flex" }}
            position="absolute"
            left="50%"
            transform="translateX(-50%)"
          >
            {navLinks.map(({ label, path }) => {
              const isActive = location.pathname === path;
              return (
                <Box
                  key={path}
                  as="button"
                  position="relative"
                  px={4}
                  py={2}
                  fontSize="md"
                  fontWeight={isActive ? "medium" : "normal"}
                  color={isActive ? "brand.fg" : "fg.muted"}
                  bg={isActive ? "brand.subtle" : "transparent"}
                  rounded="lg"
                  cursor="pointer"
                  _hover={{ color: "fg", bg: "bg.hover" }}
                  transition="all 0.15s ease"
                  onClick={() => goTo(path)}
                  _after={
                    isActive
                      ? {
                          content: '""',
                          position: "absolute",
                          bottom: "0px",
                          left: "16px",
                          right: "16px",
                          height: "2px",
                          bg: "brand.solid",
                          borderRadius: "1px 1px 0 0",
                        }
                      : undefined
                  }
                >
                  {label}
                </Box>
              );
            })}
          </HStack>
        )}

        {/* Right — unified user pill */}
        <Box zIndex={1}>
          <Menu.Root>
            <Menu.Trigger asChild>
              <Flex
                as="button"
                align="center"
                gap={3}
                pl={1.5}
                pr={4}
                py={1.5}
                rounded="full"
                borderWidth="1px"
                borderColor="border"
                bg="bg.subtle"
                cursor="pointer"
                _hover={{ bg: "bg.hover", borderColor: "border.emphasized" }}
                _expanded={{
                  bg: "brand.subtle",
                  borderColor: "brand.emphasized",
                }}
                transition="all 0.15s ease"
              >
                {/* Avatar */}
                <Flex
                  w="34px"
                  h="34px"
                  rounded="full"
                  bg="brand.subtle"
                  color="brand.fg"
                  align="center"
                  justify="center"
                  fontSize="sm"
                  fontWeight="medium"
                  flexShrink={0}
                >
                  {user?.username?.slice(0, 2).toUpperCase() ?? "??"}
                </Flex>

                {/* Name + role */}
                <Box display={{ base: "none", md: "block" }} textAlign="left">
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="fg"
                    lineHeight="1.3"
                  >
                    {user?.username}
                  </Text>
                  <Text
                    fontSize="xs"
                    color="fg.muted"
                    lineHeight="1.3"
                    textTransform="capitalize"
                  >
                    {user?.role?.toLowerCase()}
                  </Text>
                </Box>

                <ChevronDown size={16} />
              </Flex>
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
                  {/* Mobile-only nav links */}
                  {navLinks.length > 0 && (
                    <>
                      {navLinks.map(({ label, path }) => (
                        <Menu.Item
                          key={path}
                          cursor="pointer"
                          rounded="lg"
                          value={label.toLowerCase()}
                          _hover={{ bg: "bg.hover" }}
                          onClick={() => goTo(path)}
                          display={{ base: "flex", md: "none" }}
                        >
                          {label}
                        </Menu.Item>
                      ))}
                      <Box
                        h="1px"
                        bg="border.muted"
                        my="1"
                        mx="1"
                        display={{ base: "block", md: "none" }}
                      />
                    </>
                  )}

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

                      <Box h="1px" bg="border.muted" my="1" mx="1" />
                    </>
                  )}

                  <Menu.Item
                    cursor="pointer"
                    rounded="lg"
                    value="logout"
                    color="red.500"
                    _hover={{ bg: "red.subtle" }}
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
        </Box>
      </Flex>
    </Box>
  );
};
