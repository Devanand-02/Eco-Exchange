const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("API key google");

// --- In-Memory Mock Database ---
let mockDatabase = [];
let idCounter = 0;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 430,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('demo.html');
}

app.whenReady().then(() => {
  // --- Set up all backend listeners here ---

  // 1. Handle request to get all offers
  ipcMain.handle('get-offers', () => {
    return mockDatabase;
  });

  // 2. Handle request to create a new offer
  ipcMain.handle('create-waste-offer', (event, offerData) => {
    const newOffer = {
      ...offerData,
      id: idCounter++,
      provider: 'Local Donor',
    };
    mockDatabase.push(newOffer);
    return { success: true, newOffer };
  });

  // 3. Handle request to get image tags from Gemini AI
  // The corrected block
ipcMain.handle('get-image-tags', async (event, imageBase64) => {
  try {
    // Use the new, updated model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); 
    
    const prompt = "What is in this image? Describe it using 3 to 5 short, comma-separated tags. For example: cardboard boxes, packaging, paper.";
    const imagePart = { inlineData: { mimeType: "image/jpeg", data: imageBase64.split(',')[1] }};
    const result = await model.generateContent([prompt, imagePart]);
    return { success: true, tags: result.response.text() };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { success: false, error: "Failed to get tags from AI." };
  }
});

  // After listeners are ready, create the window
  createWindow();

  // Handle macOS 'activate' event
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});