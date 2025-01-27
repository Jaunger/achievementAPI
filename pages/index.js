/**
 * HomePage
 * This is the landing page of the Achievement Dev Portal.
 * It highlights the features of the API and Android SDK, and allows users to manage or create achievement lists.
 */

import React, { useState } from 'react';
import { 
  Heading, 
  Button, 
  VStack, 
  useToast,
  Text,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import Box from '../components/customBox';
import { useRouter } from 'next/router';

function HomePage() {
  const router = useRouter();
  const toast = useToast();
  const [apiKey, setApiKey] = useState('');

  const handleEditList = () => {
    // Store API Key in localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem('apiKey', apiKey);
    }
    router.push('/portal');
  };

  const handleCreateList = () => {
    router.push('/create-list');
  };

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.800')}
    minH="100vh"
    p={{ base: 4, md: 8 }}>
      <Box maxW="3xl" mx="auto" p={8} shadow="md" borderRadius="md">
        <Heading color="blue.500" mb={4}>
          Achievement Dev Portal
        </Heading>
        <Text fontSize="lg" mb={8}>
          Welcome to the Achievement Development Portal! Use this platform to create and manage
          achievement lists for your game or app. With our API and Android SDK, you can easily build
          dynamic, engaging, and trackable achievement systems for your applications.
        </Text>

        <VStack align="start" spacing={6}>
          {/* Manage List Section */}
          <Box w="100%">
            <Heading as="h2" size="md" mb={2}>
              Manage Your Achievement List
            </Heading>
            <Text mb={3}>
              Use the portal and SDK to access and manage your existing achievement lists. You can:
            </Text>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Edit achievements, including their titles, descriptions, and images.</li>
              <li>Update progress goals and visibility for specific achievements.</li>
              <li>Delete outdated or unnecessary achievements.</li>
            </ul>
            <Button colorScheme="blue" onClick={handleEditList}>
              Manage List
            </Button>
          </Box>

          {/* Create List Section */}
          <Box w="100%">
            <Heading as="h2" size="md" mb={2}>
              Create a New Achievement List
            </Heading>
            <Text mb={3}>
              Design a new achievement list for your game or app with ease. Our tools allow you to:
            </Text>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Create customizable achievements with titles, descriptions, and progress goals.</li>
              <li>Include hidden achievements to surprise and delight your players.</li>
              <li>Upload custom images to visually enhance your achievement system.</li>
            </ul>
            <Button colorScheme="teal" onClick={handleCreateList}>
              Go to Create Page
            </Button>
          </Box>

          {/* API and SDK Capabilities Section */}
          <Box w="100%">
            <Heading as="h2" size="md" mb={2}>
              API and Android SDK Capabilities
            </Heading>
            <Text fontSize="sm" mb={3}>
              Our API and SDK provide powerful features to help you integrate achievements seamlessly:
            </Text>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><strong>Achievement Management</strong>: Programmatically create, read, update, and delete achievements.</li>
              <li><strong>Real-Time Progress Tracking</strong>: Track and update progress for players effortlessly.</li>
              <li><strong>Customizability</strong>: Add titles, descriptions, visibility settings, and images to achievements.</li>
              <li><strong>Hidden Achievements</strong>: Create hidden achievements that are revealed only upon completion.</li>
              <li><strong>Player Management</strong>: Use the SDK to create or fetch player profiles and update their achievement progress.</li>
              <li><strong>Dialog Integration</strong>: Display achievements in a floating dialog with the SDK’s built-in UI components.</li>
            </ul>
            <Text mt={4}>
              Check out the developer documentation for detailed guides and examples for both the API and SDK.
            </Text>
          </Box>
          
        </VStack>

        <Divider my={8} />

        {/* Footer Section */}
        <Box textAlign="center" mt={8}>
          <Text fontSize="sm" color="gray.500">
            &copy; 2025 AchievementsSDK | Developed by Daniel Raby
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

export default HomePage;