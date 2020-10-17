const puppeteer = require("puppeteer");

const takeAllianceScreenshot = async (guildId, id) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    `https://www.mmorpg-stat.eu/export_top_alliance.php?id=${encodeURIComponent(
      id
    )}`
  );

  const path = `${guildId}-topflop.png`;

  const image = await page.$("img");

  await image.screenshot({ path, omitBackground: true });

  await browser.close();

  return path;
};

module.exports = {
  takeAllianceScreenshot,
};
