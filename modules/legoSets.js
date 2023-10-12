const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

function initialize() {
  return new Promise((resolve, reject) => {
    sets = [...setData];
    sets.forEach((element) => {
      const found = themeData.find((index) => index.id == element.theme_id);
      let theme = found ? found.name : "";
      element.theme = theme;
    });
    resolve();
  });
}

function getAllSets() {
  return new Promise((resolve, reject) => {
    resolve(sets);
  });
}

function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
  const found = sets.find((element) => setNum === element.set_num);
  
    found ? resolve(found) : reject("unable to find requested set");
  });
}

function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    const found = sets.filter((element) =>
      element.theme.toUpperCase()===(theme.toUpperCase())
    );

    if (found.length > 0) {
      resolve(found); 
    } else {
      reject("Unable to find requested set");
    }
  });
}


module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };
