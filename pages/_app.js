// pages/_app.js
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Head from "next/head";
import NavBar from "../components/NavBar";

// Example customization of Chakra's theme
const theme = extendTheme({
  colors: {
    brand: {
      500: "#1a202c", // Adjust to any color you like
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>Achievement Dev Portal</title>
        {/* Ensures the layout scales to the device width on phones */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Render a NavBar at the top (like a site header) */}
      <NavBar />

      {/* Render the main page/component */}
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;