// pages/create-list/response.js
import React from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  useToast,
  IconButton,
  Tooltip,
  HStack,
} from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import { copyToClipboard } from '../utils/helper';
import NextLink from 'next/link';

function ResponsePage() {
  const router = useRouter();
  const { apiKey } = router.query;
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await copyToClipboard(apiKey);
      toast({
        title: 'Copied!',
        description: 'API Key copied to clipboard.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy API Key.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!apiKey) {
    return (
      <Box bg="gray.50" minH="100vh" p={8}>
        <VStack spacing={4} align="center" mt={20}>
          <Heading>No API Key Found</Heading>
          <Text>Please create a list first.</Text>
          <NextLink href="/create-list" passHref>
            <Button as="a" colorScheme="blue">
              Go to Create List
            </Button>
          </NextLink>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh" p={8}>
      <VStack
        maxW="md"
        mx="auto"
        bg="white"
        p={8}
        shadow="md"
        borderRadius="md"
        spacing={6}
      >
        <Heading color="green.500">List Created Successfully!</Heading>
        <Text>
          Below is your API Key. Keep it safe and secure as it allows access to your
          achievement list.
        </Text>
        <Box w="100%" p={4} border="1px solid" borderColor="gray.200" borderRadius="md" bg="gray.100">
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">API Key:</Text>
            <HStack>
              <Text>{apiKey}</Text>
              <Tooltip label="Copy API Key" aria-label="Copy API Key Tooltip">
                <IconButton
                  icon={<CopyIcon />}
                  onClick={handleCopy}
                  size="sm"
                  aria-label="Copy API Key"
                  variant="ghost"
                />
              </Tooltip>
            </HStack>
          </VStack>
        </Box>
        <NextLink href="/portal" passHref>
          <Button as="a" colorScheme="blue">
            Go to Portal
          </Button>
        </NextLink>
        <NextLink href="/" passHref>
          <Button as="a" variant="outline">
            Go to Home
          </Button>
        </NextLink>
      </VStack>
    </Box>
  );
}

export default ResponsePage;