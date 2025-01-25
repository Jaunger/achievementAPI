// utils/helper.js

// Copy text to clipboard
export const copyToClipboard = async (text) => {
    if (!navigator.clipboard) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; // Prevent scrolling to bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        throw new Error("Failed to copy text.");
      } finally {
        document.body.removeChild(textArea);
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };
  
  // Revert achievements to their original state
  export const revertAchievements = (current, originalMap) => {
    return current.map((ach) => {
      if (originalMap[ach._id]) {
        return { ...originalMap[ach._id] };
      }
      return ach; // For new achievements, keep as is
    });
  };