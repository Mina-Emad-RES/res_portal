import { Input } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import type { InputProps } from "@chakra-ui/react";

interface InputFieldProps extends InputProps {
  label: string;
  isInvalid?: boolean;
}

export const InputField = ({ label, isInvalid, ...props }: InputFieldProps) => (
  <FormControl isInvalid={isInvalid}>
    <FormLabel>{label}</FormLabel>
    <Input {...props} />
  </FormControl>
);
