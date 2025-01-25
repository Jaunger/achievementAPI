// utils/apiUtil.js
import axios from 'axios';

export const createAchievement = (listId, achievementData, apiKey) => {
  return axios.post(`/api/lists/${listId}/achievements`, achievementData, {
    headers: { 'x-api-key': apiKey },
  });
};

export const updateAchievement = (listId, achievementId, achievementData, apiKey) => {
  return axios.patch(`/api/lists/${listId}/achievements/${achievementId}`, achievementData, {
    headers: { 'x-api-key': apiKey },
  });
};

export const deleteAchievement = (listId, achievementId, apiKey) => {
  return axios.delete(`/api/lists/${listId}/achievements/${achievementId}`, {
    headers: { 'x-api-key': apiKey },
  });
};

export const uploadAchievementImage = (listId, achievementId, file, apiKey, onUploadProgress) => {
  const formData = new FormData();
  formData.append('image', file);

  return axios.post(`/api/lists/${listId}/achievements/${achievementId}/uploadImage`, formData, {
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  })
  .then(response => response.data.imageUrl);
};