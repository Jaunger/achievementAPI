// components/SortableAchievementItem.js

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Box,
  HStack,
  IconButton,
  Image,
  Input,
  Select,
  Checkbox,
  Text,
  Button,
  Progress,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  DeleteIcon,
} from '@chakra-ui/icons';

const SortableAchievementItem = ({
  achievement,
  index,
  onChange,
  onDelete,
  handleImageChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: achievement._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      w="100%"
      p={{ base: 3, md: 4 }}
      border="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.400")}
      borderRadius="md"
      bg={isDragging ? useColorModeValue("gray.100", "white.700") : useColorModeValue("white", "gray.700")}
      boxShadow={isDragging ? 'lg' : 'sm'}
    >
      <HStack justifyContent="space-between" alignItems="flex-start" flexDirection={{ base: 'column', md: 'row' }}>
        {/* Drag Handle */}
        <Box {...attributes} {...listeners} cursor="grab">
          <Text fontSize="xl" fontWeight="bold" mr={2} display="inline">
            &#x2630; {/* Unicode for hamburger menu */}
          </Text>
        </Box>
        <Box flex="1">
          {/* Achievement Fields */}
          <HStack justifyContent="space-between" alignItems="flex-start" flexDirection={{ base: 'column', md: 'row' }}>
            <Box flex="1">
              <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                Title:
              </Text>
              <Input
                placeholder="Achievement Title"
                value={achievement.title}
                onChange={(e) => onChange(index, 'title', e.target.value)}
                aria-label={`Title for Achievement #${index + 1}`}
                size="md"
                mb={2}
              />
            </Box>
          </HStack>

          <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
            Description:
          </Text>
          <Input
            placeholder="Description of the achievement."
            value={achievement.description}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            aria-label={`Description for Achievement #${index + 1}`}
            size="md"
            mb={2}
          />

          <HStack spacing={4} mb={2}>
            <Box flex="1">
              <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                Type:
              </Text>
              <Select
                value={achievement.type}
                onChange={(e) => onChange(index, 'type', e.target.value)}
                aria-label={`Type for Achievement #${index + 1}`}
                size="md"
              >
                <option value="progress">Progress</option>
                <option value="milestone">Milestone</option>
              </Select>
            </Box>
            {achievement.type === 'progress' && (
              <Box flex="1">
                <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                  Progress Goal:
                </Text>
                <Input
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  placeholder="10, 50, etc."
                  value={achievement.progressGoal != null ? achievement.progressGoal : ''}
                  onChange={(e) => onChange(index, 'progressGoal', e.target.value)}
                  aria-label={`Progress Goal for Achievement #${index + 1}`}
                  size="md"
                />
              </Box>
            )}
          </HStack>

          <Checkbox
            isChecked={achievement.isHidden}
            onChange={(e) => onChange(index, 'isHidden', e.target.checked)}
            aria-label={`Hidden status for Achievement #${index + 1}`}
            mb={2}
          >
            Hidden Achievement?
          </Checkbox>

          {/* Image Upload or Display */}
          <Box mb={2}>
            <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
              Image (optional):
            </Text>
            {achievement.imageUrl ? (
              <>
                <Image
                  src={achievement.imageUrl}
                  alt={achievement.title}
                  boxSize={{ base: '80px', md: '100px' }}
                  objectFit="cover"
                  mt={2}
                  borderRadius="md"
                />
                <Button
                  size="sm"
                  mt={2}
                  onClick={() => onChange(index, 'imageUrl', '')}
                  colorScheme="red"
                  leftIcon={<DeleteIcon />}
                  aria-label={`Remove Image for Achievement #${index + 1}`}
                >
                  Remove Image
                </Button>
              </>
            ) : (
              <>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageChange(index, e.target.files[0]);
                    }
                  }}
                  aria-label={`Upload Image for Achievement #${index + 1}`}
                  size="md"
                  mt={2}
                />
                {/* Display upload progress, if any */}
                {achievement.uploadProgress > 0 && achievement.uploadProgress < 100 && (
                  <Progress
                    value={achievement.uploadProgress}
                    size="sm"
                    mt={2}
                    colorScheme="green"
                    aria-label={`Upload Progress for Achievement #${index + 1}`}
                  />
                )}
              </>
            )}
          </Box>
        </Box>
        {/* Delete Button */}
        <Tooltip label="Delete Achievement" aria-label="Delete Achievement Tooltip">
          <IconButton
            icon={<DeleteIcon />}
            onClick={() => onDelete(achievement._id)}
            size="sm"
            colorScheme="red"
            aria-label="Delete Achievement"
            variant="ghost"
            alignSelf="center"
          />
        </Tooltip>
      </HStack>
    </Box>
  );
};

export default SortableAchievementItem;