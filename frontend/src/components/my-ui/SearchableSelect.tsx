"use client";

import { Combobox, useFilter, useListCollection } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

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

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const [inputValue, setInputValue] = useState("");

  // Keep the underlying collection in sync when the options prop changes
  // e.g. async-loaded dropdown values or filter dropdowns refreshing.
  useEffect(() => {
    set(options);
  }, [options, set]);

  // Keep the visible input text in sync with the controlled value.
  // This fixes refreshes where value exists before async options load.
  useEffect(() => {
    if (!value) {
      setInputValue("");
      reset();
      return;
    }

    if (selectedOption) {
      setInputValue(selectedOption.label);
      reset();
    }
  }, [value, selectedOption, reset]);

  return (
    <Combobox.Root
      collection={collection}
      value={value ? [value] : []}
      inputValue={inputValue}
      openOnClick
      size={size}
      disabled={disabled}
      positioning={{ strategy: "fixed", hideWhenDetached: true }}
      onInputValueChange={(details) => {
        setInputValue(details.inputValue);
        filter(details.inputValue);
      }}
      onValueChange={(details) => {
        const nextValue = details.value[0] ?? "";
        const nextOption =
          options.find((option) => option.value === nextValue) ?? null;

        onChange(nextValue);
        setInputValue(nextOption?.label ?? "");
        reset();
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
