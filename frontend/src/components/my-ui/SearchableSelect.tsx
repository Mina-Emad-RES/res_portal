"use client";

import { Combobox, useFilter, useListCollection } from "@chakra-ui/react";
import { useEffect } from "react";

export type SearchableSelectOption = {
  label: string;
  value: string;
};

type Props = {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  size?: "xs" | "sm" | "md" | "lg";
  disabled?: boolean;
};

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Search...",
  emptyText = "No matches",
  size = "sm",
  disabled = false,
}: Props) => {
  const { contains } = useFilter({ sensitivity: "base" });

  const { collection, filter, set, reset } = useListCollection({
    initialItems: options,
    filter: contains,
  });

  // Keep the underlying collection in sync when the options prop changes
  // (e.g. async-loaded dropdown values or filter dropdowns refreshing).
  useEffect(() => {
    set(options);
  }, [options, set]);

  // When the controlled value is cleared externally (e.g. "Clear all"
  // filters), make sure the visible filter input also resets.
  useEffect(() => {
    if (!value) reset();
  }, [value, reset]);

  return (
    <Combobox.Root
      collection={collection}
      value={value ? [value] : []}
      openOnClick
      size={size}
      disabled={disabled}
      positioning={{ strategy: "fixed", hideWhenDetached: true }}
      onInputValueChange={(details) => filter(details.inputValue)}
      onValueChange={(details) => {
        reset();
        onChange(details.value[0] ?? "");
      }}
    >
      <Combobox.Control>
        <Combobox.Input
          placeholder={placeholder}
          autoComplete="off"
          rounded="lg"
          bg="bg.subtle"
          borderWidth="1px"
          borderColor="border"
          transition="background 0.2s ease, border-color 0.2s ease"
          _hover={{
            bg: "bg.hover",
            borderColor: "border.emphasized",
          }}
          _focusVisible={{
            borderColor: "brand.solid",
            boxShadow: "0 0 0 1px var(--chakra-colors-brand-solid)",
          }}
        />

        <Combobox.IndicatorGroup color="fg.muted" pe="2">
          <Combobox.ClearTrigger />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>

      <Combobox.Positioner>
        <Combobox.Content
          rounded="xl"
          bg="bg.panel"
          borderColor="border.emphasized"
          shadow="lg"
          maxH="280px"
          overflowY="auto"
        >
          <Combobox.Empty px={3} py={2} color="fg.muted">
            {emptyText}
          </Combobox.Empty>

          {collection.items.map((item) => (
            <Combobox.Item key={item.value} item={item}>
              {item.label}
            </Combobox.Item>
          ))}
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  );
};

export default SearchableSelect;
