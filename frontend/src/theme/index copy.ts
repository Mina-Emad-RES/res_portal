import { createSystem, defaultConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  theme: {
    semanticTokens: {
      colors: {
        status: {
          success: {
            value: {
              _light: "#16a34a",
              _dark: "#22c55e",
            },
          },
          warning: {
            value: {
              _light: "#d97706",
              _dark: "#fbbf24",
            },
          },
          danger: {
            value: {
              _light: "#dc2626",
              _dark: "#f87171",
            },
          },
          info: {
            value: {
              _light: "#2563eb",
              _dark: "#60a5fa",
            },
          },
          neutral: {
            value: {
              _light: "#6b7280",
              _dark: "#94a3b8",
            },
          },
        },
        bg: {
          panel: {
            value: {
              _light: "#ffff", // muted background for forms, inputs
              _dark: "#081324", // muted dark background for cards/inputs
            },
          },
          default: {
            value: {
              _light: "#f9fafb", // soft off-white instead of pure white
              _dark: "#0b1a2d", // dark blue, easy on eyes
            },
          },
          subtle: {
            value: {
              _light: "#f0f1f5", // very subtle gray for borders, table stripes, cards
              _dark: "#0f213f", // slightly lighter than default dark for separation
            },
          },
          muted: {
            value: {
              _light: "#edeff1", // muted background for forms, inputs
              _dark: "#0c1f3b", // muted dark background for cards/inputs
            },
          },
          secondary: {
            value: {
              _light: "#ffff", // muted background for forms, inputs
              _dark: "#081324", // muted dark background for cards/inputs
            },
          },
        },

        fg: {
          default: {
            value: {
              _light: "#1f2937", // dark gray instead of pure black
              _dark: "#e5e7eb", // off-white for dark mode
            },
          },
          subtle: {
            value: {
              _light: "#4b5563", // muted text for labels, secondary info
              _dark: "#cbd5e1", // subtle text in dark mode
            },
          },
          muted: {
            value: {
              _light: "#6b7280", // even lighter secondary info
              _dark: "#94a3b8", // lighter subtle text in dark mode
            },
          },
        },
      },
    },
  },
});
