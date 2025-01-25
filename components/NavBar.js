// components/NavBar.js

import React from 'react';
import { useColorMode } from '@chakra-ui/react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Link,
  useDisclosure,
  VStack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Spacer,
  Tooltip,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  SunIcon,
  MoonIcon,
} from '@chakra-ui/icons';
import ChakraNextLink from './ChakraNextLink'; // Import the custom link component

const Links = [
  { name: 'Home', path: '/' },
  { name: 'Create List', path: '/create-list' },
  { name: 'Portal', path: '/portal' },
];

export default function NavBar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box bg={colorMode === 'light' ? 'gray.100' : 'gray.900'} px={4} boxShadow="md">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          {/* Mobile Hamburger Menu */}
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />

          {/* Branding */}
          <HStack spacing={8} alignItems={'center'}>
            <Box>
              <ChakraNextLink href="/">
                <Text fontSize="lg" fontWeight="bold" cursor="pointer">
                  Achievement Dev Portal
                </Text>
              </ChakraNextLink>
            </Box>
            {/* Desktop Navigation Links */}
            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}
            >
              {Links.map((link) => (
                <ChakraNextLink key={link.name} href={link.path}>
                  {link.name}
                </ChakraNextLink>
              ))}
            </HStack>
          </HStack>

          {/* Spacer and Theme Toggle */}
          <Flex alignItems={'center'}>
            <Tooltip label="Toggle Theme" aria-label="Toggle Theme Tooltip">
              <IconButton
                size="md"
                variant="ghost"
                onClick={toggleColorMode}
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                aria-label="Toggle Theme"
              />
            </Tooltip>
            {/* Profile Dropdown (Optional) */}
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                ml={4}
              >
                <Avatar size={'sm'} src={'https://bit.ly/broken-link'} />
              </MenuButton>
              <MenuList>
                <MenuItem>Profile</MenuItem>
                <MenuItem>Settings</MenuItem>
                <MenuItem>Logout</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {/* Mobile Drawer Menu */}
        {isOpen ? (
          <Drawer
            isOpen={isOpen}
            placement="left"
            onClose={onClose}
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Navigation</DrawerHeader>

              <DrawerBody>
                <VStack as={'nav'} spacing={4}>
                  {Links.map((link) => (
                    <ChakraNextLink key={link.name} href={link.path}>
                      {link.name}
                    </ChakraNextLink>
                  ))}
                  {/* Additional Mobile Links (Optional) */}
                  <Button
                    variant="ghost"
                    onClick={toggleColorMode}
                    leftIcon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                    w="100%"
                    justifyContent="flex-start"
                  >
                    Toggle Theme
                  </Button>
                </VStack>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        ) : null}
      </Box>
    </>
  );
}