import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#eef4ff" },
          100: { value: "#dce7ff" },
          200: { value: "#c2d5ff" },
          300: { value: "#9fb9ff" },
          400: { value: "#7393ff" },
          500: { value: "#4f72f5" },
          600: { value: "#3d5fe0" },
          700: { value: "#304bb8" },
          800: { value: "#2a4193" },
          900: { value: "#25386f" },
          950: { value: "#172344" },
        },
      },
    },

    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: {
            value: {
              base: "#f6f8fb",
              _dark: "#0b1220",
            },
          },
          panel: {
            value: {
              base: "#ffffff",
              _dark: "#0f172a",
            },
          },
          subtle: {
            value: {
              base: "#f2f5f9",
              _dark: "#111b2f",
            },
          },
          muted: {
            value: {
              base: "#e8edf5",
              _dark: "#16223a",
            },
          },
          hover: {
            value: {
              base: "#eaf1ff",
              _dark: "#1a2744",
            },
          },
          selected: {
            value: {
              base: "#eef4ff",
              _dark: "#13223c",
            },
          },
          accent: {
            value: {
              base: "{colors.brand.50}",
              _dark: "{colors.brand.950}",
            },
          },
        },

        border: {
          DEFAULT: {
            value: {
              base: "#d7e0eb",
              _dark: "#22314b",
            },
          },
          muted: {
            value: {
              base: "#e8eef5",
              _dark: "#1a2740",
            },
          },
          emphasized: {
            value: {
              base: "#c5d1df",
              _dark: "#314764",
            },
          },
          strong: {
            value: {
              base: "#a6b8ca",
              _dark: "#49627f",
            },
          },
        },

        fg: {
          DEFAULT: {
            value: {
              base: "#0f172a",
              _dark: "#e8eefc",
            },
          },
          subtle: {
            value: {
              base: "#334155",
              _dark: "#bfd0ea",
            },
          },
          muted: {
            value: {
              base: "#64748b",
              _dark: "#8ea4c2",
            },
          },
          accent: {
            value: {
              base: "{colors.brand.700}",
              _dark: "{colors.brand.300}",
            },
          },
        },

        brand: {
          solid: {
            value: {
              base: "{colors.brand.600}",
              _dark: "{colors.brand.500}",
            },
          },
          contrast: { value: "#ffffff" },
          fg: {
            value: {
              base: "{colors.brand.700}",
              _dark: "{colors.brand.300}",
            },
          },
          muted: {
            value: {
              base: "{colors.brand.100}",
              _dark: "{colors.brand.900}",
            },
          },
          subtle: {
            value: {
              base: "{colors.brand.50}",
              _dark: "{colors.brand.950}",
            },
          },
          emphasized: {
            value: {
              base: "{colors.brand.200}",
              _dark: "{colors.brand.800}",
            },
          },
          focusRing: {
            value: "{colors.brand.500}",
          },
        },

        status: {
          success: {
            value: {
              base: "{colors.green.600}",
              _dark: "{colors.green.400}",
            },
          },
          warning: {
            value: {
              base: "{colors.orange.600}",
              _dark: "{colors.orange.300}",
            },
          },
          danger: {
            value: {
              base: "{colors.red.600}",
              _dark: "{colors.red.400}",
            },
          },
          info: {
            value: {
              base: "{colors.blue.600}",
              _dark: "{colors.blue.300}",
            },
          },
          neutral: {
            value: {
              base: "{colors.gray.600}",
              _dark: "{colors.gray.400}",
            },
          },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
