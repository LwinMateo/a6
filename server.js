/*********************************************************************************
* BTI325 – Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: _Lwin Yonal Mateo Lopez__________________ Student ID: ____134710201__________ Date: ___12-10-2022____________
*
* Online (Heroku Cyclic) Link: ___https://determined-teal-top-coat.cyclic.app
_____________________________________________
*
********************************************************************************/ 


const express = require("express");
const app = express();
// multer module
const multer = require("multer");
const path = require("path");

const exphbs = require('express-handlebars');

const clientSessions = require("client-sessions");

//include "fs" module
const fs = require("fs");
//const bodyParser = require("body-parser");
const dataService = require("./data-service.js");

const dataServiceAuth = require("./data-service-auth.js");


app.use(express.json());
app.use(express.urlencoded({extended:true}));



//app.engine(".hbs", exphbs.engine({ extname: ".hbs",  defaultLayout: "main"}));
app.engine(".hbs", exphbs.engine({ extname: ".hbs",  

    helpers:{
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +'><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
        }, 

        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
            return options.inverse(this);
            } else {
            return options.fn(this);
            }
        } 
    }
}));


app.set("view engine", ".hbs");




app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});
   


// a new USE
app.use(clientSessions({
    cookieName: "session",
    secret: "BTI325_Lwin_A6",
    duration: 2 * 60 * 100,
    activeDuration: 1000 * 60
}));

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart(){
    console.log("Express http server listening on: ", HTTP_PORT);
}



function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
}


app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});



app.get("/", function(req, res){
    //res.sendFile(path.join(__dirname, 'views/home.html'));
    res.render("home");
})

app.get("/about", function(req, res){
    //res.sendFile(path.join(__dirname, 'views/about.html'));
    res.render("about");
})


// additional routes
app.get("/employees", ensureLogin, function(req, res){
    dataService
    .getAllEmployees()
    .then((data) => {
      if (req.query.status) {
        dataService
        
          .getEmployeeByStatus(req.query.status)
          .then((data) => {
            if (data.length > 0) {
              res.status(200).render("employees", { employees: data });
            } else {
              res.render("employees", { message: "no results" });
            }
          })
          .catch((err) => {
            res.render("employees", { message: "no results" });
          });
      } else if (req.query.department) {
        dataService
          .getEmployeesByDepartment(req.query.department)
          .then((data) => {
            if (data.length > 0) {
              res.status(200).render("employees", { employees: data });
            } else {
              res.render("employees", { message: "no results" });
            }
          })
          .catch((err) => {
            res.render("employees", { message: "no results" });
          });
      } else if (req.query.manager) {
        dataService
          .getEmployeesByManager(req.query.manager)
          .then((data) => {
            if (data.length > 0) {
              res.status(200).render("employees", { employees: data });
            } else {
              res.render("employees", { message: "no results" });
            }
          })
          .catch((err) => {
            res.render("employees", { message: "no results" });
          });
      } else {
        if (data.length > 0)
          res.status(200).render("employees", { employees: data });
        else res.render("employees", { message: "no results" });
      }
    })
    .catch((err) => {
      res.status(404).render({ message: "no results" });
    });
  
});


app.get("/managers", ensureLogin ,function(req, res){
    
    dataService.getManagers().then((data) => {
        if(data.length > 0){
            res.render("managers", {data: data});
        }
        else{
            res.render("managers", {message: "no results"});
        }

        //res.json({data});
    }).catch(function(err){
        res.render({message: "no results"});
    });
});

app.get("/departments", ensureLogin ,function(req, res){
    
    dataService.getDepartments().then((data) => {
        if (data.length > 0){
            res.render("departments", {data : data});
          }
          else{
            res.render("departments", {data : "No results"});
          }
      }).catch((err) => {
        //res.render({message: "no results"});
        res.render("departments" , {data: err});
    });
})


// new servers
app.get("/employees/add", ensureLogin, function(req, res){
    dataService
    .getDepartments()
    .then((data) => {
      if (data) {
        res.status(200).render("addEmployee", { departments: data });
      } else {
        res.status(404).send(err);
      }
    })
    .catch((err) => {
      res.status(200).render("addEmployee", { departments: [] });
    });
});


