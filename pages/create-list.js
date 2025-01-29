// pages/CreateListPage.js

import React, { useState } from 'react';
import {
  Heading,
  Input,
  Button,
  Text,
  Textarea,
  VStack,
  HStack,
  Box,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { createAchievement, uploadAchievementImage } from '../utils/apiUtil';
import { useRouter } from 'next/router';
import SortableAchievementItem from '../components/SortableAchievementItem';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique IDs

function CreateListPage() {
  const toast = useToast();
  const router = useRouter();

  // State Variables
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [listTitle, setListTitle] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [achievements, setAchievements] = useState([
    {
      _id: uuidv4(), // Assign a unique temporary ID
      title: '',
      description: '',
      type: 'progress',
      progressGoal: '',
      isHidden: false,
      imageFile: null,
      imageUrl: '',
      uploadProgress: 0,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Maximum Achievements Limit
  const MAX_ACHIEVEMENTS = 10;

  // Drag-and-Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Drag starts after moving 5px
      },
    })
  );

  // Handler to add more achievements to the form
  const handleAddAchievement = () => {
    if (achievements.length >= MAX_ACHIEVEMENTS) {
      toast({
        title: 'Maximum Achievements Reached',
        description: `You can only add up to ${MAX_ACHIEVEMENTS} achievements.`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setAchievements((prev) => [
      ...prev,
      {
        _id: uuidv4(), // Assign a unique temporary ID
        title: '',
        description: '',
        type: 'progress',
        progressGoal: '',
        isHidden: false,
        imageFile: null,
        imageUrl: '',
        uploadProgress: 0,
      },
    ]);
  };

  // Handler to update typed fields for each achievement
  const handleAchievementChange = (index, field, value) => {
    setAchievements((prevAchs) => {
      const newAchs = [...prevAchs];
      newAchs[index][field] = value;

      // If type changes, reset related fields
      if (field === 'type') {
        if (value === 'milestone') {
          newAchs[index].progressGoal = ''; // Reset progressGoal
        } else if (value === 'progress' && !newAchs[index].progressGoal) {
          newAchs[index].progressGoal = 1; // Set default progressGoal
        }
      }

      return newAchs;
    });
  };

  // Handler to handle image file selection
  const handleImageChange = (index, file) => {
    setAchievements((prevAchs) => {
      const newAchs = [...prevAchs];
      newAchs[index].imageFile = file;
      newAchs[index].imageUrl = ''; // Reset imageUrl when a new file is selected
      newAchs[index].uploadProgress = 0; // Reset progress
      return newAchs;
    });
  };

  // Handler to delete an achievement
  const handleDeleteAchievement = (achievementId) => {
    console.log(`Attempting to delete achievement with ID: ${achievementId._id}`); // Debug log
    setAchievements((prevAchs) => {
      const newAchs = prevAchs.filter((ach) => ach._id !== achievementId._id);
      console.log(`New Achievements List:`, newAchs); // Debug log
      return newAchs;
    });
    toast({
      title: 'Achievement Removed',
      description: 'The achievement has been removed from the list.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Drag-and-Drop Handler
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = achievements.findIndex((ach) => ach._id === active.id);
      const newIndex = achievements.findIndex((ach) => ach._id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedAchs = arrayMove(achievements, oldIndex, newIndex);
      setAchievements(reorderedAchs);
    }
  };

  // The main submission logic
  const handleSubmit = async () => {
    // Basic validation
    if (!appName.trim() || !listTitle.trim()) {
      toast({
        title: 'Missing required fields',
        description: 'Please provide an App Name and a List Title.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Additional validation: Ensure all achievements have titles
    if (achievements.length === 0) {
      toast({
        title: 'No Achievements Added',
        description: 'Please add at least one achievement before submitting the form.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    for (let i = 0; i < achievements.length; i++) {
      if (!achievements[i].title.trim()) {
        toast({
          title: 'Missing Achievement Title',
          description: `Please provide a title for Achievement #${i + 1}.`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // If type is progress, ensure progressGoal is set
      if (achievements[i].type === 'progress' && (!achievements[i].progressGoal || achievements[i].progressGoal < 1)) {
        toast({
          title: 'Invalid Progress Goal',
          description: `Please provide a valid Progress Goal for Achievement #${i + 1}.`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1) Create the App => POST /api/apps
      const appResponse = await axios.post('/api/apps', {
        title: appName.trim(),
        description: appDescription.trim() || `Auto-created for ${appName.trim()}`,
      });
      const appId = appResponse.data._id;

      if (!appId) {
        throw new Error('App creation failed: No appId returned.');
      }

      // 2) Create the AchievementList => POST /api/lists
      const listResponse = await axios.post('/api/lists', {
        appId,
        title: listTitle.trim(),
        description: listDescription.trim(),
      });
      const listId = listResponse.data._id;

      if (!listId) {
        throw new Error('List creation failed: No listId returned.');
      }

      // 3) Create an API Key => POST /api/apikeys/:listId
      const apiKeyResponse = await axios.post(
        `/api/apikeys/${listId}`,
        {
          listId,
          appId,
          expDate: '2026-12-31T00:00:00.000Z',
        }
      );
      const finalKey = apiKeyResponse.data.key;

      if (!finalKey) {
        throw new Error('API Key creation failed: No key returned.');
      }

      // 4) Create Achievements with API Key using utility function
      const createdAchievements = [];
      for (let i = 0; i < achievements.length; i++) {
        const ach = achievements[i];
        if (!ach.title.trim()) continue; // Skip achievements without a title

        const achievementResponse = await createAchievement(
          listId,
          {
            title: ach.title.trim(),
            description: ach.description.trim(),
            type: ach.type,
            progressGoal:
              ach.type === 'progress' ? parseInt(ach.progressGoal, 10) || 1 : 1,
            isHidden: ach.isHidden,
            imageUrl: '', // to be updated after image upload
            order: i + 1, // Assign order based on position
          },
          finalKey
        );

        const createdAch = achievementResponse.data;
        createdAchievements.push({ ...createdAch, index: i });
      }

      // 5) Upload Images for Achievements and Update imageUrl using utility function
      const imageUploadPromises = createdAchievements.map((ach) => {
        const achievementIndex = ach.index; // Mapping back to the original index

        if (achievements[achievementIndex].imageFile) {
          return uploadAchievementImage(
            listId,
            ach._id,
            achievements[achievementIndex].imageFile,
            finalKey,
            (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setAchievements((prevAchs) => {
                const newAchs = [...prevAchs];
                newAchs[achievementIndex].uploadProgress = progress;
                return newAchs;
              });
            }
          )
            .then((imageUrl) => {
              handleAchievementChange(achievementIndex, 'imageUrl', imageUrl);
              setAchievements((prevAchs) => {
                const newAchs = [...prevAchs];
                newAchs[achievementIndex].uploadProgress = 100;
                return newAchs;
              });
            })
            .catch((uploadError) => {
              throw new Error(
                `Image upload failed for Achievement #${achievementIndex + 1}.`
              );
            });
        }
        return Promise.resolve();
      });

      await Promise.all(imageUploadPromises);

      // 6) Redirect to Response Page with API Key
      toast({
        title: 'Success!',
        description: `Achievement List and API Key created successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to response page with API key as a query parameter
      router.push({
        pathname: '/response',
        query: { apiKey: finalKey },
      });
    } catch (error) {
      console.error('Error creating list flow:', error);

      // Extract meaningful error message
      let errorMessage = 'An unexpected error occurred.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error Creating List',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box  p={8} minH="100vh" >
      <Box bg={useColorModeValue("white", "gray.700")} border={useColorModeValue("gray.200", "gray.400")} maxW="6xl" mx="auto" p={8} shadow="md" borderRadius="md">
        <Heading color="blue.500" mb={6} textAlign="center">
          Create a New Achievement List
        </Heading>

        <VStack align="start" spacing={6}>
          {/* App Details */}
          <Box w="100%">
            <Text fontWeight="semibold" mb={2}>
              App Name:
            </Text>
            <Input
              placeholder="Example: My Awesome Game"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              aria-label="App Name"
            />
          </Box>

          <Box w="100%">
            <Text fontWeight="semibold" mb={2}>
              App Description (optional):
            </Text>
            <Textarea
              placeholder="Description for your app."
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              aria-label="App Description"
            />
          </Box>

          {/* List Details */}
          <Box w="100%">
            <Text fontWeight="semibold" mb={2}>
              List Title:
            </Text>
            <Input
              placeholder="Beginner Quests"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              aria-label="List Title"
            />
          </Box>

          <Box w="100%">
            <Text fontWeight="semibold" mb={2}>
              List Description:
            </Text>
            <Textarea
              placeholder="A set of starter achievements for new players."
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              aria-label="List Description"
            />
          </Box>

          {/* Achievements Section */}
          <Box w="100%">
            <HStack justifyContent="space-between" mb={4}>
              <Text fontSize="lg" fontWeight="bold">
                Achievements:
              </Text>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="green"
                variant="outline"
                alignSelf="flex-start"
                onClick={handleAddAchievement}
                isDisabled={achievements.length >= MAX_ACHIEVEMENTS}
                size="md"
                aria-label="Add Another Achievement"
              >
                Add Achievement
              </Button>
            </HStack>
            {/* Drag-and-Drop Context */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={achievements.map((ach) => ach._id)}
                strategy={verticalListSortingStrategy}
              >
                <VStack spacing={6} align="stretch">
                  {achievements.map((ach, idx) => {
                    console.log('Rendering SortableAchievementItem with id:', ach._id, typeof ach._id); // Debug log
                    return (
                      <SortableAchievementItem
                        key={ach._id}
                        id={ach._id} // Pass the unique id as a string
                        achievement={ach}
                        index={idx}
                        onChange={handleAchievementChange}
                        onDelete={handleDeleteAchievement}
                        handleImageChange={handleImageChange}
                      />
                    );
                  })}
                </VStack>
              </SortableContext>
            </DndContext>
          </Box>

          {/* Display Achievements Limit */}
          {achievements.length >= MAX_ACHIEVEMENTS && (
            <Box p={2} bg="red.100" borderRadius="md">
              <HStack>
                <DeleteIcon color="red.500" />
                <Text color="red.700">
                  You have reached the maximum number of achievements ({MAX_ACHIEVEMENTS}).
                </Text>
              </HStack>
            </Box>
          )}

          {/* Submit Button */}
          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Creating"
            alignSelf="center"
            size="lg"
            w={{ base: '100%', md: '50%' }}
            isDisabled={achievements.length === 0 || isSubmitting}
          >
            Create List
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

export default CreateListPage;