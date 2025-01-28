// components/SortableAchievementItem.js

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Box,
  Text,
  Input,
  Textarea,
  HStack,
  IconButton,
  Checkbox,
  Image,
  Progress,
  VStack,
  Tooltip,
  useColorModeValue,
  Select,
} from '@chakra-ui/react';
import { DeleteIcon, DragHandleIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';

const SortableAchievementItem = ({
  id, // Unique identifier for sortable (should be a string)
  achievement,
  index,
  onChange,
  onDelete,
  handleImageChange,
}) => {
  // Utilize useSortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Debugging logs to verify the types
  console.log('SortableAchievementItem - id:', id, typeof id);
  console.log('SortableAchievementItem - achievement._id:', achievement._id, typeof achievement._id);

  // Apply transformations and transitions
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      borderWidth={1}
      borderRadius="md"
      p={4}
      mb={4}
      bg={useColorModeValue('white', 'gray.700')}
      boxShadow={isDragging ? 'lg' : 'md'}
      position="relative"
    >
      {/* Drag Handle */}
      <Box
        {...attributes}
        {...listeners}
        position="absolute"
        top={2}
        left={2}
        cursor="grab"
        zIndex={2}
      >
        <DragHandleIcon />
      </Box>

      <HStack justifyContent="space-between" alignItems="flex-start">
        {/* Achievement Content */}
        <VStack align="start" spacing={4} flex="1" ml={8}> {/* Add left margin to avoid overlap with drag handle */}
          {/* Title */}
          <Box w="100%">
            <Text fontWeight="bold">Title</Text>
            <Input
              placeholder="Enter achievement title"
              value={achievement.title}
              onChange={(e) => onChange(index, 'title', e.target.value)}
              aria-label={`Achievement ${index + 1} Title`}
            />
          </Box>

          {/* Description */}
          <Box w="100%">
            <Text fontWeight="bold">Description</Text>
            <Textarea
              placeholder="Enter achievement description"
              value={achievement.description}
              onChange={(e) => onChange(index, 'description', e.target.value)}
              aria-label={`Achievement ${index + 1} Description`}
            />
          </Box>

          {/* Type and Progress Goal */}
          <HStack spacing={4} w="100%">
            <Box flex="1">
              <Text fontWeight="bold">Type</Text>
              <Select
                value={achievement.type}
                onChange={(e) => onChange(index, 'type', e.target.value)}
                aria-label={`Achievement ${index + 1} Type`}
              >
                <option value="progress">Progress</option>
                <option value="milestone">Milestone</option>
              </Select>
            </Box>
            {achievement.type === 'progress' && (
              <Box flex="1">
                <Text fontWeight="bold">Progress Goal</Text>
                <Input
                  type="number"
                  placeholder="Set progress goal"
                  value={achievement.progressGoal || ''}
                  onChange={(e) => onChange(index, 'progressGoal', e.target.value)}
                  aria-label={`Achievement ${index + 1} Progress Goal`}
                />
              </Box>
            )}
          </HStack>

          {/* Hidden Checkbox */}
          <Checkbox
            isChecked={achievement.isHidden}
            onChange={(e) => onChange(index, 'isHidden', e.target.checked)}
            aria-label={`Achievement ${index + 1} Hidden`}
          >
            Hidden Achievement
          </Checkbox>

          {/* Image Upload */}
          <Box w="100%">
            <Text fontWeight="bold">Image Upload</Text>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImageChange(index, e.target.files[0]);
                }
              }}
              aria-label={`Achievement ${index + 1} Image Upload`}
            />
            {achievement.imageUrl && (
              <Image
                src={achievement.imageUrl}
                alt={`Achievement ${index + 1} Image`}
                boxSize="100px"
                objectFit="cover"
                mt={2}
                borderRadius="md"
              />
            )}
          </Box>

          {/* Upload Progress */}
          {achievement.uploadProgress > 0 && achievement.uploadProgress < 100 && (
            <Box w="100%">
              <Text fontWeight="bold">Image Upload Progress</Text>
              <Progress
                value={achievement.uploadProgress}
                size="sm"
                colorScheme="green"
                aria-label={`Achievement ${index + 1} Image Upload Progress`}
              />
            </Box>
          )}
        </VStack>

        {/* Delete Button */}
        <Tooltip label="Delete Achievement" aria-label="Delete Achievement Tooltip">
          <IconButton
            icon={<DeleteIcon />}
            onClick={() => {
              console.log(`Delete button clicked for achievement ID: ${id}`); // Debug log
              onDelete(id); // Passes string ID
            }}
            colorScheme="red"
            variant="ghost"
            aria-label={`Delete Achievement ${index + 1}`}
            alignSelf="flex-start"
          />
        </Tooltip>
      </HStack>
    </Box>
  );
};

SortableAchievementItem.propTypes = {
  id: PropTypes.string.isRequired, // Unique identifier for sortable (should be a string)
  achievement: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    progressGoal: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    isHidden: PropTypes.bool.isRequired,
    imageFile: PropTypes.instanceOf(File),
    imageUrl: PropTypes.string,
    uploadProgress: PropTypes.number,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  handleImageChange: PropTypes.func.isRequired,
};

export default SortableAchievementItem;
