// pages/portal.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  IconButton,
  HStack,
  Spacer,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tooltip,
  Collapse,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  CopyIcon,
  EditIcon,
  CheckIcon,
  CloseIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DeleteIcon,
  AddIcon,
  WarningIcon, // Imported correctly
  SearchIcon,  // Imported correctly
} from '@chakra-ui/icons';
import {
  copyToClipboard,
  revertAchievements,
} from '../utils/helper';
import {
  createAchievement,
  updateAchievement,
  deleteAchievement,
  uploadAchievementImage,
} from '../utils/apiUtil';
import Text from '../components/customText';
import Box from '../components/customBox';

function AchievementPortal() {
  const toast = useToast();

  // State Variables
  const [apiKey, setApiKey] = useState('');
  const [listId, setListId] = useState(null);
  const [appId, setAppId] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [originalAchievementsMap, setOriginalAchievementsMap] = useState({});
  const [originalAchievements, setOriginalAchievements] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [isFetchingAchievements, setIsFetchingAchievements] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletedAchievements, setDeletedAchievements] = useState([]);

  // New State Variable for API Key Input
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Modal State for Delete Confirmation
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [achievementToDelete, setAchievementToDelete] = useState(null);

  // State for Showing the Switch API Key Input
  const [showSwitchApiKey, setShowSwitchApiKey] = useState(false);

  // Prevent accidental navigation with unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load API Key from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedApiKey = localStorage.getItem('apiKey');
      if (storedApiKey) {
        setApiKey(storedApiKey);
        handleFetchAchievements(storedApiKey);
      }
    }
  }, []);

  // Warn user about unsaved changes when attempting to close the tab or navigate away
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle Fetching Achievements
  const handleFetchAchievements = async (inputApiKey) => {
    if (!inputApiKey) {
      toast({
        title: 'API Key Missing',
        description: 'Please enter your API Key.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsFetchingAchievements(true);
    setAchievements([]);
    setListId(null);
    setAppId(null);
    setOriginalAchievementsMap({});
    setIsEditing(false);
    setDeletedAchievements([]);

    try {
      // 1. Retrieve listId and appId using the API Key
      const keyResponse = await axios.get(`/api/apikeys`, {
        params: { key: inputApiKey },
      });

      const { listId: fetchedListId, appId: fetchedAppId } = keyResponse.data;

      if (!fetchedListId || !fetchedAppId) {
        throw new Error('Invalid API Key: Associated list or app not found.');
      }

      setListId(fetchedListId);
      setAppId(fetchedAppId);
      setApiKey(inputApiKey); // Set the stored API key

      // Store API Key in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('apiKey', inputApiKey);
      }

      // 2. Fetch achievements using listId and API Key
      const achievementsResponse = await axios.get(
        `/api/lists/${fetchedListId}/achievements`,
        {
          headers: { 'x-api-key': inputApiKey },
        }
      );

      const fetchedAchievements = achievementsResponse.data;

      if (!Array.isArray(fetchedAchievements)) {
        throw new Error('Invalid response format for achievements.');
      }

      // Initialize uploadProgress for each achievement
      const initializedAchievements = fetchedAchievements.map((ach) => ({
        ...ach,
        uploadProgress: 0,
      }));
      console.log('Fetched Achievements:', initializedAchievements);

      setAchievements(initializedAchievements);
      setOriginalAchievements(initializedAchievements);
      // Create a map for original achievements keyed by _id for efficient comparison
      const achievementsMap = {};
      initializedAchievements.forEach((ach) => {
        achievementsMap[ach._id] = { ...ach };
      });
      setOriginalAchievementsMap(achievementsMap);

      toast({
        title: 'Achievements Retrieved',
        description: `Fetched ${fetchedAchievements.length} achievement(s).`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error fetching achievements:', error);
      let errorMessage = 'An unexpected error occurred while fetching achievements.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: 'Error Fetching Achievements',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsFetchingAchievements(false);
    }
  };

  // Handle copying to clipboard using utility function
  const handleCopyToClipboard = async (text) => {
    try {
      await copyToClipboard(text);
      toast({
        title: 'Copied!',
        description: 'Achievement ID copied to clipboard.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy ID.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If cancelling, revert changes
      const revertedAchievements = revertAchievements(achievements, originalAchievementsMap);
      setAchievements(revertedAchievements.length === 0 ? originalAchievements : revertedAchievements);
      setDeletedAchievements([]); // Clear any deleted achievements
      setHasUnsavedChanges(false);
    } else {
      setHasUnsavedChanges(true);
    }
    setIsEditing(!isEditing);
  };

  // Handle changes in achievement fields
  const handleAchievementChange = (index, field, value) => {
    const updatedAchievements = [...achievements];
    updatedAchievements[index][field] = value;
    setAchievements(updatedAchievements);
    setHasUnsavedChanges(true);
  };

  // Add a new achievement
  const handleAddAchievement = () => {
    const newOrder =
      achievements.length > 0 ? Math.max(...achievements.map((a) => a.order)) + 1 : 1;
    setAchievements([
      ...achievements,
      {
        _id: '', // Will be assigned by backend upon saving
        title: '',
        description: '',
        type: 'progress',
        progressGoal: '',
        isHidden: false,
        imageUrl: '',
        order: newOrder, // Assign the next order value
        uploadProgress: 0, // Initialize uploadProgress
      },
    ]);
    setHasUnsavedChanges(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (achievement) => {
    setAchievementToDelete(achievement);
    onOpen();
  };

  // Confirm deletion of achievement
  const confirmDeleteAchievement = () => {
    if (achievementToDelete) {
      const index = achievements.findIndex((ach) => ach._id === achievementToDelete._id);
      if (index !== -1) {
        handleRemoveAchievement(index);
      }
      setAchievementToDelete(null);
      onClose();
    }
  };

  // Remove an achievement (mark for deletion)
  const handleRemoveAchievement = (index) => {
    const updatedAchievements = [...achievements];
    console.log('Removing Achievement:', updatedAchievements[index]);
    setDeletedAchievements((prev) => [...prev, updatedAchievements[index]]);
    console.log('Deleted Achievements:', deletedAchievements);
    updatedAchievements.splice(index, 1);
    // Reassign order values to be sequential
    updatedAchievements.forEach((ach, idx) => (ach.order = idx + 1));
    setAchievements(updatedAchievements);
    setHasUnsavedChanges(true);
  };

  // Delete achievement immediately (optional, based on TODO comment)
  const handleDeleteAchievement = async (achievementId) => { 
    console.log('Deleting Achievement:', achievementId);
    if (!apiKey || !listId || !achievementId) {
      toast({
        title: 'API Key Missing',
        description: 'Please enter your API Key and ensure achievements are loaded.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await deleteAchievement(listId, achievementId, apiKey);
      toast({
        title: 'Achievement Deleted',
        description: 'Achievement has been deleted successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Remove from local state if needed
      setAchievements((prev) => prev.filter((ach) => ach._id !== achievementId));
      setOriginalAchievementsMap((prev) => {
        const newMap = { ...prev };
        delete newMap[achievementId];
        return newMap;
      });
    } catch (error) {
      console.error('Error deleting achievement:', error);
      let errorMessage = 'An unexpected error occurred while deleting the achievement.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: 'Error Deleting Achievement',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  // Reorder achievements - Move Up
  const handleMoveUp = (index) => {
    if (index === 0) return; // Already at the top
    const updatedAchievements = [...achievements];
    const temp = updatedAchievements[index - 1];
    updatedAchievements[index - 1] = updatedAchievements[index];
    updatedAchievements[index] = temp;
    // Update the 'order' fields
    updatedAchievements[index - 1].order = index;
    updatedAchievements[index].order = index + 1;
    setAchievements(updatedAchievements);
    setHasUnsavedChanges(true);
  };

  // Reorder achievements - Move Down
  const handleMoveDown = (index) => {
    if (index === achievements.length - 1) return; // Already at the bottom
    const updatedAchievements = [...achievements];
    const temp = updatedAchievements[index + 1];
    updatedAchievements[index + 1] = updatedAchievements[index];
    updatedAchievements[index] = temp;
    // Update the 'order' fields
    updatedAchievements[index + 1].order = index + 1;
    updatedAchievements[index].order = index + 2;
    setAchievements(updatedAchievements);
    setHasUnsavedChanges(true);
  };

  // Handle Image Upload using utility function
  const handleImageUpload = async (achievementId, file, index) => {
    try {
      const imageUrl = await uploadAchievementImage(
        listId,
        achievementId,
        file,
        apiKey,
        (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          const newAchs = [...achievements];
          newAchs[index].uploadProgress = progress;
          setAchievements(newAchs);
        }
      );

      handleAchievementChange(index, 'imageUrl', imageUrl);
      handleAchievementChange(index, 'uploadProgress', 100); // Set to 100% after completion

      toast({
        title: 'Image Uploaded',
        description: 'Achievement image uploaded successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      handleAchievementChange(index, 'uploadProgress', 0); // Reset progress on error

      let errorMessage =
        'An unexpected error occurred while uploading the image.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Image Upload Failed',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  // Save changes to backend
  const handleSave = async () => { //TODO: save image after save changes
    if (!apiKey || !listId) {
      toast({
        title: 'API Key Missing',
        description: 'Please enter your API Key and ensure achievements are loaded.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      // Optionally, handle deletions here
   
      return;
    }

    setIsSaving(true);

    try {
      // Identify achievements to update and create
      const achievementsToUpdate = achievements
        .filter((ach) => ach._id)
        .filter((ach) => {
          const original = originalAchievementsMap[ach._id];
          return (
            ach.title !== original.title ||
            ach.description !== original.description ||
            ach.type !== original.type ||
            ach.progressGoal !== original.progressGoal ||
            ach.isHidden !== original.isHidden ||
            ach.imageUrl !== original.imageUrl ||
            ach.order !== original.order
          );
        });

      const achievementsToCreate = achievements.filter((ach) => !ach._id);

      // Debugging: Log the achievements to update and create
      console.log('Achievements to Update:', achievementsToUpdate);
      console.log('Achievements to Create:', achievementsToCreate);
     
      // Handle deletions
      for (const ach of deletedAchievements) {
        await handleDeleteAchievement(ach._id);
      }

      // Update existing achievements via utility function
      const updatePromises = achievementsToUpdate.map((ach) =>
        updateAchievement(
          listId,
          ach._id,
          {
            title: ach.title,
            description: ach.description,
            type: ach.type,
            progressGoal: ach.type === 'progress' ? ach.progressGoal : 1,
            isHidden: ach.isHidden,
            imageUrl: ach.imageUrl,
            order: ach.order,
          },
          apiKey
        )
      );

      // Create new achievements via utility function
      const createPromises = achievementsToCreate.map((ach) =>
        createAchievement(
          listId,
          {
            title: ach.title,
            description: ach.description,
            type: ach.type,
            progressGoal: ach.type === 'progress' ? ach.progressGoal : 1,
            isHidden: ach.isHidden,
            imageUrl: ach.imageUrl,
            order: ach.order,
          },
          apiKey
        )
      );

      // Execute all PATCH and POST requests concurrently
      const [updateResults, createResults] = await Promise.all([
        Promise.allSettled(updatePromises),
        Promise.allSettled(createPromises),
      ]);

      // Handle update results
      const failedUpdates = updateResults
        .map((result, idx) => {
          if (result.status === 'rejected') {
            return {
              achievement: achievementsToUpdate[idx],
              error: result.reason.response
                ? result.reason.response.data.error
                : result.reason.message,
            };
          }
          return null;
        })
        .filter((res) => res !== null);

      // Handle create results
      const failedCreates = createResults
        .map((result, idx) => {
          if (result.status === 'rejected') {
            return {
              achievement: achievementsToCreate[idx],
              error: result.reason.response
                ? result.reason.response.data.error
                : result.reason.message,
            };
          }
          return null;
        })
        .filter((res) => res !== null);

      // Notify user about failed updates
      if (failedUpdates.length > 0 || failedCreates.length > 0) {
        let errorMsg = '';
        if (failedUpdates.length > 0) {
          errorMsg += `Failed to update ${failedUpdates.length} achievement(s).\n`;
          failedUpdates.forEach((fail, idx) => {
            errorMsg += `${idx + 1}. ID: ${fail.achievement._id} - ${fail.error}\n`;
          });
        }
        if (failedCreates.length > 0) {
          errorMsg += `Failed to create ${failedCreates.length} achievement(s).\n`;
          failedCreates.forEach((fail, idx) => {
            errorMsg += `${idx + 1}. Title: ${fail.achievement.title} - ${fail.error}\n`;
          });
        }

        toast({
          title: 'Partial Update Failed',
          description: errorMsg,
          status: 'error',
          duration: 10000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Success',
          description: 'All achievements updated and created successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Refresh achievements from backend to sync state
        const refreshedAchievementsResponse = await axios.get(
          `/api/lists/${listId}/achievements`,
          {
            headers: { 'x-api-key': apiKey },
          }
        );

        const refreshedAchievements = refreshedAchievementsResponse.data.map((ach) => ({
          ...ach,
          uploadProgress: 0,
        }));

        setAchievements(refreshedAchievements);

        // Recreate the originalAchievementsMap
        const refreshedMap = {};
        refreshedAchievements.forEach((ach) => {
          refreshedMap[ach._id] = { ...ach };
        });
        setOriginalAchievementsMap(refreshedMap);

        setIsEditing(false);
        setDeletedAchievements([]); // Clear deletions
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error during save:', error);
      let errorMessage = 'An unexpected error occurred while saving achievements.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: 'Error Saving Achievements',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    const revertedAchievements = revertAchievements(achievements, originalAchievementsMap);
    if(revertedAchievements.length === 0){
      setAchievements(originalAchievements);
    } else {
      setAchievements(revertedAchievements);
    }

    setIsEditing(false);
    setDeletedAchievements([]); // Clear any deletions
    setHasUnsavedChanges(false);
    toast({
      title: 'Cancelled',
      description: 'Changes have been reverted.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Toggle Switch API Key Input Visibility
  const toggleSwitchApiKey = () => {
    setShowSwitchApiKey(!showSwitchApiKey);
  };

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.800')} minH="100vh" p={8}>
      <Box maxW="6xl" mx="auto" bg={useColorModeValue('white', 'gray.700')} p={8} shadow="md" borderRadius="md">
        <Heading color="blue.500" mb={4}>
          Achievement Portal
        </Heading>

        {/* API Key Input Field - Only Visible When `apiKey` is Not Set */}
        {!apiKey && (
          <Box w="100%" mb={6}>
            <VStack align="start"  bg={useColorModeValue('white', 'gray.700')} spacing={4}>
              <Text>Please enter your API Key to access your Achievement List.</Text>
              <HStack spacing={4} w="100%">
                <Input
                  placeholder="Enter your API Key"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  flex="1"
                  aria-label="API Key Input"
                />
                <Button
                  colorScheme="blue"
                  onClick={() => handleFetchAchievements(apiKeyInput)}
                  isLoading={isFetchingAchievements}
                  loadingText="Fetching"
                  isDisabled={
                    !apiKeyInput || isFetchingAchievements || isSaving || isEditing
                  }
                >
                  Search
                </Button>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Display Achievements Only If `listId` is Available */}
        {listId && (
          <>
            <HStack mb={4}>
              <Heading size="md">Achievements</Heading>
              <Spacer />
              <HStack spacing={2}>
                <Button
                  leftIcon={isEditing ? <CloseIcon /> : <EditIcon />}
                  colorScheme={isEditing ? 'red' : 'blue'}
                  onClick={isEditing ? handleCancel : toggleEditMode}
                  isDisabled={achievements.length === 0}
                  aria-label={isEditing ? 'Cancel Editing' : 'Edit Achievements'}
                >
                  {isEditing ? 'Cancel' : 'Edit Achievements'}
                </Button>
                <Button
                  leftIcon={<SearchIcon />}
                  colorScheme="purple"
                  variant="outline"
                  onClick={toggleSwitchApiKey}
                  aria-label="Switch API Key"
                >
                  Switch API Key
                </Button>
              </HStack>
            </HStack>

            {/* Switch API Key Input */}
            <Collapse in={showSwitchApiKey} animateOpacity>
              <Box mb={6} p={4} border="1px solid" borderColor="gray.200" borderRadius="md" >
                <VStack align="start"  bg={useColorModeValue('white', 'gray.700')} spacing={3}>
                  <Text color={useColorModeValue('gray.800', 'whiteAlpha.900')}>Enter a new API Key to switch achievement lists:</Text>
                  <HStack spacing={4} w="100%">
                    <Input
                      placeholder="Enter new API Key"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      flex="1"
                      aria-label="New API Key Input"
                    />
                    <Button
                      colorScheme="blue"
                      onClick={() => {
                        handleFetchAchievements(apiKeyInput);
                        setShowSwitchApiKey(false);
                      }}
                      isLoading={isFetchingAchievements}
                      loadingText="Switching"
                      isDisabled={
                        !apiKeyInput || isFetchingAchievements || isSaving || isEditing
                      }
                    >
                      Switch
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </Collapse>

            {!isEditing ? (
              // View Mode
              <VStack align="start" spacing={4}  bg={useColorModeValue('white', 'gray.700')}>
                {achievements.length === 0 ? (
                  <Box p={4} bg="yellow.100" borderRadius="md">
                    <HStack>
                      <WarningIcon color="yellow.500" />
                      <Text>No achievements found. Please add some.</Text>
                    </HStack>
                  </Box>
                ) : (
                  achievements.map((ach) => (
                    <Box
                      key={ach._id}
                      w="100%"
                      p={4}
                      border="1px solid"
                      borderRadius="md"
                      _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                      transition="background-color 0.2s"
                    >
                      <HStack justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Text fontWeight="bold" fontSize="lg">
                            {ach.title || 'Untitled Achievement'}
                          </Text>
                          <Text mt={2}>
                            <strong>Description:</strong> {ach.description || 'No description.'}
                          </Text>
                          <Text>
                            <strong>Type:</strong> {ach.type.charAt(0).toUpperCase() + ach.type.slice(1)}
                          </Text>
                          {ach.type === 'progress' && (
                            <Text>
                              <strong>Progress Goal:</strong> {ach.progressGoal}
                            </Text>
                          )}
                          <Text>
                            <strong>Hidden:</strong> {ach.isHidden ? 'Yes' : 'No'}
                          </Text>
                          {ach.imageUrl && (
                            <Image
                              src={ach.imageUrl}
                              alt={ach.title}
                              boxSize="100px"
                              objectFit="cover"
                              mt={2}
                              borderRadius="md"
                            />
                          )}
                        </Box>
                        {ach._id && (
                          <Tooltip label="Copy Achievement ID" aria-label="Copy ID Tooltip">
                            <IconButton
                              icon={<CopyIcon />}
                              onClick={() => handleCopyToClipboard(ach._id)}
                              size="sm"
                              aria-label="Copy Achievement ID"
                              variant="ghost"
                            />
                          </Tooltip>
                        )}
                      </HStack>
                    </Box>
                  ))
                )}
              </VStack>
            ) : (
              // Edit Mode
              <VStack align="start" spacing={4}>
                {achievements.length === 0 && (
                  <Box p={4} bg="yellow.100" borderRadius="md">
                    <HStack>
                      <WarningIcon color="yellow.500" />
                      <Text>No achievements available to edit.</Text>
                    </HStack>
                  </Box>
                )}
                {achievements.map((ach, idx) => (
                  <Box
                    key={ach._id || `new-${idx}`}
                    w="100%"
                    p={4}
                    border="1px solid"
                    borderRadius="md"
                  >
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm" color="gray.500">
                        {ach._id ? `Achievement #${idx + 1}` : `New Achievement #${idx + 1}`}
                      </Text>
                      {ach._id && (
                        <Tooltip label="Copy Achievement ID" aria-label="Copy ID Tooltip">
                          <IconButton
                            icon={<CopyIcon />}
                            onClick={() => handleCopyToClipboard(ach._id)}
                            size="sm"
                            variant="ghost"
                            aria-label="Copy Achievement ID"
                          />
                        </Tooltip>
                      )}
                    </HStack>
                    <Stack spacing={3} mt={2}>
                      <Box>
                        <Text fontWeight="semibold">Title:</Text>
                        <Input
                          placeholder="Achievement Title"
                          value={ach.title}
                          onChange={(e) =>
                            handleAchievementChange(idx, 'title', e.target.value)
                          }
                          aria-label={`Title for Achievement #${idx + 1}`}
                        />
                      </Box>
                      <Box>
                        <Text fontWeight="semibold">Description:</Text>
                        <Textarea
                          placeholder="Description of the achievement."
                          value={ach.description}
                          onChange={(e) =>
                            handleAchievementChange(idx, 'description', e.target.value)
                          }
                          aria-label={`Description for Achievement #${idx + 1}`}
                        />
                      </Box>
                      <Box>
                        <Text fontWeight="semibold">Type:</Text>
                        <Select
                          value={ach.type}
                          onChange={(e) =>
                            handleAchievementChange(idx, 'type', e.target.value)
                          }
                          aria-label={`Type for Achievement #${idx + 1}`}
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
                            value={ach.progressGoal != null ? ach.progressGoal : 1}
                            onChange={(e) =>
                              handleAchievementChange(
                                idx,
                                'progressGoal',
                                e.target.value
                              )
                            }
                            aria-label={`Progress Goal for Achievement #${idx + 1}`}
                          />
                        </Box>
                      )}
                      <Box>
                        <Checkbox
                          isChecked={ach.isHidden}
                          onChange={(e) =>
                            handleAchievementChange(idx, 'isHidden', e.target.checked)
                          }
                          aria-label={`Hidden status for Achievement #${idx + 1}`}
                        >
                          Hidden Achievement?
                        </Checkbox>
                      </Box>
                      {/* Image Display or Upload */}
                      <Box>
                        <Text fontWeight="semibold">Image (optional):</Text>
                        {ach.imageUrl ? (
                          <>
                            <Image
                              src={ach.imageUrl}
                              alt={ach.title}
                              boxSize="100px"
                              objectFit="cover"
                              mt={2}
                              borderRadius="md"
                            />
                            <Button
                              size="sm"
                              mt={2}
                              onClick={async () => {
                                try {
                                  if (ach._id) {
                                    await updateAchievement(
                                      listId,
                                      ach._id,
                                      { imageUrl: '' },
                                      apiKey
                                    );
                                    handleAchievementChange(idx, 'imageUrl', '');
                                    toast({
                                      title: 'Image Removed',
                                      description: 'Achievement image has been removed.',
                                      status: 'success',
                                      duration: 5000,
                                      isClosable: true,
                                    });
                                  }
                                } catch (error) {
                                  console.error('Error removing image:', error);
                                  let errorMessage =
                                    'An unexpected error occurred while removing the image.';
                                  if (
                                    error.response &&
                                    error.response.data &&
                                    error.response.data.error
                                  ) {
                                    errorMessage = error.response.data.error;
                                  } else if (error.message) {
                                    errorMessage = error.message;
                                  }
                                  toast({
                                    title: 'Error Removing Image',
                                    description: errorMessage,
                                    status: 'error',
                                    duration: 7000,
                                    isClosable: true,
                                  });
                                }
                              }}
                              colorScheme="red"
                              leftIcon={<DeleteIcon />}
                              aria-label={`Remove Image for Achievement #${idx + 1}`}
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
                                  handleImageUpload(ach._id, e.target.files[0], idx);
                                }
                              }}
                              aria-label={`Upload Image for Achievement #${idx + 1}`}
                            />
                            {/* Display upload progress */}
                            {ach.uploadProgress > 0 && ach.uploadProgress < 100 && (
                              <Progress
                                value={ach.uploadProgress}
                                size="sm"
                                mt={2}
                                colorScheme="green"
                                aria-label={`Upload Progress for Achievement #${idx + 1}`}
                              />
                            )}
                          </>
                        )}
                      </Box>
                      {/* Reorder and Delete Buttons */}
                      <HStack spacing={2}>
                        <Tooltip label="Move Up" aria-label="Move Up Tooltip">
                          <IconButton
                            icon={<ArrowUpIcon />}
                            onClick={() => handleMoveUp(idx)}
                            size="sm"
                            isDisabled={idx === 0}
                            aria-label="Move Achievement Up"
                            variant="ghost"
                          />
                        </Tooltip>
                        <Tooltip label="Move Down" aria-label="Move Down Tooltip">
                          <IconButton
                            icon={<ArrowDownIcon />}
                            onClick={() => handleMoveDown(idx)}
                            size="sm"
                            isDisabled={idx === achievements.length - 1}
                            aria-label="Move Achievement Down"
                            variant="ghost"
                          />
                        </Tooltip>
                        <Tooltip label="Delete Achievement" aria-label="Delete Achievement Tooltip">
                          <IconButton
                            icon={<DeleteIcon />}
                            onClick={() => openDeleteModal(ach)}
                            size="sm"
                            colorScheme="red"
                            aria-label="Delete Achievement"
                            variant="ghost"
                          />
                        </Tooltip>
                      </HStack>
                    </Stack>
                  </Box>
                ))}
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="green"
                  onClick={handleAddAchievement}
                  alignSelf="flex-start"
                  aria-label="Add New Achievement"
                >
                  Add Achievement
                </Button>
                <HStack spacing={4}>
                  <Button
                    colorScheme="blue"
                    onClick={handleSave}
                    leftIcon={<CheckIcon />}
                    isLoading={isSaving}
                    loadingText="Saving"
                    isDisabled={isSaving}
                    aria-label="Save Changes"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    leftIcon={<CloseIcon />}
                    aria-label="Cancel Editing"
                  >
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            )}
          </>
        )}
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Achievement</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack>
              <DeleteIcon color="red.500" />
              <Text>
                Are you sure you want to delete the achievement "
                {achievementToDelete?.title || 'Untitled'}"?
              </Text>
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDeleteAchievement}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default AchievementPortal;