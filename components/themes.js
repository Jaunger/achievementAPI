// theme.js (full)

import { extendTheme } from "@chakra-ui/react";


// Define custom colors
const colors = {
  brand: {
    50: "#e3f9e5",
    100: "#c1eacb",
    200: "#a3d9b1",
    300: "#7bc88e",
    400: "#57b660",
    500: "#3e8e52", // Primary color
    600: "#2d6e41",
    700: "#1c4e30",
    800: "#0a2e1f",
    900: "#00100e",
  },
  accent: {
    50: "#ffe3ec",
    100: "#ffb8d1",
    200: "#ffa1c2",
    300: "#ff7bac",
    400: "#ff589d",
    500: "#ff377f", // Accent color
    600: "#e62f6a",
    700: "#cc2856",
    800: "#b32443",
    900: "#991f2f",
  },
};

// Configure typography
const fonts = {
  heading: `'Roboto Slab', serif`,
  body: `'Inter', sans-serif`,
};

// Customize component styles
const components = {
  Button: {
    baseStyle: {
      fontWeight: "bold",
    },
    variants: {
      solid: (props) => ({
        bg: props.colorMode === "dark" ? "brand.400" : "brand.500",
        color: "white",
        _hover: {
          bg: props.colorMode === "dark" ? "brand.300" : "brand.600",
        },
      }),
      outline: (props) => ({
        borderColor: props.colorMode === "dark" ? "brand.300" : "brand.500",
        color: props.colorMode === "dark" ? "brand.300" : "brand.500",
        _hover: {
          bg: props.colorMode === "dark" ? "brand.700" : "brand.100",
        },
      }),
    },
    defaultProps: {
      size: "md",
      variant: "solid",
    },
  },
  Link: {
    baseStyle: (props) => ({
      color: props.colorMode === "dark" ? "accent.300" : "accent.500",
      _hover: {
        textDecoration: "underline",
        color: props.colorMode === "dark" ? "accent.200" : "accent.600",
      },
    }),
  },
  Input: {
    variants: {
      filled: (props) => ({
        field: {
          bg: props.colorMode === "dark" ? "gray.700" : "gray.100",
          _hover: {
            bg: props.colorMode === "dark" ? "gray.600" : "gray.200",
          },
          _focus: {
            bg: props.colorMode === "dark" ? "gray.600" : "gray.200",
            borderColor: "brand.500",
          },
        },
      }),
    },
  },
  Textarea: {
    variants: {
      filled: (props) => ({
        bg: props.colorMode === "dark" ? "gray.700" : "gray.100",
        _hover: {
          bg: props.colorMode === "dark" ? "gray.600" : "gray.200",
        },
        _focus: {
          bg: props.colorMode === "dark" ? "gray.600" : "gray.200",
          borderColor: "brand.500",
        },
      }),
    },
  },
  Checkbox: {
    baseStyle: (props) => ({
      control: {
        _checked: {
          bg: "brand.500",
          borderColor: "brand.500",
          color: "white",
        },
      },
    }),
  },
};

// Define global styles
const styles = {
  global: (props) => ({
    body: {
      bg: props.colorMode === "dark" ? "gray.800" : "gray.50",
      color: props.colorMode === "dark" ? "gray.200" : "gray.800",
      transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
    },
    a: {
      color: "accent.500",
      _hover: {
        textDecoration: "underline",
        color: "accent.600",
      },
    },
  }),
};

// Configure color mode
const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

// Extend the theme
const theme = extendTheme({
  config,
  colors,
  fonts,
  components,
  styles,
});

export default theme;