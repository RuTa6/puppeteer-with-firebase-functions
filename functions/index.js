const express = require("express");
const functions = require("firebase-functions");
const cors = require("cors");
const puppeteer = require("puppeteer");
const fs = require("fs").promises;

const app = express();
app.use(cors({ origin: true }));

app.post("/", async (request, response) => {
  const url = request.body.url;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  console.log(url);
  try {
    console.log("inside try block");
    const page = await browser.newPage();
    console.log("browser launced");
    await page.goto(url, {
      waitUntil: "networkidle2",
    });
    console.log("near timeout");
    await page.waitForTimeout(2000);
    console.log("timeout finished");
    await page.addStyleTag({
      content: "@page { size: auto; }",
    });
    const buffer = await page.pdf();
    console.log("functions work");
    await browser.close();
    response.type(".pdf").send(buffer);
  } catch (e) {
    console.log("error occured:" + e);
  }
});
exports.widgets = functions
  .runWith({ memory: "2GB", timeoutSeconds: 360 })
  .https.onRequest(app);
