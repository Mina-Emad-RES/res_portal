"use client";

import { Box, Heading, Text, VStack } from "@chakra-ui/react";

type EmptyMessageProps = {
  title: string;
  description: string;
};

export default function EmptyMessage({
  title,
  description,
}: EmptyMessageProps) {
  return (
    <Box
      rounded="xl"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="border.emphasized"
      bg="bg.subtle"
      px={{ base: 4, md: 6 }}
      py={{ base: 8, md: 10 }}
    >
      <VStack gap={2} textAlign="center">
        <Heading size="md">{title}</Heading>
        <Text color="fg.muted" maxW="lg">
          {description}
        </Text>
      </VStack>
    </Box>
  );
}
