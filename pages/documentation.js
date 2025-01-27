/**
 * HowToUse.js
 * This page provides detailed instructions on how to interact with the AchievementsAPI.
 * It explains the available API endpoints, how to handle errors, and includes examples for integration.
 */

import React, { useState, useRef } from 'react';
import {
  Heading,
  Code,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  ListItem,
  UnorderedList,
  useColorModeValue,
} from '@chakra-ui/react';
import Box from '../components/customBox';
import Text from '../components/customText';

const HowToUse = () => {
  // State to manage which Accordion items are open
  const [activeIndices, setActiveIndices] = useState([]);

  // Refs for each section to enable scrolling
  const sections = {
    setup: useRef(null),
    achievementsManagement: useRef(null),
    achievementLists: useRef(null),
    playerManagement: useRef(null),
    apiKeyManagement: useRef(null),
  };

  // Function to handle ToC link clicks
  const handleToCClick = (sectionKey, index) => {
    // Toggle Accordion item
    setActiveIndices((prevIndices) =>
      prevIndices.includes(index)
        ? prevIndices.filter((i) => i !== index)
        : [...prevIndices, index]
    );

    setTimeout(() => {
      if (sections[sectionKey].current) {
        sections[sectionKey].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300); // Adjust delay as needed
  };

  return (
    <Box
 bg={useColorModeValue('gray.50', 'gray.800')}
    minH="100vh"
    p={{ base: 4, md: 8 }}
    >
      {/* Central container with white background */}
      <Box
        maxW="4xl"
        mx="auto"
        p={8}
        shadow="lg"
        borderRadius="lg"
      >
        <Heading as="h1" size="xl" mb={6} color="blue.600">
          AchievementsAPI Documentation 
        </Heading>

        <Text fontSize="lg" mb={8}>
          This page provides a comprehensive guide on how to interact with the{' '}
          <strong>AchievementsAPI</strong>. Learn how to make requests, handle
          errors, and integrate achievements into your game or app.
        </Text>

        {/* Table of Contents */}
        <Box mb={8}>
          <Heading as="h2" size="md" mb={2} color={useColorModeValue('blue.500', 'blue.300')}>
            Table of Contents
          </Heading>
          <UnorderedList spacing={1} styleType="none" pl={0}>
            <ListItem>
              <Link
                href="#how-to-setup-the-achievementslibrary"
                color="blue.500"
                _hover={{ textDecoration: 'underline' }}
                onClick={(e) => {
                  e.preventDefault();
                  handleToCClick('setup', 0);
                }}
              >
                • How to Setup the AchievementsLibrary
              </Link>
            </ListItem>
            <ListItem>
              <Link
                href="#achievements-management"
                color="blue.500"
                _hover={{ textDecoration: 'underline' }}
                onClick={(e) => {
                  e.preventDefault();
                  handleToCClick('achievementsManagement', 1);
                }}
              >
                • Achievements Management
              </Link>
            </ListItem>
            <ListItem>
              <Link
                href="#achievement-lists"
                color="blue.500"
                _hover={{ textDecoration: 'underline' }}
                onClick={(e) => {
                  e.preventDefault();
                  handleToCClick('achievementLists', 2);
                }}
              >
                • Achievement Lists
              </Link>
            </ListItem>
            <ListItem>
              <Link
                href="#player-management"
                color="blue.500"
                _hover={{ textDecoration: 'underline' }}
                onClick={(e) => {
                  e.preventDefault();
                  handleToCClick('playerManagement', 3);
                }}
              >
                • Player Management
              </Link>
            </ListItem>
            <ListItem>
              <Link
                href="#api-key-management"
                color="blue.500"
                _hover={{ textDecoration: 'underline' }}
                onClick={(e) => {
                  e.preventDefault();
                  handleToCClick('apiKeyManagement', 4);
                }}
              >
                • API Key Management
              </Link>
            </ListItem>
          </UnorderedList>
        </Box>

        <Divider mb={6} />

        {/* Accordion to group major endpoint sections */}
        <Accordion
          allowMultiple
          index={activeIndices}
          onChange={(indices) => setActiveIndices(indices)}
        >
          {/* How to Setup the AchievementsLibrary Section */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Heading as="h2" size="md" color="blue.500">
                    How to Setup the AchievementsLibrary
                  </Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <div ref={sections.setup}>
                {/* Step 1️⃣ Add the JitPack Repository */}
                <Box mb={6}>
                  <Heading as="h3" size="sm" mt={4} mb={2} color="blue.400">
                    1️⃣ Add the JitPack Repository 🏗️
                  </Heading>
                  <Text mb={2}>
                    In your <strong>root</strong> <code>build.gradle</code> file:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`dependencyResolutionManagement {
        repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
        repositories {
            google()
            mavenCentral()
            maven { url 'https://jitpack.io' }
        }
    }`}
                  </Code>
                </Box>

                <Divider my={4} />

                {/* Step 2️⃣ Add the Dependency */}
                <Box mb={6}>
                  <Heading as="h3" size="sm" mt={4} mb={2} color="blue.400">
                    2️⃣ Add the Dependency 📦
                  </Heading>
                  <Text mb={2}>
                    In your <strong>module-level</strong> <code>build.gradle</code> file, add <strong>AchievementsSDK</strong>:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`dependencies {
        implementation 'com.github.Jaunger:AchievementSDK:1.0.5'
    }`}
                  </Code>
                </Box>

                <Divider my={4} />

                {/* Step 3️⃣ Provide Your API Key */}
                <Box mb={6}>
                  <Heading as="h3" size="sm" mt={4} mb={2} color="blue.400">
                    3️⃣ Provide Your API Key 🔑
                  </Heading>
                  <Text mb={2}>
                    Open your <code>AndroidManifest.xml</code> and add the meta-data with your API key:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`<application
        ...>
        <meta-data
            android:name="com.achievementsLibrary.API_KEY"
            android:value="YOUR_API_KEY_HERE" />
    </application>`}
                  </Code>
                  <Text>
                    Replace <code>YOUR_API_KEY_HERE</code> with the API key from your achievement list.
                  </Text>
                </Box>

                <Divider my={4} />

                {/* Step 4️⃣ Initialize the SDK */}
                <Box mb={6}>
                  <Heading as="h3" size="sm" mt={4} mb={2} color="blue.400">
                    4️⃣ Initialize the SDK ⚙️
                  </Heading>
                  <Text mb={2}>
                    In your <code>Application</code> class or the main <code>Activity</code>, initialize the SDK:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}

                    >
                    {`@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    AchievementsSDK.getInstance().init(
        this,
        new AchievementsSDK.InitCallback() {
            @Override
            public void onSuccess() {
                Log.d("AchievementsSDK", "SDK initialized successfully.");
            }

            @Override
            public void onFailure(String error) {
                Log.e("AchievementsSDK", "SDK initialization failed: " + error);
            }
        }
    );
}`}
                  </Code>
                </Box>

                <Divider my={4} />

                {/* Step 5️⃣ Create or Fetch a Player */}
                <Box mb={6}>
                  <Heading as="h3" size="sm" mt={4} mb={2} color="blue.400">
                    5️⃣ Create or Fetch a Player 👤
                  </Heading>
                  <Text mb={2}>
                    Use <code>PlayerManager</code> to ensure the player is created or fetched before updating achievements:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`String rawUsername = "player123"; // Replace with your player's unique identifier

PlayerManager.createOrFetchPlayer(
    rawUsername,
    new PlayerManager.PlayerCallback() {
        @Override
        public void onSuccess(String response) {
            Log.d("PlayerManager", "Player created or fetched: " + response);
        }

        @Override
        public void onError(String error) {
            Log.e("PlayerManager", "Error creating or fetching player: " + error);
        }
    }
);`}
                  </Code>
                </Box>

                <Divider my={4} />

                {/* Step 6️⃣ Display Achievements Dialog */}
                <Box mb={6}>
                  <Heading as="h3" size="sm" mt={4} mb={2} color="blue.400">
                    6️⃣ Display Achievements Dialog 🏆
                  </Heading>
                  <Text mb={2}>
                    Show the achievements dialog (completed and in-progress):
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`Button btnShowAchievements = findViewById(R.id.btnShowAchievements);
btnShowAchievements.setOnClickListener(v -> {
    AchievementsSDK sdk = AchievementsSDK.getInstance();

    if (!sdk.isInitialized()) {
        Log.e("AchievementsSDK", "SDK not initialized. Please call init() first.");
        return;
    }

    DialogFragment achievementsDialog = sdk.getAchievementsDialogFragment();
    achievementsDialog.show(getSupportFragmentManager(), "AchievementsDialog");
});`}
                  </Code>
                </Box>

                <Divider my={4} />

                {/* Step 7️⃣ Update Achievement Progress */}
                <Box mb={6}>
                  <Heading as="h3" size="sm" mt={4} mb={2} color="blue.400">
                    7️⃣ Update Achievement Progress 📈
                  </Heading>
                  <Text mb={2}>
                    Track the player's progress for a specific achievement:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`String rawUsername = "player123";          // The player's username
