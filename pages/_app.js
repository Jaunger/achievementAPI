// pages/_app.js
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Head from "next/head";
import NavBar from '../components/NavBar';

// Optional: Customize your Chakra theme
const theme = extendTheme({
  // Example customization
  colors: {
    brand: {
      500: "#1a202c", // Adjust the color as needed
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>Achievement Dev Portal</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <NavBar />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;