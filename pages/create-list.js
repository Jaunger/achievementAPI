// pages/create-list.js
import React, { useState } from 'react';
import {
  //Box,
  Heading,
  //Text,
  Input,
  Button,
  Textarea,
  Checkbox,
  VStack,
  Stack,
  Select,
  useToast,
  Image,
  Progress,
} from '@chakra-ui/react';
import axios from 'axios';
import {
  createAchievement,
  uploadAchievementImage,
} from '../utils/apiUtil';
import { useRouter } from 'next/router';
import Text from '../components/customText';
import Box from '../components/customBox';

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

  // Handler to add more achievements to the form
  const handleAddAchievement = () => {
    setAchievements((prev) => [
      ...prev,
      {
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
    const newAchs = [...achievements];
    newAchs[index][field] = value;
    setAchievements(newAchs);
  };

  // Handler to handle image file selection
  const handleImageChange = (index, file) => {
    const newAchs = [...achievements];
    newAchs[index].imageFile = file;
    newAchs[index].imageUrl = ''; // Reset imageUrl when a new file is selected
    newAchs[index].uploadProgress = 0; // Reset progress
    setAchievements(newAchs);
  };

  // The main submission logic
  const handleSubmit = async () => {
    // Basic validation
    if (!appName || !listTitle) {
      toast({
        title: 'Missing required fields',
        description: 'Please provide an App Name and a List Title.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1) Create the App => POST /api/apps
      const appResponse = await axios.post('/api/apps', {
        title: appName,
        description: appDescription || `Auto-created for ${appName}`,
      });
      const appId = appResponse.data._id;

      if (!appId) {
        throw new Error('App creation failed: No appId returned.');
      }

      // 2) Create the AchievementList => POST /api/lists
      const listResponse = await axios.post('/api/lists', {
        appId,
        title: listTitle,
        description: listDescription,
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

      setApiKeyResult(finalKey);

      // 4) Create Achievements with API Key using utility function
      const createdAchievements = [];
      for (let i = 0; i < achievements.length; i++) {
        const ach = achievements[i];
        if (!ach.title) continue; // Skip achievements without a title

        const achievementResponse = await createAchievement(
          listId,
          {
            title: ach.title,
            description: ach.description,
            type: ach.type,
            progressGoal:
              ach.type === 'progress' ? parseInt(ach.progressGoal, 10) : 1,
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
      const imageUploadPromises = createdAchievements.map((ach, i) => {
        const originalIndex = ach.index;
        const achievementIndex = originalIndex; // Mapping back to the original index

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
              const newAchs = [...achievements];
              newAchs[achievementIndex].uploadProgress = progress;
              setAchievements(newAchs);
            }
          )
            .then((imageUrl) => {
              handleAchievementChange(achievementIndex, 'imageUrl', imageUrl);
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
        pathname: '/create-list/response',
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
        title: 'Error creating list flow',
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
    <Box  minH="100vh" p={8}>
      <Box maxW="4xl" mx="auto"  p={8} shadow="md" borderRadius="md">
        <Heading color="blue.500" mb={4}>
          Create a New Achievement List
        </Heading>

        <VStack align="start" spacing={4}>
          {/* App Name */}
          <Box w="100%">
            <Text fontWeight="semibold">App Name:</Text>
            <Input
              placeholder="Example: My Awesome Game"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
          </Box>

          {/* App Description */}
          <Box w="100%">
            <Text fontWeight="semibold">App Description (optional):</Text>
            <Textarea
              placeholder="Description for your app."
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
            />
          </Box>

          {/* List Title */}
          <Box w="100%">
            <Text fontWeight="semibold">List Title:</Text>
            <Input
              placeholder="Beginner Quests"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
            />
          </Box>

          {/* List Description */}
          <Box w="100%">
            <Text fontWeight="semibold">List Description:</Text>
            <Textarea
              placeholder="A set of starter achievements for new players."
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
            />
          </Box>

          {/* Achievements */}
          <Heading as="h3" size="md" mt={8}>
            Achievements:
          </Heading>
          {achievements.map((ach, idx) => (
            <Box
              key={idx}
              w="100%"
              p={4}
              border="1px solid"
              borderRadius="md"
            >
              <Text fontSize="sm" color="gray.500">
                Achievement #{idx + 1}
              </Text>
              <Stack spacing={3} mt={2}>
                <Box>
                  <Text fontWeight="semibold">Title:</Text>
                  <Input
                    placeholder="Achievement Title"
                    value={ach.title}
                    onChange={(e) =>
                      handleAchievementChange(idx, 'title', e.target.value)
                    }
                  />
                </Box>
                <Box>
                  <Text fontWeight="semibold">Description:</Text>
                  <Input
                    placeholder="Defeat your first enemy."
                    value={ach.description}
                    onChange={(e) =>
                      handleAchievementChange(idx, 'description', e.target.value)
                    }
                  />
                </Box>
                <Box>
                  <Text fontWeight="semibold">Type:</Text>
                  <Select
                    value={ach.type}
                    onChange={(e) =>
                      handleAchievementChange(idx, 'type', e.target.value)
                    }
                  >
                    <option value="progress">Progress</option>
                    <option value="milestone">Milestone</option>
                  </Select>
                </Box>
                {ach.type === 'progress' && (
                  <Box>
                    <Text fontWeight="semibold">Progress Goal:</Text>
                    <Input
                      type="number"
                      placeholder="10, 50, etc."
                      value={ach.progressGoal}
                      onChange={(e) =>
                        handleAchievementChange(
                          idx,
                          'progressGoal',
                          e.target.value
                        )
                      }
                    />
                  </Box>
                )}
                <Box>
                  <Checkbox
                    isChecked={ach.isHidden}
                    onChange={(e) =>
                      handleAchievementChange(idx, 'isHidden', e.target.checked)
                    }
                  >
                    Hidden Achievement?
                  </Checkbox>
                </Box>
                {/* Image Upload */}
                <Box>
                  <Text fontWeight="semibold">Image (optional):</Text>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageChange(idx, e.target.files[0]);
                      }
                    }}
                  />
                  {/* Display upload progress */}
                  {ach.uploadProgress > 0 && ach.uploadProgress < 100 && (
                    <Progress value={ach.uploadProgress} size="sm" mt={2} />
                  )}
                  {/* Display uploaded image */}
                  {ach.imageUrl && (
                    <Image
                      src={ach.imageUrl}
                      alt={`Achievement ${idx + 1}`}
                      boxSize="100px"
                      objectFit="cover"
                      mt={2}
                    />
                  )}
                </Box>
              </Stack>
            </Box>
          ))}
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={handleAddAchievement}
          >
            + Add Another Achievement
          </Button>

          {/* Submit Button */}
          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Creating"
          >
            Create List
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

export default CreateListPage;