app.post("/register", function(req, res){
    dataServiceAuth.registerUser(req.body).then(()=>{
        res.render("register", {successMessage: "User created"});
    }).catch((err)=>{
        res.render("register", {errorMessage: err, userName: req.body.userName})
    });
});


app.post("/login", function(req, res){
    req.body.userAgent = req.get('User-Agent');

    dataServiceAuth.checkUser(req.body).then(function(user){
        req.session.user = {
            userName : user.userName,
            email : user.email,
            loginHistory : user.loginHistory
        }

        res.redirect('/employees');
    }).catch(function(err){
        res.render("login", {errorMessage: err, userName: req.body.userName});
    });
});

app.get("/logout", function(req, res){
    res.session.reset();
    res.redirect("/");
});

app.get("/userHistory", ensureLogin, function(req, res){
    res.render("userHistory");
});




app.post("/employees/add", ensureLogin, function(req, res){
    dataService
    .addEmployee(req.body)
    .then(() => {
      res.status(200).redirect("/employees");
    })
    .catch((err) => {
      console.log(err);
    });

});

app.get("/employee/:empNum", ensureLogin, function(req, res){
    // initialize an empty object to store the values
    let viewData = {};
    dataService.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }}).catch(() => {
                viewData.employee = null; // set employee to null if there was an error
        }).then(dataService.getDepartments).then((data) => {
                viewData.departments = data; 
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = []; // set departments to empty if there was an error
        }).then(() => {
            if (viewData.employee == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", { viewData: viewData }); // render the "employee" view
            }
        });
       
       
});


app.get("/images/add", ensureLogin, function(req,res){
    //res.sendFile(path.join(__dirname, 'views/addImage.html'));
    res.render("addImage");
});


/////////////
// multer variables
/////////////
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


// serving photos
app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});


// image route
app.get("/images", ensureLogin ,function(req, res){
    fs.readdir("./public/images/uploaded", (err, items) => {
        if (err) {
          res.status(404);
        } else {
          let arr = [{}];
          for (let i = 0; i < items.length; ++i) {
            arr[i] = { name: items[i] };
          }
    
          res.render("images", { data: arr });
        }
      });
});


app.get("/*", function(req, res){
    
    //res.status(404).send("Page Not Found");
    res.status(404).sendFile(path.join(__dirname, 'views/error.html'));
})




app.post("/employee/update", ensureLogin, (req, res) => {
    dataService.updateEmployee(req.body).then(function(){
        console.log(req.body);
        res.redirect("/employees");
  
    }).catch(function(err){
        res.status(404).send("Unable to Update Employee");
        res.send(err);
  
    })
});


// additional routes

app.get("/departments/add", ensureLogin, (req, res) => {
    res.render("addDepartment");
});

app.post("/departments/add", ensureLogin, (req, res) => {
    dataService.addDepartment(req.body).then(() => {
        res.redirect("/departments");
    })
});

app.post("/departments/update", ensureLogin, (req, res) => {
    dataService.updateDepartment(req.body).then(() => {
        res.redirect("/departments");
    })
    .catch((err)=>{
        
        res.status(500).send("ERROR: Unable to Update Department.");
      
    });
});

app.get("/department/:departmentId", ensureLogin, (req, res) => {
    /*dataService.getAllEmployees(req.params).then((data) => {
        res.render("employee", { employee: data[0] });
    }).catch((err) => {
        res.render("employee",{error: err});
    });*/ 
    dataService.getDepartmentById(req.params.departmentId).then((data) => {
        res.render("department", { department : data[0] });
    }).catch((err)=>{
        res.status(404).send("Department Not Found");
    });
});


// delete route
app.get("/employees/delete/:empNum", ensureLogin ,(req, res) => {
    if (req.params.empNum) {
      dataService
        .deleteEmployeeByNum(req.params.empNum)
        .then(() => {
          res.redirect(301, "/employees");
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    } else {
      res.status(500).send("Unable to remove Employee / Employee not found");
    }
  });



// to get connected to server
//app.listen(HTTP_PORT, onHttpStart);
/*dataService.initialize().then(function(){
    app.listen(HTTP_PORT, onHttpStart);
}).catch(function(err){
    console.log('Initilization Failed! ', err);
});*/

dataService.initialize()
.then(dataServiceAuth.initialize)
.then(function(){
    app.listen(HTTP_PORT, onHttpStart);
}).catch(function(err){
    console.log("unable to start server: " + err);
});

