import { Text, useColorModeValue } from '@chakra-ui/react';

function CustomText({ children, ...props }) {
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  
  return (
    <Text color={textColor} {...props}>
      {children}
    </Text>
  );
}

export default CustomText;