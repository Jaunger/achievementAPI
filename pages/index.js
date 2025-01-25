// pages/index.js
import React, { useState } from 'react';
import { 
  //Box, 
  Heading, 
  //Text, 
  Button, 
  Input, 
  VStack, 
  useToast,
  HStack,
  Spacer
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Text from '../components/customText';
import Box from '../components/customBox';
function HomePage() {
  const router = useRouter();
  const toast = useToast();
  const [apiKey, setApiKey] = useState('');

  const handleEditList = () => {
    // Uncomment the following block to enable API Key validation
    /*
    if (!apiKey) {
      toast({
        title: 'API Key Missing',
        description: 'Please enter your API Key.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    */

    // Store API Key in localStorage (Note: localStorage is only available on the client-side)
    if (typeof window !== 'undefined') {
      localStorage.setItem('apiKey', apiKey);
    }

    router.push('/portal');
  };

  const handleCreateList = () => {
    router.push('/create-list');
  };

  return (
    <Box p={8} minH="100vh">
      <Box maxW="3xl" mx="auto" p={8} shadow="md" borderRadius="md">
        <Heading color="blue.500" mb={4}>
          Achievement Dev Portal
        </Heading>
        <Text fontSize="lg" mb={8}>
          Welcome! Manage or create new Achievement Lists for your game/app.
        </Text>

        <VStack align="start" spacing={6}>
          <Box w="100%">
            <Heading as="h2" size="md" mb={2}>
              Manage Your Achievement List in the Portal
            </Heading>
            {/*
            <Input
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              mb={3}
            />
            */}
            <Button colorScheme="blue" onClick={handleEditList}>
              Manage List
            </Button>
          </Box>

          <Box w="100%">
            <Heading as="h2" size="md" mb={2}>
              Create a New Achievement List
            </Heading>
            <Button colorScheme="teal" onClick={handleCreateList}>
              Go to Create Page
            </Button>
          </Box>

          <Box w="100%">
            <Heading as="h2" size="md" mb={2}>
              API Usage
            </Heading>
            <Text fontSize="sm">
              Learn how to use the SDK and your API key:
            </Text>
            <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
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