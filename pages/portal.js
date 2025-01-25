// pages/portal.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Heading,
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
  Spinner,
  Text,
  Box,
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
  WarningIcon,
  SearchIcon,
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

/**
 * AchievementPortal Component
 * Manages fetching, viewing, editing, and deleting achievements.
 */
function AchievementPortal() {
  const toast = useToast();

  // =========================
  // State Variables
  // =========================
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

  const [apiKeyInput, setApiKeyInput] = useState('');

  // Modal State for Delete Confirmation
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [achievementToDelete, setAchievementToDelete] = useState(null);

  // State for Showing the Switch API Key Input
  const [showSwitchApiKey, setShowSwitchApiKey] = useState(false);

  // Prevent accidental navigation with unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Draft State for Achievements in Edit Mode
  const [draftAchievements, setDraftAchievements] = useState([]);

  // =========================
  // Effect Hooks
  // =========================

  // // Load API Key from localStorage on component mount
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const storedApiKey = localStorage.getItem('apiKey');
  //     if (storedApiKey) {
  //       setApiKey(storedApiKey);
  //       handleFetchAchievements(storedApiKey);
  //     }
  //   }
  // }, []); TODO:come back to this

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

  // =========================
  // Fetch Achievements Function
  // =========================
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
    setDraftAchievements([]);
    setListId(null);
    setAppId(null);
    setOriginalAchievementsMap({});
    setIsEditing(false);
    setDeletedAchievements([]);
    setHasUnsavedChanges(false);

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
      let errorMessage =
        'An unexpected error occurred while fetching achievements.';
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

  // =========================
  // Clipboard Function
  // =========================
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

  // =========================
  // Edit Mode Functions
  // =========================
  const toggleEditMode = () => {
    if (isEditing) {
      // If cancelling, revert changes
      setDraftAchievements([]);
      setDeletedAchievements([]);
      setHasUnsavedChanges(false);
    } else {
      // Entering edit mode: create a deep copy of achievements
      setDraftAchievements(JSON.parse(JSON.stringify(achievements)));
      setHasUnsavedChanges(true);
    }
    setIsEditing(!isEditing);
  };

  const handleDraftAchievementChange = (index, field, value) => {
    const updatedDraft = [...draftAchievements];
    updatedDraft[index][field] = value;
    setDraftAchievements(updatedDraft);
    setHasUnsavedChanges(true);
  };

  const handleAddDraftAchievement = () => {
    const newOrder =
      draftAchievements.length > 0
        ? Math.max(...draftAchievements.map((a) => a.order)) + 1
        : 1;
    setDraftAchievements([
      ...draftAchievements,
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
        newImageFile: null, // For handling new image uploads
      },
    ]);
    setHasUnsavedChanges(true);
  };

  // =========================
  // Delete Functions
  // =========================
  const openDeleteModal = (achievement) => {
    setAchievementToDelete(achievement);
    onOpen();
  };

  const confirmDeleteAchievement = () => {
    if (achievementToDelete) {
      handleDeleteAchievement(achievementToDelete._id);
      setAchievementToDelete(null);
      onClose();
    }
  };

  const handleDeleteAchievement = (achievementId) => {
    const achievement = draftAchievements.find((ach) => ach._id === achievementId);
    if (achievement) {
      setDeletedAchievements((prev) => [...prev, achievement]);
      setDraftAchievements((prev) => prev.filter((ach) => ach._id !== achievementId));
      setHasUnsavedChanges(true);
      toast({
        title: 'Achievement Marked for Deletion',
        description: 'This achievement will be deleted upon saving changes.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // =========================
  // Reorder Functions
  // =========================
  const handleMoveUp = (index) => {
    if (index === 0) return; // Already at the top
    const updatedDraft = [...draftAchievements];
    const temp = updatedDraft[index - 1];
    updatedDraft[index - 1] = updatedDraft[index];
    updatedDraft[index] = temp;
    // Update the 'order' fields
    updatedDraft[index - 1].order = index;
    updatedDraft[index].order = index + 1;
    setDraftAchievements(updatedDraft);
    setHasUnsavedChanges(true);
  };

  const handleMoveDown = (index) => {
    if (index === draftAchievements.length - 1) return; // Already at the bottom
    const updatedDraft = [...draftAchievements];
    const temp = updatedDraft[index + 1];
    updatedDraft[index + 1] = updatedDraft[index];
    updatedDraft[index] = temp;
    // Update the 'order' fields
    updatedDraft[index + 1].order = index + 1;
    updatedDraft[index].order = index + 2;
    setDraftAchievements(updatedDraft);
    setHasUnsavedChanges(true);
  };

  // =========================
  // Image Upload Function
  // =========================
  const handleDraftImageChange = (index, file) => {
    const updatedDraft = [...draftAchievements];
    updatedDraft[index].newImageFile = file; // Store the file for later upload
    updatedDraft[index].uploadProgress = 0; // Reset progress
    setDraftAchievements(updatedDraft);
    setHasUnsavedChanges(true);
  };

  // =========================
  // Save & Cancel Functions
  // =========================
  const handleSave = async () => {
    if (!apiKey || !listId) {
      toast({
        title: 'API Key Missing',
        description: 'Please enter your API Key and ensure achievements are loaded.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);

    try {
      // Identify achievements to update and create
      const achievementsToUpdate = draftAchievements.filter((ach) => ach._id);
      const achievementsToCreate = draftAchievements.filter((ach) => !ach._id);

      // Handle image uploads for updated and new achievements
      for (let i = 0; i < draftAchievements.length; i++) {
        const ach = draftAchievements[i];
        if (ach.newImageFile) {
          const imageUrl = await uploadAchievementImage(
            listId,
            ach._id,
            ach.newImageFile,
            apiKey,
            (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              const updatedDraft = [...draftAchievements];
              updatedDraft[i].uploadProgress = progress;
              setDraftAchievements(updatedDraft);
            }
          );
          ach.imageUrl = imageUrl;
          ach.uploadProgress = 100;
          delete ach.newImageFile; // Remove the file reference after upload
        }
      }

      // Handle deletions
      for (const ach of deletedAchievements) {
        await deleteAchievement(ach._id);
      }

      // Update existing achievements
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

      // Create new achievements
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
        // Everything succeeded
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
        setOriginalAchievements(refreshedAchievements);

        // Recreate the originalAchievementsMap
        const refreshedMap = {};
        refreshedAchievements.forEach((ach) => {
          refreshedMap[ach._id] = { ...ach };
        });
        setOriginalAchievementsMap(refreshedMap);

        // Exit edit mode
        setIsEditing(false);
        setDraftAchievements([]);
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

  const handleCancel = () => {
    setDraftAchievements([]);
    setDeletedAchievements([]);
    setIsEditing(false);
    setHasUnsavedChanges(false);
    toast({
      title: 'Cancelled',
      description: 'All changes have been reverted.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // =========================
  // Switch API Key Functions
  // =========================
  const toggleSwitchApiKey = () => {
    setShowSwitchApiKey(!showSwitchApiKey);
  };

  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.800')}
      minH="100vh"
      p={{ base: 4, md: 8 }}
    >
      <Box
        maxW={{ base: '100%', md: '6xl' }}
        mx="auto"
        bg={useColorModeValue('white', 'gray.700')}
        p={{ base: 4, md: 8 }}
        shadow="md"
        borderRadius="md"
      >
        <Heading
          color="blue.500"
          mb={{ base: 4, md: 6 }}
          fontSize={{ base: '2xl', md: '3xl' }}
          textAlign={{ base: 'center', md: 'left' }}
        >
          Achievement Portal
        </Heading>

        {/* API Key Input Field - Only Visible When `apiKey` is Not Set */}
        {!apiKey && (
          <Box w="100%" mb={{ base: 6, md: 8 }}>
            <VStack
              align="start"
              bg={useColorModeValue('white', 'gray.700')}
              spacing={4}
              p={{ base: 3, md: 6 }}
              borderRadius="md"
              shadow="sm"
            >
              <Text fontSize={{ base: 'md', md: 'lg' }}>
                Please enter your API Key to access your Achievement List.
              </Text>
              <HStack spacing={4} w="100%">
                <Input
                  placeholder="Enter your API Key"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  flex="1"
                  aria-label="API Key Input"
                  size="md"
                />
                <Button
                  colorScheme="blue"
                  onClick={() => handleFetchAchievements(apiKeyInput)}
                  isLoading={isFetchingAchievements}
                  loadingText="Fetching"
                  isDisabled={
                    !apiKeyInput || isFetchingAchievements || isSaving || isEditing
                  }
                  size="md"
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
            <HStack
              mb={{ base: 4, md: 6 }}
              flexDirection={{ base: 'column', md: 'row' }}
              alignItems={{ base: 'stretch', md: 'center' }}
            >
              <Heading
                size="md"
                mb={{ base: 2, md: 0 }}
                fontSize={{ base: 'xl', md: '2xl' }}
              >
                Achievements
              </Heading>
              <Spacer />
              <HStack spacing={2}>
                <Button
                  leftIcon={isEditing ? <CloseIcon /> : <EditIcon />}
                  colorScheme={isEditing ? 'red' : 'blue'}
                  onClick={isEditing ? handleCancel : toggleEditMode}
                  isDisabled={
                    draftAchievements.length === 0 && achievements.length === 0
                  }
                  aria-label={isEditing ? 'Cancel Editing' : 'Edit Achievements'}
                  size="md"
                >
                  {isEditing ? 'Cancel' : 'Edit Achievements'}
                </Button>
                <Button
                  leftIcon={<SearchIcon />}
                  colorScheme="purple"
                  variant="outline"
                  onClick={toggleSwitchApiKey}
                  aria-label="Switch API Key"
                  size="md"
                >
                  Switch API Key
                </Button>
              </HStack>
            </HStack>

            {/* Switch API Key Input */}
            <Collapse in={showSwitchApiKey} animateOpacity>
              <Box
                mb={{ base: 6, md: 8 }}
                p={{ base: 3, md: 6 }}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                bg={useColorModeValue('white', 'gray.700')}
              >
                <VStack
                  align="start"
                  spacing={3}
                >
                  <Text fontSize={{ base: 'md', md: 'lg' }}>
                    Enter a new API Key to switch achievement lists:
                  </Text>
                  <HStack spacing={4} w="100%">
                    <Input
                      placeholder="Enter new API Key"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      flex="1"
                      aria-label="New API Key Input"
                      size="md"
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
                      size="md"
                    >
                      Switch
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </Collapse>

            {/* Conditional Rendering Based on Editing Mode */}
            {!isEditing ? (
              // 1. View Mode with Loading and Conditional Rendering
              isFetchingAchievements ? (
                // Display loading indicator while fetching
                <VStack spacing={4} align="center" w="100%" py={{ base: 10, md: 16 }}>
                  <Spinner size="xl" />
                  <Text fontSize={{ base: 'md', md: 'lg' }}>Loading achievements...</Text>
                </VStack>
              ) : achievements.length === 0 ? (
                // 3. No Achievements Found
                <Box
                  p={{ base: 4, md: 6 }}
                  bg="yellow.100"
                  borderRadius="md"
                  w="100%"
                >
                  <HStack>
                    <WarningIcon color="yellow.500" />
                    <Text color={useColorModeValue('gray.800', 'gray.700')} fontSize={{ base: 'md', md: 'lg' }}>
                      No achievements found. Please add some.
                    </Text>
                  </HStack>
                </Box>
              ) : (
                // 2. Achievements Available
                <VStack
                  align="start"
                  spacing={4}
                  bg={useColorModeValue('white', 'gray.700')}
                  p={{ base: 3, md: 6 }}
                  borderRadius="md"
                  shadow="sm"
                >
                  {achievements.map((ach) => (
                    <Box
                      key={ach._id}
                      w="100%"
                      p={{ base: 3, md: 4 }}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="md"
                      _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                      transition="background-color 0.2s"
                    >
                      <HStack justifyContent="space-between" alignItems="flex-start" flexDirection={{ base: 'column', md: 'row' }}>
                        <Box>
                          <Text
                            fontWeight="bold"
                            fontSize={{ base: 'lg', md: 'xl' }}
                          >
                            {ach.title || 'Untitled Achievement'}
                          </Text>
                          <Text mt={2} fontSize={{ base: 'sm', md: 'md' }}>
                            <strong>Description:</strong> {ach.description || 'No description.'}
                          </Text>
                          <Text fontSize={{ base: 'sm', md: 'md' }}>
                            <strong>Type:</strong> {ach.type.charAt(0).toUpperCase() + ach.type.slice(1)}
                          </Text>
                          {ach.type === 'progress' && (
                            <Text fontSize={{ base: 'sm', md: 'md' }}>
                              <strong>Progress Goal:</strong> {ach.progressGoal}
                            </Text>
                          )}
                          <Text fontSize={{ base: 'sm', md: 'md' }}>
                            <strong>Hidden:</strong> {ach.isHidden ? 'Yes' : 'No'}
                          </Text>
                          {ach.imageUrl && (
                            <Image
                              src={ach.imageUrl}
                              alt={ach.title}
                              boxSize={{ base: '80px', md: '100px' }}
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
                              mt={{ base: 2, md: 0 }}
                            />
                          </Tooltip>
                        )}
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              )
            ) : (
              // 4. Edit Mode with Draft Achievements
              <VStack align="start" spacing={4}>
                {/* Display Warning if No Achievements to Edit */}
                {draftAchievements.length === 0 && (
                  <Box
                    p={{ base: 4, md: 6 }}
                    bg="yellow.100"
                    borderRadius="md"
                    w="100%"
                  >
                    <HStack>
                      <WarningIcon color="yellow.500" />
                      <Text fontSize={{ base: 'md', md: 'lg' }}>No achievements available to edit.</Text>
                    </HStack>
                  </Box>
                )}
                {/* Render Draft Achievements */}
                {draftAchievements.map((ach, idx) => (
                  <Box
                    key={ach._id || `new-${idx}`}
                    w="100%"
                    p={{ base: 3, md: 4 }}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                  >
                    <HStack justifyContent="space-between" alignItems="center" flexDirection={{ base: 'column', md: 'row' }}>
                      <Text
                        fontSize={{ base: 'sm', md: 'md' }}
                        color="gray.500"
                      >
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
                            mt={{ base: 2, md: 0 }}
                          />
                        </Tooltip>
                      )}
                    </HStack>
                    <Stack spacing={3} mt={2}>
                      {/* Title Input */}
                      <Box>
                        <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                          Title:
                        </Text>
                        <Input
                          placeholder="Achievement Title"
                          value={ach.title}
                          onChange={(e) =>
                            handleDraftAchievementChange(idx, 'title', e.target.value)
                          }
                          aria-label={`Title for Achievement #${idx + 1}`}
                          size="md"
                        />
                      </Box>

                      {/* Description Input */}
                      <Box>
                        <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                          Description:
                        </Text>
                        <Textarea
                          placeholder="Description of the achievement."
                          value={ach.description}
                          onChange={(e) =>
                            handleDraftAchievementChange(idx, 'description', e.target.value)
                          }
                          aria-label={`Description for Achievement #${idx + 1}`}
                          size="md"
                        />
                      </Box>

                      {/* Type Select */}
                      <Box>
                        <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                          Type:
                        </Text>
                        <Select
                          value={ach.type}
                          onChange={(e) =>
                            handleDraftAchievementChange(idx, 'type', e.target.value)
                          }
                          aria-label={`Type for Achievement #${idx + 1}`}
                          size="md"
                        >
                          <option value="progress">Progress</option>
                          <option value="milestone">Milestone</option>
                        </Select>
                      </Box>

                      {/* Progress Goal Input (Conditional) */}
                      {ach.type === 'progress' && (
                        <Box>
                          <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                            Progress Goal:
                          </Text>
                          <Input
                            type="number"
                            placeholder="10, 50, etc."
                            value={ach.progressGoal != null ? ach.progressGoal : 1}
                            onChange={(e) =>
                              handleDraftAchievementChange(
                                idx,
                                'progressGoal',
                                e.target.value
                              )
                            }
                            aria-label={`Progress Goal for Achievement #${idx + 1}`}
                            size="md"
                          />
                        </Box>
                      )}

                      {/* Hidden Checkbox */}
                      <Box>
                        <Checkbox
                          isChecked={ach.isHidden}
                          onChange={(e) =>
                            handleDraftAchievementChange(idx, 'isHidden', e.target.checked)
                          }
                          aria-label={`Hidden status for Achievement #${idx + 1}`}
                        >
                          Hidden Achievement?
                        </Checkbox>
                      </Box>

                      {/* Image Upload or Display */}
                      <Box>
                        <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                          Image (optional):
                        </Text>
                        {ach.imageUrl ? (
                          <>
                            <Image
                              src={ach.imageUrl}
                              alt={ach.title}
                              boxSize={{ base: '80px', md: '100px' }}
                              objectFit="cover"
                              mt={2}
                              borderRadius="md"
                            />
                            <Button
                              size="sm"
                              mt={2}
                              onClick={() => {
                                handleDraftAchievementChange(idx, 'imageUrl', '');
                                toast({
                                  title: 'Image Removed',
                                  description: 'Achievement image has been removed.',
                                  status: 'info',
                                  duration: 3000,
                                  isClosable: true,
                                });
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
                                  handleDraftImageChange(idx, e.target.files[0]);
                                }
                              }}
                              aria-label={`Upload Image for Achievement #${idx + 1}`}
                              size="md"
                              mt={2}
                            />
                            {/* Display upload progress, if any */}
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
                            isDisabled={idx === draftAchievements.length - 1}
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
                {/* Add New Achievement Button */}
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="green"
                  onClick={handleAddDraftAchievement}
                  alignSelf="flex-start"
                  aria-label="Add New Achievement"
                  size="md"
                >
                  Add Achievement
                </Button>
                {/* Save and Cancel Buttons */}
                <HStack spacing={4} mt={4} flexDirection={{ base: 'column', md: 'row' }}>
                  <Button
                    colorScheme="blue"
                    onClick={handleSave}
                    leftIcon={<CheckIcon />}
                    isLoading={isSaving}
                    loadingText="Saving"
                    isDisabled={isSaving}
                    aria-label="Save Changes"
                    w={{ base: '100%', md: 'auto' }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    leftIcon={<CloseIcon />}
                    aria-label="Cancel Editing"
                    w={{ base: '100%', md: 'auto' }}
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
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
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
            <Button variant="ghost" mr={3} onClick={onClose} size="md">
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={confirmDeleteAchievement}
              size="md"
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default AchievementPortal;