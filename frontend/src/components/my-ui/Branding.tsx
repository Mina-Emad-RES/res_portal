import { Center, Heading, Text } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";

export const Branding = () => {
  return (
    <Center flexDirection="column" pt={40} mb={4} gap={6}>
      <Heading fontSize="6xl">
        <Text as="span" color="blue.500">
          RES
        </Text>
        <Text as="span">-VA</Text>
      </Heading>
      <Text fontSize="2xl" color={useColorModeValue("gray.600", "gray.400")}>
        Quality Records App
      </Text>
    </Center>
  );
};
