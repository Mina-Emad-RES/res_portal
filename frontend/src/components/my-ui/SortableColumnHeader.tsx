"use client";

import { HStack, Table, Text } from "@chakra-ui/react";
import type { SortDir } from "../../hooks/useSortParams";

type SortableColumnHeaderProps = {
  label: string;
  columnKey: string;
  activeKey: string;
  direction: SortDir;
  onSort: (key: string) => void;
};

const SortableColumnHeader = ({
  label,
  columnKey,
  activeKey,
  direction,
  onSort,
}: SortableColumnHeaderProps) => {
  const isActive = activeKey === columnKey;

  return (
    <Table.ColumnHeader
      color="fg.subtle"
      cursor="pointer"
      userSelect="none"
      onClick={() => onSort(columnKey)}
      _hover={{ color: "fg" }}
      transition="color 0.15s ease"
      aria-sort={
        isActive ? (direction === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <HStack gap={1.5} align="center">
        <Text as="span">{label}</Text>
        <Text
          as="span"
          fontSize="xs"
          lineHeight="1"
          opacity={isActive ? 1 : 0.35}
          color={isActive ? "brand.fg" : "fg.subtle"}
          aria-hidden="true"
        >
          {isActive ? (direction === "asc" ? "▲" : "▼") : "↕"}
        </Text>
      </HStack>
    </Table.ColumnHeader>
  );
};

export default SortableColumnHeader;