String achievementId = "achievementId123"; // The achievement's ID
int progressDelta = 10;                    // Amount of progress to add

PlayerManager.updateAchievementProgress(
    rawUsername,
    achievementId,
    progressDelta,
    new PlayerManager.PlayerCallback() {
        @Override
        public void onSuccess(String response) {
            Log.d("AchievementUpdate", "Progress updated: " + response);
        }

        @Override
        public void onError(String error) {
            Log.e("AchievementUpdate", "Failed to update progress: " + error);
        }
    }
);`}
                  </Code>
                  <Text>
                    <strong>Notes:</strong>
                  </Text>
                  <UnorderedList ml={4} spacing={1}>
                    <ListItem>
                      <code>rawUsername</code> must match the one used when creating/fetching the player.
                    </ListItem>
                    <ListItem>
                      <code>achievementId</code> must be the ID of an existing achievement.
                    </ListItem>
                    <ListItem>
                      Adjust <code>progressDelta</code> based on how much progress you want to record.
                    </ListItem>
                  </UnorderedList>
                </Box>
              </div>
            </AccordionPanel>
          </AccordionItem>

          <Divider my={6} />

          {/* Achievements Management Section */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Heading as="h2" size="md" color="blue.500">
                    Achievements Management
                  </Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <div ref={sections.achievementsManagement}>
                {/* GET /api/achievements */}
                <Box mb={6}>
                  <Heading as="h3" size="sm" mt={4} mb={2} color="blue.400" id="get-achievements-section">
                    GET /api/achievements
                  </Heading>
                  <Text mb={2}>
                    Retrieves a list of all achievements associated with the
                    provided API key and achievement list.
                  </Text>
                  <Text fontWeight="bold">Query Parameters:</Text>
                  <UnorderedList ml={4} spacing={1}>
                    <ListItem>
                      <strong>listId</strong> (required): The ID of the achievement
                      list.
                    </ListItem>
                  </UnorderedList>
                  <Text mt={3} fontWeight="bold">
                    Headers:
                  </Text>
                  <UnorderedList ml={4} spacing={1}>
                    <ListItem>
                      <strong>x-api-key</strong> (required): Your API key.
                    </ListItem>
                  </UnorderedList>
                  <Text mt={3} fontWeight="bold">
                    Example Response:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`[
        {
          "_id": "achievementId123",
          "title": "First Kill",
          "description": "Defeat your first enemy.",
          "type": "progress",
          "progressGoal": 1,
          "currentProgress": 0,
          "isHidden": false,
          "imageUrl": "https://example.com/image.png",
          "order": 1
        }
      ]`}
                  </Code>
                </Box>

                <Divider my={4} />

                {/* POST /api/achievements */}
                <Box mb={6}>
                  <Heading as="h3" size="sm" mt={4} mb={2} color="blue.400" id="post-achievements-section">
                    POST /api/achievements
                  </Heading>
                  <Text mb={2}>
                    Creates a new achievement in the specified achievement list.
                  </Text>
                  <Text fontWeight="bold">Headers:</Text>
                  <UnorderedList ml={4} spacing={1}>
                    <ListItem>
                      <strong>x-api-key</strong> (required): Your API key.
                    </ListItem>
                  </UnorderedList>
                  <Text mt={3} fontWeight="bold">
                    Example Request Body:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`{
        "listId": "achievementList123",
        "title": "First Kill",
        "description": "Defeat your first enemy.",
        "type": "progress",
        "progressGoal": 1,
        "isHidden": false,
        "imageUrl": "https://example.com/image.png"
    }`}
                  </Code>
                  <Text mt={3} fontWeight="bold">
                    Example Response:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`{
        "message": "Achievement created successfully.",
        "achievementId": "achievementId123"
    }`}
                  </Code>
                </Box>

                <Divider my={4} />

                {/* PATCH /api/achievements/:id */}
                <Box mb={6}>
                  <Heading as="h3" size="sm" mt={4} mb={2} color="blue.400" id="patch-achievements-section">
                    PATCH /api/achievements/:id
                  </Heading>
                  <Text mb={2}>Updates an existing achievement.</Text>
                  <Text fontWeight="bold">Headers:</Text>
                  <UnorderedList ml={4} spacing={1}>
                    <ListItem>
                      <strong>x-api-key</strong> (required): Your API key.
                    </ListItem>
                  </UnorderedList>
                  <Text mt={3} fontWeight="bold">
                    Example Request Body:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`{
        "title": "Updated Achievement Title",
        "description": "Updated description.",
        "progressGoal": 10,
        "isHidden": true,
        "imageUrl": "https://example.com/newimage.png"
    }`}
                  </Code>
                  <Text mt={3} fontWeight="bold">
                    Example Response:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`{
        "message": "Achievement updated successfully."
    }`}
                  </Code>
                </Box>

                <Divider my={4} />

                {/* DELETE /api/achievements/:id */}
                <Box mb={6}>
                  <Heading as="h3" size="sm" mt={4} mb={2} color="blue.400" id="delete-achievements-section">
                    DELETE /api/achievements/:id
                  </Heading>
                  <Text mb={2}>Deletes an achievement by ID.</Text>
                  <Text fontWeight="bold">Headers:</Text>
                  <UnorderedList ml={4} spacing={1}>
                    <ListItem>
                      <strong>x-api-key</strong> (required): Your API key.
                    </ListItem>
                  </UnorderedList>
                  <Text mt={3} fontWeight="bold">
                    Example Response:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`{
        "message": "Achievement deleted successfully."
    }`}
                  </Code>
                </Box>
              </div>
            </AccordionPanel>
          </AccordionItem>

          <Divider my={6} />

          {/* Achievement Lists Section */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Heading as="h2" size="md" color="blue.500">
                    Achievement Lists
                  </Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <div ref={sections.achievementLists}>
                {/* GET /api/lists */}
                <Box mb={6}>
                  <Heading as="h3" size="sm" mt={4} mb={2} color="blue.400" id="get-lists-section">
                    GET /api/lists
                  </Heading>
                  <Text mb={2}>
                    Retrieves all achievement lists associated with your API key.
                  </Text>
                  <Text fontWeight="bold">Headers:</Text>
                  <UnorderedList ml={4} spacing={1}>
                    <ListItem>
                      <strong>x-api-key</strong> (required): Your API key.
                    </ListItem>
                  </UnorderedList>
                  <Text mt={3} fontWeight="bold">
                    Example Response:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`[
        {
          "_id": "listId123",
          "name": "Starter Achievements",
          "achievements": [
            {
              "_id": "achievementId123",
              "title": "First Kill"
            }
          ]
        }
      ]`}
                  </Code>
                </Box>

                <Divider my={4} />

                {/* POST /api/lists */}
                <Box mb={6}>
                  <Heading as="h3" size="sm" mt={4} mb={2} color="blue.400" id="post-lists-section">
                    POST /api/lists
                  </Heading>
                  <Text mb={2}>Creates a new achievement list.</Text>
                  <Text fontWeight="bold">Headers:</Text>
                  <UnorderedList ml={4} spacing={1}>
                    <ListItem>
                      <strong>x-api-key</strong> (required): Your API key.
                    </ListItem>
                  </UnorderedList>
                  <Text mt={3} fontWeight="bold">
                    Example Request Body:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`{
        "name": "Starter Achievements",
        "description": "A list of starter achievements for new players."
    }`}
                  </Code>
                  <Text mt={3} fontWeight="bold">
                    Example Response:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`{
        "message": "Achievement list created successfully.",
        "listId": "listId123"
    }`}
                  </Code>
                </Box>
              </div>
            </AccordionPanel>
          </AccordionItem>

          <Divider my={6} />

          {/* Player Management Section */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Heading as="h2" size="md" color="blue.500">
                    Player Management
                  </Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <div ref={sections.playerManagement}>
                {/* POST /api/players */}
                <Box mb={6}>
                  <Heading as="h3" size="sm" mt={4} mb={2} color="blue.400" id="post-players-section">
                    POST /api/players
                  </Heading>
                  <Text mb={2}>
                    Creates or fetches a player profile.
                  </Text>
                  <Text fontWeight="bold">Headers:</Text>
                  <UnorderedList ml={4} spacing={1}>
                    <ListItem>
                      <strong>x-api-key</strong> (required): Your API key.
                    </ListItem>
                  </UnorderedList>
                  <Text mt={3} fontWeight="bold">
                    Example Request Body:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`{
        "playerId": "player123"
    }`}
                  </Code>
                  <Text mt={3} fontWeight="bold">
                    Example Response:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`{
        "message": "Player created successfully.",
        "playerId": "player123"
    }`}
                  </Code>
                </Box>
              </div>
            </AccordionPanel>
          </AccordionItem>

          <Divider my={6} />

          {/* API Key Management Section */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Heading as="h2" size="md" color="blue.500">
                    API Key Management
                  </Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <div ref={sections.apiKeyManagement}>
                {/* GET /api/apikeys */}
                <Box mb={6}>
                  <Heading as="h3" size="sm" mt={4} mb={2} color="blue.400" id="get-apikeys-section">
                    GET /api/apikeys
                  </Heading>
                  <Text mb={2}>
                    Retrieves metadata about the provided API key.
                  </Text>
                  <Text fontWeight="bold">Query Parameters:</Text>
                  <UnorderedList ml={4} spacing={1}>
                    <ListItem>
                      <strong>key</strong> (required): The API key to verify.
                    </ListItem>
                  </UnorderedList>
                  <Text mt={3} fontWeight="bold">
                    Example Response:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    my={2}
                  >
                    {`{
        "listId": "listId123",
        "appId": "appId123"
    }`}
                  </Code>
                </Box>
              </div>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    </Box>
  );
};

export default HowToUse;