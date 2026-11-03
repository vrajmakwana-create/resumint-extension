// Resumint Chrome Extension - Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('Resumint Chrome Extension successfully installed.')
})

// Listen for message requests from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'PING') {
    sendResponse({ status: 'PONG' })
    return true
  }
})

