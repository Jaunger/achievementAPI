/**
 * ResponsePage
 * Displays a confirmation page after successfully creating an achievement list.
 * Shows the API key and allows the user to copy it or create another list.
 */

import React, { useEffect, useState } from 'react';
import {
  Heading,
  VStack,
  HStack,
  Button,
  IconButton,
  useClipboard,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import Text from '../components/customText';
import Box from '../components/customBox';

function ResponsePage() {
  const router = useRouter();
  const toast = useToast();
  const { apiKey } = router.query; // Extract apiKey from query parameters
  const { hasCopied, onCopy } = useClipboard(apiKey || '');

  useEffect(() => {
    if (hasCopied) {
      toast({
        title: 'Copied!',
        description: 'API Key has been copied to your clipboard.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [hasCopied, toast]);

  // Handle cases where apiKey might not be present
  if (!apiKey) {
    return (
      <Box minH="100vh" p={8} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4} bg={useColorModeValue('white', 'gray.700')} p={8} borderRadius="md" shadow="md">
          <Heading color="red.500">API Key Missing</Heading>
          <Text>The API Key was not found in the URL. Please try creating the list again.</Text>
          <Button colorScheme="blue" onClick={() => router.push('/create-list')}>
            Go Back to Create List
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" p={8} display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={6} bg={useColorModeValue('white', 'gray.700')} p={8} borderRadius="md" shadow="md" w="full" maxW="md">
        <Heading color="green.500">Success!</Heading>
        <Text>Your Achievement List has been created successfully.</Text>
        <Box w="100%">
          <Text fontWeight="semibold" mb={2}>
            Your API Key:
          </Text>
          <HStack>
            <Box bg={useColorModeValue('gray.100', 'gray.600')} p={3} borderRadius="md" wordBreak="break-all" flex="1">
              {apiKey}
            </Box>
            <IconButton
              icon={<CopyIcon />}
              aria-label="Copy API Key"
              onClick={onCopy}
              colorScheme={hasCopied ? 'green' : 'gray'}
            />
          </HStack>
        </Box>
        <Text fontSize="sm" color="gray.500">
          Please save this API Key securely. You will need it to access your Achievement List.
        </Text>
        <Button colorScheme="blue" onClick={() => router.push('/create-list')}>
          Create Another List
        </Button>
      </VStack>
    </Box>
  );
}

export default ResponsePage;