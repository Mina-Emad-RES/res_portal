"use client";

import { Box, Card, Flex, Heading, Text } from "@chakra-ui/react";

type CampaignsHeroProps = {
  campaignName: string;
};

export default function CampaignsHero({ campaignName }: CampaignsHeroProps) {
  return (
    <Card.Root
      variant="outline"
      bg="bg.panel"
      borderColor="border"
      rounded="2xl"
      shadow="sm"
      overflow="hidden"
    >
      <Box h="1.5" bg="brand.solid" />
      <Card.Body p={{ base: 5, md: 6 }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align={{ base: "start", lg: "center" }}
          gap={5}
        >
          <Box>
            <Text fontSize="sm" fontWeight="medium" color="fg.subtle" mb={2}>
              Campaign workspace
            </Text>
            <Heading size="xl" letterSpacing="-0.02em">
              {campaignName}
            </Heading>
            <Text mt={3} color="fg.muted" maxW="3xl" lineHeight="tall">
              Monitor performance and activity within a selected date range.
            </Text>
          </Box>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
}
