import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface FormCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export const FormCard = ({ title, description, children }: FormCardProps) => {
  return (
    <Box w="full" maxW="md" mx="auto">
      <Box
        borderWidth="1px"
        borderColor="border"
        rounded="2xl"
        bg="bg.panel"
        boxShadow="sm"
        overflow="hidden"
      >
        <Box h="1.5" bg="brand.solid" />

        <Box p={{ base: 6, md: 8 }}>
          <VStack align="stretch" gap={title || description ? 6 : 0}>
            {(title || description) && (
              <Box>
                {title && (
                  <Heading size="xl" letterSpacing="-0.02em">
                    {title}
                  </Heading>
                )}

                {description && (
                  <Text mt={3} color="fg.muted" lineHeight="tall">
                    {description}
                  </Text>
                )}
              </Box>
            )}

            <Box>{children}</Box>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};
