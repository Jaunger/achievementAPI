# AchievementsAPI

## ✨ Introduction

AchievementsAPI is a robust backend service designed to complement the [AchievementsSDK](https://github.com/Jaunger/AchievementSDK) Android library. This API provides a comprehensive REST service for managing achievements, players, and achievement lists. AchievementsAPI simplifies the integration of achievement systems into your game or app, offering essential features such as:

- Real-time progress tracking
- Secure API key management
- Seamless player data management

Achieve a complete integration with both the API and SDK to create dynamic, interactive achievement systems for your users.

---

## 🌟 Key Features

- **Achievements Management**: Create, update, delete, and retrieve achievements programmatically.
- **Player Management**: Easily manage player profiles and track their progress across different achievements.
- **Real-Time Tracking**: Update and track achievement progress for players in real-time.
- **Secure API Keys**: Use unique API keys to safeguard your achievement lists and player data.
- **Seamless Integration**: The API works seamlessly with the [AchievementsSDK](https://github.com/Jaunger/AchievementSDK) for Android, enabling easy integration.
- **Scalable Backend**: Built using Express.js and MongoDB, the API scales effortlessly to meet the needs of your application.

---

## 🚀 Getting Started

### Prerequisites

Before setting up the API, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (Atlas or local instance)
- **AWS Credentials** for managing image uploads.


---

  

### 🛠️ Installation

  

1.  Clone the repository:

  

```bash

git clone https://github.com/yourusername/AchievementsAPI.git

cd AchievementsAPI
```
  

2.  Install dependencies:

  
```bash
npm install
```
  

  

3.  Create a  .env  file in the root directory and configure the following environment variables:

  ```bash

_MONGO__URI=<Your MongoDB URI>

_AWS__ACCESS_KEY_ID=<Your AWS  Access  Key  ID>

_AWS__SECRET_ACCESS_KEY=<Your AWS Secret  Access  Key>

_AWS__REGION=<Your AWS Region>

_PORT_=<Your Desired Port (default:  3000)>
```
  

**▶️ Running the API**

  

Start the server in development mode:

 ```bash
npm run dev

 ``` 

Or in production mode:

  
```bash
npm start
```
  
## 🗒️ API Documentation

### **Endpoints Overview**

This section provides a comprehensive guide to the API endpoints available in AchievementsAPI. These endpoints cover health checks, achievement management, player management, API key verification, and more.

---

### **Health Check**

#### **GET** `/health`

Checks the health of the server.

- **Response:**
    ```json
  {
    "status": "OK",
    "message": "Server is healthy"
  }
     ```

## **Achievements Management**
### **GET** `/api/achievements`

Retrieves a list of all achievements associated with the provided API key and achievement list.

#### **Query Parameters:**
- `listId` (required): The ID of the achievement list.

#### **Headers:**
- `x-api-key` (required): Your API key.

#### **Response:**
```json
[
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
]
```



### **POST** `/api/achievements`

Creates a new achievement in the specified achievement list.

#### **Headers:**
- `x-api-key` (required): Your API key.

#### **Body:**
```json
{
  "listId": "achievementList123",
  "title": "First Kill",
  "description": "Defeat your first enemy.",
  "type": "progress",
  "progressGoal": 1,
  "isHidden": false,
  "imageUrl": "https://example.com/image.png"
}
```

### **Response:**
```json
{
  "message": "Achievement created successfully.",
  "achievementId": "achievementId123"
}
```


### **PATCH** `/api/achievements/:id`

Updates an existing achievement.

#### **Headers:**
- `x-api-key` (required): Your API key.

#### **Body:**
```json
{
  "title": "Updated Achievement Title",
  "description": "Updated description.",
  "progressGoal": 10,
  "isHidden": true,
  "imageUrl": "https://example.com/newimage.png"
}
```

### **Response:**
```json

{
  "message": "Achievement updated successfully."
}
```


### **DELETE** `/api/achievements/:id`

Deletes an achievement by ID.

#### **Headers:**
- `x-api-key` (required): Your API key.

#### **Response:**
```json
{
  "message": "Achievement deleted successfully."
}
```


## Achievement Lists

### **GET** `/api/lists`

Retrieves all achievement lists associated with your API key.

#### **Headers:**
- `x-api-key` (required): Your API key.

#### **Response:**
```json
[
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
]
```

### **POST** `/api/lists`

Creates a new achievement list.

#### **Headers:**
- `x-api-key` (required): Your API key.

#### **Body:**
```json
{
  "name": "Starter Achievements",
  "description": "A list of starter achievements for new players."
}
```

#### **Response:**
```json
{
  "message": "Achievement list created successfully.",
  "listId": "listId123"
}
```


## Player Management

### **POST** `/api/players`

Creates or fetches a player profile.

#### **Headers:**
- `x-api-key` (required): Your API key.

#### **Body:**
```json
{
  "playerId": "player123"
}
```
#### **Response:**
```json
{
  "message": "Player created successfully.",
  "playerId": "player123"
}
```

### **POST** `/api/players`

Creates or fetches a player profile.

#### **Headers:**
- `x-api-key` (required): Your API key.

#### **Body:**
```json
{
  "playerId": "player123"
}
```

#### **Response:**
```json
{
  "message": "Player created successfully.",
  "playerId": "player123"
}
```

## API Key Management

### **GET** `/api/apikeys`

Retrieves metadata about the provided API key.

#### **Query Parameters:**
- `key` (required): The API key to verify.

#### **Response:**
```json
{
  "listId": "listId123",
  "appId": "appId123"
}
```
## 🖥️ Frontend Pages

The Achievement Dev Portal frontend provides a user-friendly interface to manage and create achievement lists, integrated with the **AchievementsAPI**.

### 1. **HomePage** 🏠
- **Purpose**: The landing page for the portal, providing an overview of API/SDK capabilities and links to manage or create achievement lists.
- **Accessible at**: [HomePage](https://achievementapi.onrender.com)

---

### 2. **Create List Page** 📝
- **Purpose**: Allows users to design new achievement lists and add customizable achievements.
- **Accessible from**: HomePage → "Go to Create Page"

---

### 3. **Portal Page** 🔧
- **Purpose**: Manage existing achievement lists, edit achievements, and update progress goals.
- **Accessible from**: HomePage → "Manage List" button

---

### 4. **Response Page** ✅
- **Purpose**: Shows confirmation after creating a new achievement list, along with the API key.
- **Accessible from**: After creating an achievement list in Create List Page

---

### Navigation Flow

- **HomePage** is your starting point.
- From **HomePage**, go to either **Create List** or **Manage List**.
- **Response Page** appears after successfully creating a list.

Each page is designed for easy navigation, making achievement management seamless for your app!

---

## ScreenShots


## Video

---

## 🛡️ Security

AchievementsAPI uses **API keys** to restrict access to achievement lists and player data. Always store your API keys securely and **avoid exposing them in client-side code**. 

---

## 🔗 Integration with [AchievementsSDK](https://github.com/Jaunger/AchievementSDK)

The API is designed to work seamlessly with the [AchievementsSDK](https://github.com/Jaunger/AchievementSDK). For detailed instructions on integrating the SDK with your Android application, please refer to the SDK documentation.

---

## 🤝 Contributing

We welcome contributions! To contribute to AchievementsAPI, please follow these steps:

1. **Fork the repository**.
2. **Create a new branch** for your feature or bugfix.
3. **Submit a pull request** with a detailed description of your changes.

---

## 📜 License

AchievementsAPI is licensed under the **MIT License**. For more details, see the [LICENSE](LICENSE) file.

---

## 📧 Support

For support or questions, please reach out via email at [**email**](danielrabi123@gmail.com) or create an issue in the repository.

---

## 💡 Acknowledgments

AchievementsAPI was built using the following technologies:

- **Express.js** for the backend framework.
- **MongoDB** for scalable data storage.
- **AWS SDK** for seamless image uploads.
