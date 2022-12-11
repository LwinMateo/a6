var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const bcrypt = require("bcrypt");

mongoose.set('debug', true);

var userSchema = new Schema({
    "userName" : {
        type : String,
        unique : true
    },
    "password" : String,
    "email" : String,
    "loginHistory" : [{ "dateTime" : Date, "userAgent" : String }]

});

let User = mongoose.model("users", userSchema);

exports.initialize=function(){
    
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://LwinMateo:Lwin2022@assignment6.dfvje3p.mongodb.net/assignment_6", { useNewUrlParser : true});

        db.on('error', (err)=> { 
            reject(err);
        });

        db.once('open', ()=>{
            User = db.model("users", userSchema);
            console.log("Successful connection!");
            resolve();
        });
    });
       
};

exports.registerUser=function(userData){
    return new Promise(function (resolve, reject) {
        if(userData.password.trim().length === 0 || userData.password2.trim().length === 0 || !userData.password.replace(/\s/g, '').length || !userData.password2.replace(/\s/g, '').length){
            reject("Error: user name cannot be empty or only white spaces!")
        }
        else if(userData.password != userData.password2){
            reject("Error: Passwords do not match");
        }
        else{
            let newUser = new User(userData);
            bcrypt
              .hash(newUser.password, 10)
              .then((hash) => {
                newUser.password = hash;
      
                newUser
                  .save()
                  .then(() => {
                    resolve();
                  })
                  .catch((err) => {
                    if (err.code == 1100) {
                      reject("User Name already taken");
                    } else {
                      reject("There was an error creating the user: " + err);
                    }
                  });
              })
              .catch((err) => {
                reject("There was an error encrypting the password");
              });
        }
    });
}

exports.checkUser = function(userData){

    return new Promise(function (resolve, reject) {

        User.findOne({ userName: userData.userName })
      .exec()
      .then((result) => {
        if (result) {
          bcrypt
            .compare(userData.password, result.password)
            .then((evaluation_result) => {
              if (!evaluation_result) {
                reject("Wrong password for user: " + userData.userName);
              } else {
                result.loginHistory.push({
                  dateTime: new Date().toString(),
                  userAgent: userData.userAgent,
                });

                User.updateOne(
                  { userName: result.userName },
                  { $set: { loginHistory: result.loginHistory } }
                )
                  .exec()
                  .then((updatedValue) => {
                    if (updatedValue) {
                      resolve(result);               
                    }
                  })
                  .catch((err) => {
                    reject(err);
                  });
              }
            });
        } else {
          rej("Unable to find user: " + userData.userName);
        }
      });
    });

}

