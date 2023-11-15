require("dotenv").config();
const Sequelize = require("sequelize");

let sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

const Set = sequelize.define(
  "Set",
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

const Theme = sequelize.define(
  "Theme",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true, // use "project_id" as a primary key
      autoIncrement: true, // automatically increment the value
    },
    name: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

Set.belongsTo(Theme, { foreignKey: "theme_id" });

// const setData = require("../data/setData");
// const themeData = require("../data/themeData");

// let sets = [];

function initialize() {
  return new Promise(async (resolve, reject) => {
    // sets = [...setData];
    // sets.forEach((element) => {
    //   const found = themeData.find((index) => index.id == element.theme_id);
    //   let theme = found ? found.name : "";
    //   element.theme = theme;
    // });
    // resolve();
    try {
      await sequelize.sync();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function getAllSets() {
  return new Promise((resolve, reject) => {
    // resolve(sets);
    Set.findAll({ include: [Theme] })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject("Unable to find sets");
      });
  });
}
function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    // const found = sets.filter(
    //   (element) => element.theme.toUpperCase() === theme.toUpperCase()
    // );

    // if (found.length > 0) {
    //   resolve(found);
    // } else {
    //   reject("Unable to find requested set");
    // }
    Set.findAll({
      include: [Theme],
      where: { "$Theme.name$": { [Sequelize.Op.iLike]: `%${theme}%` } },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject("Unable to find requested sets");
      });
  });
}
function getSetByNum(setNum) {
  return new Promise(async (resolve, reject) => {
    // const found = sets.find((element) => setNum === element.set_num);
    // found ? resolve(found) : reject("unable to find requested set");

    let found = await Set.findAll({
      where: { set_num: setNum },
      include: [Theme],
    });

    found ? resolve(found[0]) : reject("Unable to find requested set");
  });
}

function addSet(setData) {
  return new Promise(async (resolve, reject) => {
    try {
      let newSet = await Set.create(setData);
      resolve(newSet);
    } catch (err) {
      console.error(err);
      reject("set_num must be unique");
    }
  });
}

function getAllThemes() {
  return new Promise(async (resolve, reject) => {
    Theme.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject("Unable to find themes");
      });
  });
}

function editSet(set_num, setData) {
  return new Promise(async (resolve, reject) => {
    try {
      const foundset = await getSetByNum(set_num);

      if (foundset) {
        await foundset.update(setData);
        resolve();
      } else {
        throw new Error("Set not found");
      }
    } catch (err) {
      console.error(err);
      reject(err.message);
    }
  });
}

function deleteSet(set_num) {
  return new Promise(async (resolve, reject) => {
    try {
      const setToDelete = await getSetByNum(set_num);

      if (setToDelete) {
        await setToDelete.destroy();
        resolve();
      } else {
        reject("Set not found");
      }
    } catch (err) {
      console.error(err);
      reject(err.message);
    }
  });
}


module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  getAllThemes,
  editSet,
  deleteSet,
};

// Code Snippet to insert existing data from Set / Themes

// sequelize
//   .sync()
//   .then( async () => {
//     try{
//       await Theme.bulkCreate(themeData);
//       await Set.bulkCreate(setData);
//       console.log("-----");
//       console.log("data inserted successfully");
//     }catch(err){
//       console.log("-----");
//       console.log(err.message);

//       // NOTE: If you receive the error:

//       // insert or update on table "Sets" violates foreign key constraint "Sets_theme_id_fkey"

//       // it is because you have a "set" in your collection that has a "theme_id" that does not exist in the "themeData".

//       // To fix this, use PgAdmin to delete the newly created "Themes" and "Sets" tables, fix the error in your .json files and re-run this code
//     }

//     process.exit();
//   })
//   .catch((err) => {
//     console.log('Unable to connect to the database:', err);
//   });
