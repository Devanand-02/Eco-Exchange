const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process (demo.html)
// to use the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getImageTags: (imageBase64) => ipcRenderer.invoke('get-image-tags', imageBase64),
  getOffers: () => ipcRenderer.invoke('get-offers'),
  createWasteOffer: (offerData) => ipcRenderer.invoke('create-waste-offer', offerData),
});