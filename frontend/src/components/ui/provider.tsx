// "use client";

// import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
// import { system } from "../../theme";
// import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";

// export function Provider(props: ColorModeProviderProps) {
//   return (
//     <ChakraProvider value={system}>
//       <ColorModeProvider {...props} />
//     </ChakraProvider>
//   );
// }

"use client";

import { ChakraProvider, Box } from "@chakra-ui/react";
import { system } from "../../theme";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props}>
        <Box minH="100vh" bg="bg.default" color="fg.default">
          {props.children}
        </Box>
      </ColorModeProvider>
    </ChakraProvider>
  );
}
