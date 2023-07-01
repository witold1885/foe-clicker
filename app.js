const puppeteer = require('puppeteer-core')
const {
  getDolphinProfilesData,
  openDolphinBrowser,
  closeDolphinBrowser,
  closeOldPages,
  delay
} = require('./lib/dolphin')
const { installMouseHelper } = require('./lib/install-mouse-helper')
const { token, profileName, screenWidth, screenHeight, url, keyboard } = require('./lib/config')

const randomNumber = (min, max) => {
    return Math.random() * (max - min) + min
}

async function emulate () {
  const profilesData = await getDolphinProfilesData(token)
  const profile = profilesData.find(item => item.name == profileName)
  console.log(`Profile "${profileName}" (ID: ${profile.id}) launched`)

  await closeDolphinBrowser(profile.id)
  await delay(3000)
  const { port, wsEndpoint } = await openDolphinBrowser(profile.id)
  console.log('Dolphin browser opened')

  const puppeteerOptions = {
    browserWSEndpoint: `ws://127.0.0.1:${port}${wsEndpoint}`,
    args: [`--window-size=${screenWidth},${screenHeight}`],
    devtools: true
  }  
  const browser = await puppeteer.connect(puppeteerOptions)
  console.log('Puppeteer connected')

  const page = await browser.newPage()
  page.uniqueId = Date.now()
  console.log('New page created')

  await closeOldPages(browser)
  console.log('Old pages closed')

  await page.setViewport({
    width: screenWidth,
    height: screenHeight,
  })
  await installMouseHelper(page)
  await page.goto(url, { waitUntil: ['networkidle2', 'domcontentloaded'] })
  await page.exposeFunction('hotKeyPressed', async (keyCode) => {
    const hotKey = keyboard.find(item => item.key == keyCode)
    if (hotKey) {
      console.log('key pressed: ' + hotKey.name)
      const randomX = randomNumber(hotKey.minX, hotKey.maxX)
      const randomY = randomNumber(hotKey.minY, hotKey.maxY)
      console.log('randomX: ' + randomX)
      console.log('randomY: ' + randomY)
      await page.mouse.move(randomX, randomY)
      await page.mouse.click(randomX, randomY)
    }
  })
  console.log('The app is ready')

  page.on('load', async (response) => {
    await page.evaluate(() => {
      document.addEventListener('keydown', onKeyDown, false)
      async function onKeyDown(e) {
        await hotKeyPressed(e.keyCode)
      }
    })
  })  
}

emulate()

