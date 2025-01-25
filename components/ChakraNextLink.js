import React from 'react';
import NextLink from 'next/link';
import { Link as ChakraLink } from '@chakra-ui/react';

const ChakraNextLink = ({ href, children, ...props }) => (
  <NextLink href={href} passHref legacyBehavior>
    <ChakraLink {...props}>{children}</ChakraLink>
  </NextLink>
);

export default ChakraNextLink;