import React, { useState } from "react";
import { Heading, Button, VStack, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Text from "../components/customText";
import Box from "../components/customBox";

/**
 * HomePage component renders the main interface for the Achievement Dev Portal.
 * It provides options to manage existing achievement lists or create new ones.
 *
 * @component
 * @returns {JSX.Element} The rendered HomePage component.
 *
 * @example
 * <HomePage />
 *
 * @function
 * @name HomePage
 *
 * @description
 * The HomePage component includes:
 * - A welcome message and description.
 * - A section to manage existing achievement lists, which navigates to the portal.
 * - A section to create new achievement lists, which navigates to the create-list page.
 * - An informational section on how to use the SDK and API key.
 *
 * @requires useRouter - Next.js router for navigation.
 * @requires useToast - Chakra UI toast for notifications.
 * @requires useState - React hook for managing state.
 * @requires Box, Heading, Text, VStack, Button - Chakra UI components for layout and styling.
 */
function HomePage() {
  const router = useRouter();
  const toast = useToast();
  const [apiKey, setApiKey] = useState();

  const handleEditList = () => {
    localStorage.setItem("apiKey", apiKey); // Store the API key for later use
    router.push("/portal");
  };

  const handleCreateList = () => {
    router.push("/create-list");
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Box maxW="3xl" mx="auto" bg="white" p={8} shadow="md" borderRadius="md">
        <Heading color="brand.500" mb={4}>
          Achievement Dev Portal
        </Heading>
        <Text fontSize="lg" mb={8}>
          Welcome! Manage or create new Achievement Lists for your game/app.
        </Text>

        <VStack align="start" spacing={6}>
          {/* Manage List Section */}
          <Box w="100%">
            <Heading as="h2" size="md" mb={2}>
              Manage Your Achievement List in the Portal
            </Heading>
            <Button colorScheme="brand" onClick={handleEditList}>
              Manage List
            </Button>
          </Box>

          {/* Create List Section */}
          <Box w="100%">
            <Heading as="h2" size="md" mb={2}>
              Create a New Achievement List
            </Heading>
            <Button colorScheme="blue" onClick={handleCreateList}>
              Go to Create Page
            </Button>
          </Box>

          {/* API Usage Section */}
          <Box w="100%">
            <Heading as="h2" size="md" mb={2}>
              API Usage
            </Heading>
            <Text fontSize="sm">
              Learn how to use the SDK and your API key:
            </Text>
            <ol style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>Initialize the SDK with your API key.</li>
              <li>Fetch or create achievements via the REST API.</li>
              <li>Use the UI here to manage or test your lists.</li>
            </ol>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

export default HomePage;
