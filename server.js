/*********************************************************************************
 *  WEB322 – Assignment 03** I declare that this assignment is my own work in accordance with Seneca's* 
 * Academic Integrity Policy:** https://www.senecacollege.ca/about/policies/academic-integrity-policy.html**
 *  Name: _______________Leo Ru_______ Student ID: _____144337227_________ Date: ____Oct 11,2023__________** 
 * Published URL: ___________________________________________________________
 * *********************************************************************************/

const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const path = require("path");
const legoData = require("./modules/legoSets");
app.use(express.static("public"));

app.get("/", (req, res) => {
  const filepath = path.join(__dirname, "views", "home.html");
  res.sendFile(filepath);
});

app.get("/about", (req, res) => {
  const filepath = path.join(__dirname, "views", "about.html");
  res.sendFile(filepath);
});

app.get("/lego/sets", async (req, res) => {
  try {
    const theme = req.query.theme;

    if (theme) {
      const filteredData = await legoData.getSetsByTheme(theme);
      if (filteredData.length === 0) {
        res.status(404);
      } else {
        res.send(filteredData);
      }
    } else {
      const allData = await legoData.getAllSets();
      res.send(allData);
    }
  } catch (err) {
    res.status(404).send("Error: Unable to find requested set");
  }
});

app.get("/lego/sets/:setNum", async (req, res) => {
  try {
    const setNum = req.params.setNum;

    const legodata = await legoData.getSetByNum(setNum);
    if (legodata) {
      res.send(legodata);
    }
  } catch (err) {
    res.status(404).send("Error:  Unable to find requested set");
  }
});
app.use((req, res, next) => {
  res.status(404);
  const filepath = path.join(__dirname, "views", "404.html");

  res.sendFile(filepath);
});

legoData
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`server listening on: ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.log("unable to start the server: " + err);
  });
