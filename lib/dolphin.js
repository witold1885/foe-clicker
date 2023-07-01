const axios = require('axios')

const getDolphinProfilesData = async (token) => {
  const options = {
    url: 'https://anty-api.com/browser_profiles',
    headers: {
        Authorization: `Bearer ${token}`
    }
  }
  const { data } = await axios(options)
  return data.data
}

const openDolphinBrowser = async (profileId) => {
  try {
    const { data } = await axios(`http://localhost:3001/v1.0/browser_profiles/${profileId}/start?automation=1`)
    if (data.success) {
      return data.automation
    }
    else {
      console.error(`[ERROR] openDolphinBrowser: ${data.message}`)
    }
  } catch (e) {
    console.error(`[ERROR] openDolphinBrowser: ${e}`)
  }
}

const closeDolphinBrowser = async (profileId) => {
  try {
    await axios(`http://localhost:3001/v1.0/browser_profiles/${profileId}/stop`)
    return { success: true }
  } catch (e) {
    console.error(`[ERROR] closeDolphinBrowser: ${e}`)
    return { success: false, error: e.toString() }
  }
}

const closeOldPages = async (browser) => {
  if (browser) {
    const oldPages = await browser.pages()
    for await (const page of oldPages) {
      if (!await page.isClosed() && !page.uniqueId) {
        await page.waitForTimeout(100)
        await page.close()
      }
    }
  }
}

const delay = (duration) => {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

module.exports = {
  getDolphinProfilesData,
  openDolphinBrowser,
  closeDolphinBrowser,
  closeOldPages,
  delay
}
