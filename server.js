/*********************************************************************************
 *  WEB322 – Assignment 06** I declare that this assignment is my own work in accordance with Seneca's* 
 * Academic Integrity Policy:** https://www.senecacollege.ca/about/policies/academic-integrity-policy.html**
 *  Name: _______________Leo Ru_______ Student ID: _____144337227_________ Date: ____Dec 10,2023__________** 
 * Published URL: __________________________________https://dull-gray-snail-tutu.cyclic.app

 * *********************************************************************************/

const express = require("express");
const clientSessions = require("client-sessions");
const authData = require("./modules/auth-service");
const app = express();
app.set("view engine", "ejs");
const HTTP_PORT = process.env.PORT || 8080;
const path = require("path");
const legoData = require("./modules/legoSets");
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(
  clientSessions({
    cookieName: 'session', // this is the object name that will be added to 'req'
    secret: process.env.session_Key, // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);
app.use((req,res,next)=>{
  app.locals.user=req.session.user; // copy session value for 'user' into app.locals so every .ejs has access.
  next();
})
app.use((req, res, next) => {res.locals.session = req.session;next();});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

app.get("/", (req, res) => {
  const filepath = path.join(__dirname, "views", "home.html");
  res.render("home");
});

app.get("/about", (req, res) => {
  const filepath = path.join(__dirname, "views", "about.html");
  res.render("about");
});

app.get("/lego/sets", async (req, res) => {
  try {
    const theme = req.query.theme;

    if (theme) {
      const filteredData = await legoData.getSetsByTheme(theme);
      if (filteredData.length === 0) {
        res.status(404);
      } else {
        // res.send(filteredData);
        res.render("sets", { sets: filteredData });
      }
    } else {
      const allData = await legoData.getAllSets();
      //res.send(allData);
      res.render("sets", { sets: allData });
    }
  } catch (err) {
    //res.status(404).render("404", {message: "Unable to find requested sets."});
    res
      .status(404)
      .render("404", { message: "Unable to find requested sets." });
  }
});

app.get("/lego/sets/:setNum", async (req, res) => {
  try {
    const setNum = req.params.setNum;

    const legodata = await legoData.getSetByNum(setNum);
    if (legodata) {
      //  res.send(legodata);
      res.render("set", { sets: legodata });
    }
  } catch (err) {
    // res.status(404).send("Error:  Unable to find requested set");
    res.status(404).render("404", { message: "Unable to find requested set." });
  }
});

app.get("/lego/addSet", ensureLogin,async (req, res) => {
  try {
    const themeData = await legoData.getAllThemes();
    res.render("addSet", { themes: themeData });
  } catch (error) {
    console.log(error);
  }
});
app.post("/lego/addSet",ensureLogin, async (req, res) => {
  try {
    const setData = req.body;

    await legoData.addSet(setData);
    res.redirect("/lego/sets");
  } catch (err) {
    console.error(err);
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

app.get("/lego/editSet/:num", ensureLogin,async (req, res) => {
  try {
    const setNum = req.params.num;

    const setData = await legoData.getSetByNum(setNum);
    const themeData = await legoData.getAllThemes();
    res.render("editSet", { themes: themeData, set: setData });
  } catch (error) {
    res.status(404).render("404", { message: "Cannot retrieve set" });
  }
});
app.post("/lego/editSet",ensureLogin, async (req, res) => {
  try {
    const setnum = req.body.set_num;
    const data = req.body;
    await legoData.editSet(setnum, data);
    res.redirect("/lego/sets");
  } catch (err) {
    console.error(err);
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

app.get("/lego/deleteSet/:num", ensureLogin,async (req, res) => {
  try {
    const setNum = req.params.num;

    await legoData.deleteSet(setNum);

    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

app.get("/login", (req, res) => {
  res.render("login", { errorMessage: "", userName: "" });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body).then(user => {
      req.session.user = {
          userName: user.userName,
          email: user.email,
          loginHistory: user.loginHistory
      };
      res.redirect('/lego/sets');
  }).catch(err => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
  });
});


app.get("/logout",async (req, res) => {
  try {
    req.session.reset();
    res.redirect('/')
  } catch (err) {
    res.render("Cannot logout");
  }
});

app.get("/userHistory",ensureLogin,async (req, res) => {
  try {
    res.render('userHistory');
  } catch (err) {
    res.render("Cannot logout");
  }
});

app.get("/register",async (req, res) => {
  try {
   
    res.render("register", {
      successMessage: "",
      errorMessage: "",
      userName: ""
    });
  } catch (err) {
    res.render("Cannot render register page",{message: '', userName: ''});
  }
});

app.post("/register", async (req, res) => {
  try {
    await authData.registerUser(req.body);
    
    res.render("register", {
      successMessage: "User created",
      errorMessage: "",
      userName: ""
    });
  } catch (err) {
    console.error(err);
    
    res.render("register", {
      successMessage: "",
      errorMessage: err,
      userName: req.body.userName
    });
  }
});




app.use((req, res, next) => {
  //res.status(404);
  // const filepath = path.join(__dirname, "views", "404.html");

  //res.render("404");
  res
    .status(404)
    .render("404", {
      message: "I'm sorry, we're unable to find what you're looking for.",
    });
});

legoData
  .initialize()
  .then(authData.initialize)
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log(`app listening on: ${HTTP_PORT}`);
    });
  })
  .catch(function (err) {
    console.log(`unable to start server: ${err}`);
  });
