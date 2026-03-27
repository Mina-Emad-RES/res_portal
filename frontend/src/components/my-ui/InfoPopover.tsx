import { Box, IconButton, Popover, Portal, Text } from "@chakra-ui/react";
import { Info } from "lucide-react";

interface InfoPopoverProps {
  content: string;
}

const InfoPopover = ({ content }: InfoPopoverProps) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <IconButton
          aria-label="info"
          size="xs"
          variant="ghost"
          rounded="full"
          color="fg.muted"
          _hover={{ bg: "bg.subtle", color: "brand.fg" }}
          _expanded={{ bg: "brand.subtle", color: "brand.fg" }}
        >
          <Info size={14} />
        </IconButton>
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content
            maxW="md"
            w="full"
            maxH="600px"
            overflowY="auto"
            rounded="xl"
            borderWidth="1px"
            borderColor="border.emphasized"
            bg="bg.panel"
            shadow="lg"
            p={0}
          >
            <Popover.Arrow />
            <Box px={4} py={3}>
              <Text
                fontSize="sm"
                color="fg.muted"
                lineHeight="tall"
                whiteSpace="pre-wrap"
              >
                {content}
              </Text>
            </Box>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default InfoPopover;
