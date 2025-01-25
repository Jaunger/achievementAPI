import { Box, useColorModeValue } from '@chakra-ui/react';

function CustomBox({ children, ...props }) {
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.400");
  
  return (
    <Box bg={bgColor} border="1px solid" borderColor={borderColor} p={4} borderRadius="md" {...props}>
      {children}
    </Box>
  );
}

export default CustomBox;