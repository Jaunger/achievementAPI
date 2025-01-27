import axios from 'axios';

/**
 * Creates a new achievement.
 *
 * @param {string} listId - The ID of the achievement list.
 * @param {object} achievementData - The data for the new achievement.
 * @param {string} apiKey - The API key for authorization.
 * @returns {Promise<object>} - The created achievement.
 */
export const createAchievement = (listId, achievementData, apiKey) => {
  return axios.post(`/api/lists/${listId}/achievements`, achievementData, {
    headers: { 'x-api-key': apiKey },
  });
};

/**
 * Updates an existing achievement.
 *
 * @param {string} listId - The ID of the achievement list.
 * @param {string} achievementId - The ID of the achievement to update.
 * @param {object} achievementData - The updated data for the achievement.
 * @param {string} apiKey - The API key for authorization.
 * @returns {Promise<object>} - The updated achievement.
 */
export const updateAchievement = (listId, achievementId, achievementData, apiKey) => {
  return axios.patch(`/api/lists/${listId}/achievements/${achievementId}`, achievementData, {
    headers: { 'x-api-key': apiKey },
  });
};

/**
 * Deletes an achievement.
 *
 * @param {string} achievementId - The ID of the achievement to delete.
 * @returns {Promise<void>}
 */
export const deleteAchievement = (listId, achievementId, apiKey) => {
  return axios.delete(`/api/lists/${listId}/achievements/${achievementId}`, {
    headers: { 'x-api-key': apiKey },
  });
};

/**
 * Uploads an image for an achievement.
 *
 * @param {string} listId - The ID of the achievement list.
 * @param {string} achievementId - The ID of the achievement.
 * @param {File} file - The image file to upload.
 * @param {string} apiKey - The API key for authorization.
 * @param {function} onUploadProgress - Callback for upload progress.
 * @returns {Promise<string>} - The URL of the uploaded image.
 */
export const uploadAchievementImage = (listId, achievementId, file, apiKey, onUploadProgress) => {
  const formData = new FormData();
  formData.append('image', file);

  return axios.post(`/api/lists/${listId}/achievements/${achievementId}/uploadImage`,
     formData, {
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  })
  .then(response => response.data.imageUrl);
};


