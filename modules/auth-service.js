const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
let Schema = mongoose.Schema;
require("dotenv").config();

let userSchema = new Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let User; // to be defined on new connection (see initialize)

function initialize() {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(process.env.MONGODB);
    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
}

function registerUser(userData){
    return new Promise(function (resolve, reject) {
      bcrypt.hash(userData.password, 10).then(hash => {
        userData.password = hash;
  
        let newUser = new User(userData);
  
        newUser.save().then(() => {
          resolve(); 
        }).catch(err => {
          console.error(err);
          reject("There was an error creating the user.");
        });
  
      }).catch(err => {
        console.error(err);
        reject("There was an error encrypting the password");
      });
    });

}

function checkUser(userData) {
  return new Promise((resolve, reject) => {
    User.findOne({ userName: userData.userName }).then(user => {
      if (!user) {
        reject("Unable to find user: " + userData.userName);
        return;
      }
      bcrypt.compare(userData.password, user.password).then(result => {
        if (result) {
          resolve(user); 
        } else {
          reject("Incorrect Password for user: " + userData.userName);
        }
      }).catch(err => {
        console.error(err);
        reject("Error comparing passwords");
      });
        if (user.loginHistory.length === 8) {
              user.loginHistory.pop();
          }
          user.loginHistory.unshift({
              dateTime: new Date().toString(),
              userAgent: userData.userAgent
          });
          User.updateOne({ userName: user.userName }, { $set: { loginHistory: user.loginHistory } })
              .then(() => {
                  resolve(user); 
              })
              .catch(err => {
                  reject("There was an error verifying the user: " + err);
              });
    }).catch(err => {
      console.error(err);
      reject("Unable to find user: " + userData.userName);
    });
  });
}

module.exports = {
  initialize,
  registerUser,
  checkUser,
};