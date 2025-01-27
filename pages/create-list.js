/**
 * CreateListPage
 * This page enables users to create a new achievement list, complete with app details,
 * list details, and customizable achievements. Includes drag-and-drop functionality,
 * image uploads, and validation.
 */

import React, { useState } from 'react';
import {
  Heading,
  Input,
  Button,
  Text,
  Textarea,
  VStack,
  HStack,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableAchievementItem from '../components/sortableAchievementItem';
import { createAchievement, uploadAchievementImage } from '../utils/apiUtil';
import { v4 as uuidv4 } from 'uuid';
import Box from '../components/customBox';
function CreateListPage() {
  const toast = useToast();
  const router = useRouter();

  // State variables
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [listTitle, setListTitle] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [achievements, setAchievements] = useState([
    {
      _id: uuidv4(),
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
  const [apiKeyResult, setApiKeyResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_ACHIEVEMENTS = 50;

  // Configure drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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
        _id: uuidv4(),
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

  const handleAchievementChange = (index, field, value) => {
    setAchievements((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      if (field === 'type' && value === 'milestone') {
        updated[index].progressGoal = '';
      }
      return updated;
    });
  };

  const handleDeleteAchievement = (id) => {
    setAchievements((prev) => prev.filter((ach) => ach._id !== id));
  };

  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      const oldIndex = achievements.findIndex((ach) => ach._id === active.id);
      const newIndex = achievements.findIndex((ach) => ach._id === over.id);
      setAchievements(arrayMove(achievements, oldIndex, newIndex));
    }
  };

  const handleSubmit = async () => {
    if (!appName.trim() || !listTitle.trim()) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please provide an App Name and a List Title.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: app } = await axios.post('/api/apps', { title: appName, description: appDescription });
      const { data: list } = await axios.post('/api/lists', {
        appId: app._id,
        title: listTitle,
        description: listDescription,
      });

      const { data: apiKey } = await axios.post(`/api/apikeys/${list._id}`, {
        expDate: '2026-12-31',
      });

      for (let ach of achievements) {
        const achievementData = { ...ach, order: achievements.indexOf(ach) + 1 };
        await createAchievement(list._id, achievementData, apiKey.key);
      }

      router.push({ pathname: '/response', query: { apiKey: apiKey.key } });
    } catch (error) {
      toast({ title: 'Error Creating List', description: error.message, status: 'error', isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.800')} p={8} minH="100vh">
      <Box bg={useColorModeValue('white', 'gray.700')} p={8} shadow="md" borderRadius="md">
        <Heading color="blue.500" mb={6} textAlign="center">
          Create a New Achievement List
        </Heading>

        <VStack spacing={6} align="stretch">
          <Box>
            <Text fontWeight="semibold">App Name:</Text>
            <Input placeholder="App Name" value={appName} onChange={(e) => setAppName(e.target.value)} />
          </Box>
          <Box>
            <Text fontWeight="semibold">App Description (optional):</Text>
            <Textarea
              placeholder="App Description"
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
            />
          </Box>
          <Box>
            <Text fontWeight="semibold">List Title:</Text>
            <Input placeholder="List Title" value={listTitle} onChange={(e) => setListTitle(e.target.value)} />
          </Box>
          <Box>
            <Text fontWeight="semibold">List Description:</Text>
            <Textarea
              placeholder="List Description"
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
            />
          </Box>
          <Box>
            <HStack justifyContent="space-between">
              <Text fontSize="lg" fontWeight="bold">
                Achievements
              </Text>
              <Button onClick={handleAddAchievement}>Add Achievement</Button>
            </HStack>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={achievements.map((ach) => ach._id)} strategy={verticalListSortingStrategy}>
                <VStack spacing={4}>
                  {achievements.map((ach, idx) => (
                    <SortableAchievementItem
                      key={ach._id}
                      achievement={ach}
                      index={idx}
                      onChange={handleAchievementChange}
                      onDelete={handleDeleteAchievement}
                    />
                  ))}
                </VStack>
              </SortableContext>
            </DndContext>
          </Box>
          <Button colorScheme="teal" isLoading={isSubmitting} onClick={handleSubmit}>
            Create List
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

export default CreateListPage;