const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const nodemailer = require('nodemailer')
const { spawn } = require("child_process")

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load User model
const User = require("../../models/User");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    // change accordingly
    auth: {
      user: 'aggieregalert@gmail.com',
      pass: 'tamuaggie'
    }
});

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}   

// calling the scraper for a class and section

async function run() {
    while (true) {
        const docs = await User.find()
        for (let idx = 0; idx < docs.length; idx++) {
            let mailOptions = {
                from: 'aggieregalert@gmail.com',
                to: docs[idx]['email'],
                subject: 'Aggie Registration Alert',
                text: ''
            }

            const courses = docs[idx]['courses']

            for (let course_idx = 0; course_idx < courses.length; course_idx++) {
                
                const course_detail = courses[course_idx].split(" ")
                const department = course_detail[0]
                const course = course_detail[1]
                const section = course_detail[2]
                console.log(idx, department, course, section)

                // calling the scraper for a class and section
                // path should be based on where you run file, so we are running from server.js in this case
                const pythonProcess = spawn('python3', ["scraper/scraper_email.py", department, course, section])
                pythonProcess.stdout.on('data', (data) => {
                    data = parseInt(data.toString())
                    console.log(data)
                    if (data > 0) {
                        mailOptions["text"] = data + " seat(s) available for " + department + " " + course + "-" + section
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        })
                    } else {
                        mailOptions["text"] = "No seats are available for " + department + " " + course + "-" + section
                    }
                })
            }
            
            // await sleep(15000)
        }
        // 1 minute timeout currently
        await sleep(60000)
    }
}

run().catch(error => console.log(error.stack));

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  // Form validation

  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });

      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
  // Form validation

  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }

    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name
        };

        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

router.post("/get_section", function(req, res) {
    const courseInfo = req.body.course.split(" ")
    const pythonProcess = spawn('python3', ["scraper/scraper_section.py", courseInfo[0], courseInfo[1]])
    pythonProcess.stdout.on('data', (data) => {
        data = data.toString()
        res.send(data)
    })
})

// get user info by id
router.get("/:id", function(req, res) {
    User.findById(req.params.id, (error, data) => {
        if (error) return next(error)
        else return res.json(data)
    })
})

// add course by name
router.route('/add/:id').post(function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (!user)
            res.status(404).send("data is not found")
        else {
            //res.json(user)
            const currentCourses = user.courses
            currentCourses.push(req.body.course)
            user.courses = currentCourses
            user.save().then(user => {
                res.json("User updated")
            })
            .catch(err => {
                res.status(400).send("Update not possible " + err)
            })
        }
    })
})

//remove course by name
router.route('/remove/:id').post(function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (!user)
            res.status(404).send("data is not found")
        else {
            //res.json(user)
            const currentCourses = user.courses
            const idx = currentCourses.indexOf(req.body.course)
            currentCourses.splice(idx, 1)
            user.courses = currentCourses
            user.save().then(user => {
                res.json("User updated")
            })
            .catch(err => {
                res.status(400).send("Update not possible " + err)
            })
        }
    })
})

module.exports = router;
