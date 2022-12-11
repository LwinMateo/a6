const express = require('express');
const fs = require("fs");
const path = require('path');

const Sequelize = require('sequelize');

var sequelize = new Sequelize('didvdioz', 'didvdioz', 'hxdKTa1ypWJZdo0-zij-n7_9uHvAG08R', {
    host: 'raja.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});





// defind a model
var Employee = sequelize.define("Employee", {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
}, {
    createdAt: false,
    updatedAt: false
});

var Department = sequelize.define("Department",{
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
}, {
    createdAt: false,
    updatedAt: false
});





exports.initialize=function(){
    
    return new Promise(function (resolve, reject) {
        //reject();
        sequelize.sync().then(function(){
            console.log("Functions Initialized");
            resolve();
        }).catch(function(err){
            console.log("unable to sync the database", err);
            reject();
        });
    });
       
};

exports.getAllEmployees=function(){

    return new Promise((res, rej) => {
        Employee.findAll().then((data) => {
          if (data) {
            res(data);
          } else {
            rej("No results returned from Database.");
          }
        });
    });
       
};


exports.getManagers=function(){
    return new Promise((res, rej) => {
        sequelize.sync().then(() => {
          Employee.findAll({ where: { isManager: true } }).then((data) => {
            if (data) {
              res(data);
            } else {
              rej("No results returned from Database.");
            }
          });
        });
      });
};

exports.getDepartments=function(){
    return new Promise((res, rej) => {
        Department.findAll().then((data) => {
          if (data) {
            res(data);
          } else {
            rej("No results returned from Database.");
          }
        });
      });
};


exports.addEmployee = function(employeeData){
    

    return new Promise((res, rej) => {
        if (employeeData) {
          employeeData.isManager = employeeData.isManager ? true : false;
    
          for (const attr in employeeData) {
            if (employeeData[attr] == " ") {
              employeeData[attr] = null;
            }
          }
    
          sequelize.sync().then(() => {
            Employee.create(employeeData)
              .then(() => {
                res("success!");
              })
              .catch((err) => {
                rej("Something went wrong" + err);
              });
          });
        } else {
          rej("Bad data given to addEmployee, unable to create employee");
        }
      });
};


// UPDATES
exports.getEmployeeByStatus = (emp_status) => {
    return new Promise((res, rej) => {
      sequelize.sync().then(() => {
        Employee.findAll({ where: { status: emp_status } })
          .then((data) => {
            if (data.length == 0) {
              rej("no match found of status given.");
            } else {
              res(data);
            }
          })
          .catch((err) => {
            rej("no results returned from getEmployeesByStatus");
          });
      });
    });
  };
  

exports.getEmployeesByDepartment = function(department){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function(){
            Employee.findAll({where:{department : department}}).then((employee) => {
                resolve(employee);
            }).catch(function(err){
                console.log("No results in ", err);
            });
        }).catch(function(err){
            console.log("unable to sync the database", err);
            reject();
        });
    });
       
};

exports.getEmployeesByManager = function(manager){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function(){
            Employee.findAll({where:{employeeManagerNum: manager}}).then((employee) => {
                resolve(employee);
            }).catch(function(err){
                console.log("No results in ", err);
            });
        }).catch(function(err){
            console.log("unable to sync the database", err);
            reject();
        });
    });
       
}; 

exports.getEmployeeByNum = function(num){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function(){
            Employee.findAll({where:{employeeNum: num}}).then((employee) => {
                resolve(employee[0]);
            }).catch(function(err){
                console.log("No results in ", err);
            });
        }).catch(function(err){
            console.log("unable to sync the database", err);
            reject(err);
        });
    });
       
};

exports.updateEmployee = function(employeeData){
    

    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;

        for(var key in employeeData){
            if(employeeData[key] == " "){
                employeeData[key] = null;
            }
        }
        sequelize.sync().then(function(){
           Employee.update(employeeData,{where : {employeeNum : employeeData.employeeNum}}).then(function(emp){
                resolve(emp);
           }).catch(function(err){
                console.log("unable to update employee");
                reject(err);
           });
        }).catch(function(err){
            console.log("unable to sync the database", err);
            reject();
        });
    });
       
}




// additional functions
exports.addDepartment = function(departmentData){
    

    return new Promise(function (resolve, reject) {
        for(let key in departmentData){
            if(departmentData[key] == ""){
                departmentData[key] = null;
            }
        }
        sequelize.sync().then(function(){
           Department.create(departmentData).then(function(dep){
                resolve(dep);
           }).catch(function(err){
                console.log("unable to create department");
                reject(err);
           });
        }).catch(function(err){
            console.log("unable to sync the database", err);
            reject();
        });
    });
};

exports.updateDepartment = function(departmentData){
    

    return new Promise(function (resolve, reject) {
        for(let key in departmentData){
            if(departmentData[key] == ""){
                departmentData[key] = null;
            }
        }

        sequelize.sync().then(function(){
            //employeeData,{where : {employeeNum : employeeData.employeeNum}}
           Department.update(departmentData, {where : {departmentId : departmentData.departmentId}}).then(function(dep){
                resolve(dep);
           }).catch(function(err){
                console.log("unable to update department");
                reject(err);
           });
        }).catch(function(err){
            console.log("unable to sync the database", err);
            reject();
        });
    });

};

exports.getDepartmentById = function(id){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function(){
            Department.findAll({where:{departmentId : id}}).then((department) => {
                resolve(department[0]);
            }).catch(function(err){
                console.log("No results returned");
            });
        }).catch(function(err){
            console.log("unable to sync the database", err);
            reject(err);
        });
    });
}


// DELETING
module.exports.deleteEmployeeByNum = (empNum) => {
    return new Promise((res, rej) => {
      sequelize.sync().then(() => {
        Employee.destroy({ where: { employeeNum: empNum } })
          .then(() => {
            res();
          })
          .catch((err) => {
            rej(err);
          });
      });
    });
  };


sequelize.authenticate().then(()=> console.log('Connection success.'))
.catch((err)=>console.log("Unable to connect to DB.", err));