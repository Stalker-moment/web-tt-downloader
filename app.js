const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs"); // Tambahkan baris ini
const path = require("path");
const fs = require("fs");
const Tiktok = require("tiktokapi-src");

const app = express();
const port = 3000;

app.set("view engine", "ejs"); // Tambahkan baris ini untuk mengatur mesin tampilan EJS
app.use(express.static("public")); // Tambahkan baris ini untuk mengizinkan penggunaan file statis (misalnya: CSS)

app.use(bodyParser.urlencoded({ extended: true }));

const getId = require("./function/getId");
const { getThumbnail } = require("./function/getThumbnail");

app.get("/", (req, res) => {
  res.render("index"); // Mengubah ini untuk merender halaman EJS bernama 'index'
});

app.post("/", async (req, res) => {
    const { url } = req.body;
    try {
      const result = await Tiktok.Downloader(url, { version: "v2" });
      console.log(result);
  
      let updatedMedia;
  
      if (result.result.type === "image") {
        updatedMedia = {
          ...result.result,
          media: await Promise.all(
            result.result.images.map(async (item) => {
              const thumbnailResult = await getThumbnail(item, result.result.type);
              return {
                url: item,
                thumbnail: thumbnailResult.url,
                type: thumbnailResult.type,
              };
            })
          ),
        };
      } else {
        const thumbnailResult = await getThumbnail(result.result.video, result.result.type);
        updatedMedia = {
          ...result.result,
          media: [
            {
              url: result.result.video,
              thumbnail: thumbnailResult.url,
              type: thumbnailResult.type,
            },
          ],
        };
      }
  
      console.log(updatedMedia);
      res.render("thumbnails", { data: updatedMedia });
    } catch (error) {
      console.log("Gagal mendapatkan data dari URL:", url);
      console.error(error);
      res.render("404_production"); // Buat halaman EJS bernama '404_production' untuk menampilkan pesan kesalahan
    }
  });
  

app.get("/thumbnail/:name", (req, res) => {
  const { name } = req.params;
  const filePath = path.join(__dirname, "file", "thumbnail", name);
  console.log(filePath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found.");
  }

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Error sending file.");
    }
  });
});

app.use((req, res, next) => {
  if (req.method === "GET") {
    res.status(404).render("404_production");
  } else {
    res.status(404).json({
      code: 404,
      message: "Not Found",
    });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
