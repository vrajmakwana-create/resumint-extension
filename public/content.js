// Resumint Content Script: Intelligent Job Description & Company Extractor

function extractJobDetails() {
  let title = ''
  let company = ''
  let description = ''

  const url = window.location.href

  // 1. LinkedIn Job View
  if (url.includes('linkedin.com')) {
    title =
      document.querySelector('.job-details-jobs-unified-top-card__job-title')?.innerText ||
      document.querySelector('h1')?.innerText ||
      ''
    company =
      document.querySelector('.job-details-jobs-unified-top-card__company-name')?.innerText ||
      document.querySelector('.jobs-unified-top-card__company-name')?.innerText ||
      ''
    description =
      document.querySelector('#job-details')?.innerText ||
      document.querySelector('.jobs-description-content__text')?.innerText ||
      document.querySelector('.jobs-box__html-content')?.innerText ||
      ''
  }
  // 2. Indeed Job View
  else if (url.includes('indeed.com')) {
    title =
      document.querySelector('h1.jobsearch-JobInfoHeader-title')?.innerText ||
      document.querySelector('h1')?.innerText ||
      ''
    company =
      document.querySelector('[data-company-name="true"]')?.innerText ||
      document.querySelector('.jobsearch-CompanyInfoContainer')?.innerText ||
      ''
    description = document.querySelector('#jobDescriptionText')?.innerText || ''
  }
  // 3. Greenhouse Boards
  else if (url.includes('greenhouse.io')) {
    title = document.querySelector('.app-title')?.innerText || document.querySelector('h1')?.innerText || ''
    company = document.querySelector('.company-name')?.innerText || ''
    description = document.querySelector('#content')?.innerText || ''
  }
  // 4. Lever Jobs
  else if (url.includes('lever.co')) {
    title = document.querySelector('.posting-headline h2')?.innerText || document.querySelector('h1')?.innerText || ''
    company = document.querySelector('.main-header-logo img')?.alt || ''
    description = document.querySelector('.content')?.innerText || ''
  }
  // 5. Generic Fallback
  else {
    title = document.querySelector('h1')?.innerText || document.title || ''
    // Try to find large text block
    const mainEl = document.querySelector('main') || document.querySelector('article') || document.body
    const paragraphs = Array.from(mainEl.querySelectorAll('p, li')).map((p) => p.innerText.trim()).filter(Boolean)
    if (paragraphs.length > 5) {
      description = paragraphs.join('\n\n')
    }
  }

  return {
    job_title: title.trim(),
    company_name: company.trim(),
    job_description: description.trim(),
  }
}

// Listen for message from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_JD') {
    const details = extractJobDetails()
    sendResponse(details)
    return true
  }
})

