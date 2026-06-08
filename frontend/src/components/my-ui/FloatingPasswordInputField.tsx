"use client";

import type { InputProps } from "@chakra-ui/react";
import { Box, useControllableState } from "@chakra-ui/react";
import { useState } from "react";
import { PasswordInput } from "../ui/password-input";

interface FloatingPasswordInputProps extends Omit<InputProps, "type"> {
  label: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const FloatingPasswordInputField = (props: FloatingPasswordInputProps) => {
  const { label, onValueChange, value, defaultValue = "", ...rest } = props;

  const [inputState, setInputState] = useControllableState({
    defaultValue,
    onChange: onValueChange,
    value,
  });

  const [focused, setFocused] = useState(false);
  const shouldFloat = Boolean(inputState?.length) || focused;
  const isDisabled = Boolean(rest.disabled);

  const labelColor = focused
    ? "brand.fg"
    : shouldFloat
      ? "fg.subtle"
      : "fg.muted";

  const labelBg = isDisabled ? "bg.subtle" : "bg.panel";

  return (
    <Box pos="relative" w="full">
      <PasswordInput
        {...rest}
        // let InputGroup own the end padding for the eye toggle;
        // we only set the start padding so the floating label lines up
        rootProps={{ width: "full" }}
        value={inputState ?? ""}
        placeholder={shouldFloat ? rest.placeholder : ""}
        h="14"
        pt="6"
        pb="3"
        ps="4"
        rounded="xl"
        bg={isDisabled ? "bg.subtle" : "bg.panel"}
        borderWidth="1px"
        borderColor="border"
        color={isDisabled ? "fg.muted" : "fg"}
        transition="border-color 0.2s ease, box-shadow 0.2s ease"
        _hover={
          isDisabled
            ? undefined
            : {
                borderColor: "border.emphasized",
              }
        }
        _focusVisible={{
          borderColor: "brand.solid",
          boxShadow: "0 0 0 1px var(--chakra-colors-brand-solid)",
        }}
        _invalid={{
          borderColor: "status.danger",
          boxShadow: "0 0 0 1px var(--chakra-colors-status-danger)",
        }}
        _disabled={{
          opacity: 1,
          cursor: "not-allowed",
        }}
        onFocus={(e) => {
          props.onFocus?.(e);
          setFocused(true);
        }}
        onBlur={(e) => {
          props.onBlur?.(e);
          setFocused(false);
        }}
        onChange={(e) => {
          props.onChange?.(e);
          setInputState(e.target.value);
        }}
      />

      <Box
        pos="absolute"
        zIndex={1}
        px="2"
        top={shouldFloat ? "1.5" : "50%"}
        insetStart="3"
        transform={shouldFloat ? "translateY(0)" : "translateY(-50%)"}
        fontWeight={shouldFloat ? "medium" : "normal"}
        pointerEvents="none"
        transition="all 0.2s ease"
        color={labelColor}
        fontSize={shouldFloat ? "xs" : "md"}
        bg={labelBg}
        lineHeight="1"
      >
        {label}
      </Box>
    </Box>
  );
};

export default FloatingPasswordInputField;
