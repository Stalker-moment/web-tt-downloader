const fs = require("fs");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const { type } = require("os");

const DEFAULT_THUMBNAIL_FOLDER = path.resolve(__dirname, "../file/thumbnail");

async function downloadVideo(url, filepath) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

function generateThumbnail(videoPath, thumbnailPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on("end", () => {
        console.log("Thumbnail created successfully");
        resolve();
      })
      .on("error", (err) => {
        console.error("Error generating thumbnail:", err);
        reject(err);
      })
      .screenshots({
        count: 1,
        folder: path.dirname(thumbnailPath),
        filename: path.basename(thumbnailPath),
      });
  });
}

async function randomChar() {
  //4 digit
  //generate random 10 digit
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function getThumbnail(videoUrl, type) {
  if (type === "image") {
    return { url: videoUrl, type: "image" };
  }
  const videoPath = path.resolve(__dirname, "video.mp4");
  let filename = await randomChar();
  const thumbnailPath = path.resolve(
    DEFAULT_THUMBNAIL_FOLDER,
    `${filename}.png`
  );

  try {
    console.log("Downloading video...");
    await downloadVideo(videoUrl, videoPath);
    console.log("Video downloaded successfully");

    console.log("Generating thumbnail...");
    await generateThumbnail(videoPath, thumbnailPath);
    console.log("Thumbnail generated successfully at:", thumbnailPath);

    //convert path to url
    const url = `https://tt.tierkun.my.id/thumbnail/${filename}.png`;

    return { url, type: "video" };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    // Clean up the downloaded video file
    fs.unlinkSync(videoPath);
  }
}

module.exports = {
  getThumbnail,
};
