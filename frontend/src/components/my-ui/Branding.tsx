import { Center, Image } from "@chakra-ui/react";

export const Branding = () => {
  return (
    <Center flexDirection="column" pt={20} mb={4} gap={6}>
      <Image
        src="/logo-color.png"
        alt="RES-VA Logo"
        maxW={{ base: "160px", md: "220px" }}
        objectFit="contain"
      />
    </Center>
  );
};
