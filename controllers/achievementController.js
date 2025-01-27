const s3 = require('../uploads/s3Client'); 
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
const AchievementList = require('../models/AchievementList');
const Player = require('../models/Player');


// Create a new Achievement and add it to a list (max 10)xs
exports.createAchievement = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title, description, type, progressGoal, isHidden, imageUrl } = req.body;

    // Validate required fields
    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required.' });
    }

    // Determine the next order value
    const lastAchievement = await Achievement.find({ listId }).sort({ order: -1 }).limit(1);
    const nextOrder = lastAchievement.length > 0 ? lastAchievement[0].order + 1 : 1;

    // Create new achievement with the determined order
    const newAchievement = new Achievement({
      listId,
      title,
      description,
      type,
      progressGoal: type === 'progress' ? progressGoal : null,
      isHidden,
      imageUrl,
      order: nextOrder, // Assign order
    });

    const savedAchievement = await newAchievement.save();

    // Optionally, add the achievement to the AchievementList's achievements array
    const achList = await AchievementList.findById(listId);
    if (achList) {
      achList.achievements.push(savedAchievement._id);
      await achList.save();
    }

    res.status(201).json(savedAchievement);
  } catch (err) {
    console.error('Error creating achievement:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


// Update an existing Achievement
exports.updateAchievement = async (req, res) => {
  try {
    const { listId, achievementId } = req.params;
    const { order, ...otherUpdates } = req.body; // Destructure order from updates

    // Convert achievementId from string to ObjectId
    const achievementObjectId = new mongoose.Types.ObjectId(achievementId);

    // Verify the list is correct for the API key
    if (req.apiKey.listId.toString() !== listId) {
      return res.status(403).json({ error: 'API key does not match this list' });
    }

    // Confirm the achievement is actually in that list
    const achList = await AchievementList.findById(listId);
    if (!achList) {
      return res.status(404).json({ error: 'AchievementList not found' });
    }
    if (!achList.achievements.some(aId => aId.toString() === achievementId)) {
      return res.status(404).json({ error: 'Achievement not found in this list' });
    }

    let updatedAch;

    // Fetch the current achievement before any updates
    const currentAchievement = await Achievement.findById(achievementObjectId);
    if (!currentAchievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    const originalType = currentAchievement.type;

    if (order !== undefined) {
      // Validate order
      if (!Number.isInteger(order) || order < 1) {
        return res.status(400).json({ error: 'Order must be a positive integer.' });
      }

      const currentOrder = currentAchievement.order;

      if (order !== currentOrder) {
        // Shift other achievements accordingly
        if (order > currentOrder) {
          // Decrement order of achievements between currentOrder+1 and order
          await Achievement.updateMany(
            { listId, order: { $gt: currentOrder, $lte: order } },
            { $inc: { order: -1 } }
          );
        } else {
          // Increment order of achievements between order and currentOrder-1
          await Achievement.updateMany(
            { listId, order: { $gte: order, $lt: currentOrder } },
            { $inc: { order: 1 } }
          );
        }

        // Update the order of the current achievement
        currentAchievement.order = order;
        await currentAchievement.save();

        updatedAch = currentAchievement;
      }
    }

    // Update other fields
    if (Object.keys(otherUpdates).length > 0) {
      updatedAch = await Achievement.findByIdAndUpdate(achievementObjectId, otherUpdates, { new: true });
    }

    if (!updatedAch) {
      return res.status(404).json({ error: 'Achievement not found or no updates applied' });
    }

    // Check if 'type' has changed
    const newType = updatedAch.type;
    if (newType !== originalType) {
      // Reset 'progress' and 'dateUnlocked' for all players associated with this achievement
      await Player.updateMany(
        { 'achievementsProgress.achievementId': achievementObjectId },
        {
          $set: {
            'achievementsProgress.$[elem].progress': 0,
            'achievementsProgress.$[elem].dateUnlocked': null
          }
        },
        {
          arrayFilters: [{ 'elem.achievementId': achievementObjectId }]
        }
      );

      console.log(`Achievement type changed for ID: ${achievementId}. Reset progress for all players.`);
    }

    return res.json(updatedAch);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};


// Delete an Achievement from the list
exports.deleteAchievement = async (req, res) => {
  try {
    const { listId, achievementId } = req.params;

    // Verify the list matches the API key
    if (req.apiKey.listId.toString() !== listId) {
      return res.status(403).json({ error: 'API key does not match this list' });
    }

    // 1) Remove from AchievementList
    const achList = await AchievementList.findById(listId);
    if (!achList) {
      return res.status(404).json({ error: 'AchievementList not found' });
    }

    const idx = achList.achievements.findIndex(aId => aId.toString() === achievementId);
    if (idx === -1) {
      return res.status(404).json({ error: 'Achievement not found in this list' });
    }
    achList.achievements.splice(idx, 1);
    await achList.save();

    // 2) Delete the actual Achievement doc
    const deletedAch = await Achievement.findByIdAndDelete(achievementId);
    if (!deletedAch) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    return res.json({ message: 'Achievement deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};
exports.getAchievementsForList = async (req, res) => {
  try {
    const { listId } = req.params;
    
    const achievementList = await AchievementList.findById(listId).populate({
      path: 'achievements',
      options: { sort: { order: 1 } }, // Sort by 'order' in ascending order
    });

    if (!achievementList) {
      return res.status(404).json({ error: 'Achievement List not found.' });
    }

    res.status(200).json(achievementList.achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Bulk Update Achievements (including the 'order' field)
exports.updateAchievements = async (req, res) => {
  try {
    const { listId } = req.params;
    const { achievements } = req.body;

    if (!Array.isArray(achievements)) {
      return res.status(400).json({ error: 'Achievements must be an array.' });
    }

    const updatedAchievements = [];

    for (const ach of achievements) {
      if (ach._id) {
        // Update existing achievement
        const updatedAch = await Achievement.findOneAndUpdate(
          { _id: ach._id, listId },
          {
            title: ach.title,
            description: ach.description,
            type: ach.type,
            progressGoal: ach.type === 'progress' ? ach.progressGoal : 1,
            isHidden: ach.isHidden,
            imageUrl: ach.imageUrl || '',
            order: ach.order !== undefined ? ach.order : 0, // Update 'order' if provided
          },
          { new: true }
        );

        if (!updatedAch) {
          return res.status(404).json({ error: `Achievement with ID ${ach._id} not found.` });
        }

        updatedAchievements.push(updatedAch);
      } else {
        // Create new achievement
        // Determine the highest current order to append the new achievement at the end
        const maxOrderAchievement = await Achievement.findOne({ listId }).sort('-order');
        const newOrder = maxOrderAchievement ? maxOrderAchievement.order + 1 : 1;

        const newAch = new Achievement({
          listId,
          title: ach.title,
          description: ach.description,
          type: ach.type,
          progressGoal: ach.type === 'progress' ? ach.progressGoal : 1,
          isHidden: ach.isHidden,
          imageUrl: ach.imageUrl || '',
          order: newOrder,
        });

        await newAch.save();
        updatedAchievements.push(newAch);

        // Also, add the achievement to the AchievementList
        await AchievementList.findByIdAndUpdate(listId, {
          $push: { achievements: newAch._id },
        });
      }
    }

    // After updates, ensure all achievements have unique and sequential 'order' values
    // Sort the achievements by 'order' and reassign orders to be sequential starting from 1
    const sortedAchievements = await Achievement.find({ listId }).sort('order');
    for (let i = 0; i < sortedAchievements.length; i++) {
      sortedAchievements[i].order = i + 1;
      await sortedAchievements[i].save();
    }

    // Fetch the updated achievements in the correct order
    const finalAchievements = await Achievement.find({ listId }).sort('order');

    res.status(200).json(finalAchievements);
  } catch (error) {
    console.error('Error in updateAchievements:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.uploadAchievementImage = async (req, res) => {
    try {
      const { listId, achievementId } = req.params;
  
      // 1) Verify the API key's listId matches the route param
      if (req.apiKey.listId.toString() !== listId) {
        return res
          .status(403)
          .json({ error: 'API key does not match this achievement list' });
      }
  
      // 2) Check the AchievementList exists and includes this achievement
      const achList = await AchievementList.findById(listId);
      if (!achList) {
        return res.status(404).json({ error: 'AchievementList not found' });
      }
  
      const idx = achList.achievements.findIndex(
        (aId) => aId.toString() === achievementId
      );
      if (idx === -1) {
        return res
          .status(404)
          .json({ error: 'Achievement not found in this list' });
      }
  
      // 3) Check if a file was provided
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }
  
      // 4) Retrieve the Achievement doc
      const achievementDoc = await Achievement.findById(achievementId);
      if (!achievementDoc) {
        return res.status(404).json({ error: 'Achievement not found' });
      }
  
      // 5) Prepare to upload to S3
      const fileContent = req.file.buffer; // from multer memoryStorage
      const ext = path.extname(req.file.originalname); // e.g. ".png"
      const s3Key = `achievements/${achievementId}_${Date.now()}${ext}`;
  
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME, // e.g. "mybucket"
        Key: s3Key,
        Body: fileContent,
        ContentType: req.file.mimetype
      };
  
      // 6) Upload to S3
      await s3.send(new PutObjectCommand(uploadParams));
  
      // 7) Build the final S3 URL
      const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
  
      // 8) Update the doc
      achievementDoc.imageUrl = imageUrl;
      await achievementDoc.save();
  
      return res.json({
        message: 'Image uploaded successfully!',
        imageUrl
      });
    } catch (err) {
      console.error('Error in uploadAchievementImage:', err);
      return res.status(500).json({ error: 'Server error.' });
    }
  };

  // controllers/achievementController.js
exports.reorderAchievements = async (req, res) => {
  try {
    const { listId } = req.params;
    const { orderedIds } = req.body; // Expect an array of achievement IDs in the desired order

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array.' });
    }

    // Verify API Key's listId
    if (req.apiKey.listId.toString() !== listId) {
      return res.status(403).json({ error: 'API key does not match this list' });
    }

    // Fetch current achievements to ensure all IDs are valid and belong to the list
    const achievements = await Achievement.find({ listId });
    const achievementIds = achievements.map(ach => ach._id.toString());

    // Check if all orderedIds exist in the list
    for (let id of orderedIds) {
      if (!achievementIds.includes(id)) {
        return res.status(400).json({ error: `Achievement ID ${id} does not exist in this list.` });
      }
    }

    // Check if all achievements are included
    if (orderedIds.length !== achievementIds.length) {
      return res.status(400).json({ error: 'orderedIds must include all achievements in the list.' });
    }

    // Update each achievement's order based on the array
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { order: index + 1 }, // Assuming order starts at 1
      },
    }));

    await Achievement.bulkWrite(bulkOps);

    // Fetch the updated achievements
    const updatedAchievements = await Achievement.find({ listId }).sort({ order: 1 });

    res.status(200).json(updatedAchievements);
  } catch (err) {
    console.error('Error reordering achievements:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};