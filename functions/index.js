const express = require("express");
const functions = require("firebase-functions");
const cors = require("cors");
const puppeteer = require("puppeteer");
require("fs").promises;

const app = express();
app.use(cors({ origin: true }));

app.post("/", async (request, response) => {
  const url = request.body.url;
  const option = request.body.option;
  const screenshotOption = request.body.screenshotOption;

  const viewPort = {
    viewPortHeight: request.body.viewPortHeight,
    viewPortWidth: request.body.viewPortWidth,
  };
  const clipSize = {
    x: request.body.x,
    y: request.body.y,
    clipHeight: request.body.clipHeight,
    clipWidth: request.body.clipWidth,
  };
  let screenshot;
  const pdfSize = request.body.pdfSize;
  const allPdfSize = {
    letter: {
      width: "215.9 mm",
      height: "279.4 mm",
    },
    a4: {
      height: "297 mm",
      width: "210 mm",
    },
    a5: {
      height: "210 mm",
      width: "148 mm",
    },
  };
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  console.log(url);
  try {
    const page = await browser.newPage();
    console.log("browser launced");
    await page.goto(url, {
      waitUntil: "networkidle2",
    });

    await page.waitForTimeout(2000);

    if (option === "screenshot") {
      await page.setViewport({
        height: viewPort.viewPortHeight,
        width: viewPort.viewPortWidth,
      });
      if (screenshotOption === "clip") {
        //clip
        screenshot = await page.screenshot({
          clip: {
            x: clipSize.x,
            y: clipSize.y,
            height: clipSize.clipHeight,
            width: clipSize.clipWidth,
          },
        });
      } else if (screenshotOption === "partialpage") {
        // partial page
        screenshot = await page.screenshot();
      } else {
        // default full page
        screenshot = await page.screenshot({
          fullPage: true,
        });
      }
      await browser.close(), response.type(".png").send(screenshot);
    } else {
      await page.addStyleTag({
        content: "@page { size: auto; }",
      });

      const buffer = await page.pdf({
        height: allPdfSize[pdfSize].height,
        width: allPdfSize[pdfSize].width,
      });

      await browser.close();
      response.type(".pdf").send(buffer);
    }
  } catch (e) {
    console.log("error occured:" + e);
  }
});
exports.widgets = functions
  .runWith({ memory: "2GB", timeoutSeconds: 360 })
  .https.onRequest(app);
