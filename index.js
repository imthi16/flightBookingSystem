const express = require('express')
const bodyparser = require("body-parser")
const mongoose = require("mongoose")
let alert = require('alert');
var b = require("bcrypt")
const Joi = require('joi');
const app = express()
const router = express.Router();
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const passport = require('passport')
const LocalStrategy = require("passport-local").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");


var userid='';
var flightid='';
var seatno='';


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize())
app.use(passport.session())

const adminUsername = 'admin';
const adminPassword = 'password';
const s = 60;

// const isAuthenticated = (req, res, next) => {
//   if (req.session.isAuthenticated) {
//     next();
//   } else {
//     res.sendStatus(401);
//   }
// };

app.engine('html', exphbs({ extname: '.html' }));

const saltRounds = 10;
const salt = b.genSaltSync(saltRounds);

mongoose.connect('mongodb://localhost:27017/flightbooking',{
  useNewUrlParser: true,
})

// mongoose.set("useCreateIndex", true);

const flightDatabase_schema = new mongoose.Schema ({
  flightNumber: {
  type: String,
  required: true,
  unique: true,
  trim: true,
},
origin: {
  type: String,
  required: true,
},
destination: {
  type: String,
  required: true,
},
departureTime: {
  type: String,
  required: true,
},
departuredate: {
  type: String,
  required: true,
},
seatCount: {
    type: Number,
  }
});

const mybooking_schema = new mongoose.Schema({
  userid:String,
  flightid:String,
  seatno:Number
})



// Flight validation schema

const userDatabase_schema = new mongoose.Schema({
username: {
  type: String,
  // required: true,
  // unique: true,
},
password: {
  type: String,
  // required: true,
},
})


userDatabase_schema.plugin(passportLocalMongoose)

const all_flightDatabase = mongoose.model("flightDatabase",flightDatabase_schema);
const all_userdatabase = mongoose.model("userDatabase",userDatabase_schema);
const mybooking = mongoose.model("mybooking",mybooking_schema)


passport.use(new LocalStrategy(all_userdatabase.authenticate()));

passport.use(all_userdatabase.createStrategy())
passport.serializeUser(all_userdatabase.serializeUser())
passport.deserializeUser(all_userdatabase.deserializeUser())





passport.use(
  new LocalStrategy((username, password, done) => {
    // Replace this with your actual user retrieval logic from the database
    all_userdatabase.findOne({ username }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false);
      if (!b.compareSync(password, user.password))
        return done(null, false);
      return done(null, user);
    });
  })
);







passport.serializeUser((user, done) => {
  done(null, user.id);
});


passport.deserializeUser((id, done) => {
  // Replace this with your actual user retrieval logic from the database
  all_userdatabase.findById(id, (err, user) => {
    done(err, user);
  });
});


const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/signin'); // Redirect to the login page if user is not authenticated
};




app.get('/signup', (req, res) => {
  // if(req.isAuthenticated()){
  //   res.redirect('/signUp')
  // }else{
  //   res.redirect('/signin')
  // }
  res.sendFile(__dirname +'/public/html/signup.html')
})


app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await all_userdatabase.findOne({ username });
    if (existingUser) {
      return res.send(`<script>alert('Email already exists');window.location.href = '/Signup'</script>`);
    }

    const hashedPassword = await b.hash(password, 10);
    const newUser = new all_userdatabase({ username, password: hashedPassword });
    await newUser.save();

    res.send(`<script>alert('Signup successful'); window.location.href = '/signin';</script>`);
  } catch (error) {
    console.log(error);
    res.send(`<script>alert('Server error');window.location.href = '/signup'</script>`);
  }

  // console.log(req.body)
  //   all_userdatabase.register({username: req.body.email}, req.body.password, (err, user) => {
  //     if(err) {
  //       console.log(err);
  //       res.send('/signUp');
  //     } else {
  //       passport.authenticate('local')(req, res, () => {
  //         res.redirect('/');
  //       })
  //     }

    // const { username, password } = req.body;
    // // Replace this with your actual user creation logic and validation
    // const newUser = new all_userdatabase({
    //   username,
    //   password: b.hashSync(password, 10), // Hash the password
    // });
    //
    // // Save the new user to the database
    // newUser.save().then(()=>{
    //   passport.authenticate("local")(req, res, () => {
    //     res.redirect("/"); // Redirect to the home page or any other desired page
    //   });
    // }).catch ( err => {
    //
    //     console.error("Error registering user:", err);
    //     return res.redirect("/register");
    //   });
})













app.get('/', (req, res) => {
  res.sendFile(__dirname+"/index.html")
})


app.get('/signin',  (req, res) => {

	res.sendFile(__dirname+"/public/html/usersignin.html")
});

app.get('/admin', (req, res) => {
  res.sendFile(__dirname+"/public/html/adminadd.html")
})

app.get('/radmin', (req, res) => {
  res.sendFile(__dirname+"/public/html/adminremove.html")
})

app.get('/search', (req, res) => {
  res.sendFile(__dirname+"/public/html/flightser.html")
});

app.get('/adminlogin', (req, res) => {
  res.sendFile(__dirname+'/public/html/adminlogin.html')
});
app.get('/adminhome', (req, res) => {
  res.sendFile(__dirname+'/public/html/adminhome.html')
});

app.get('/adminlogin', (req, res) => {
  res.sendFile(__dirname+'/public/html/adminlogin.html')
});

app.get('/booking', (req, res) => {


    res.sendFile(__dirname + '/public/html/flightser.html');
});


// app.get('/b', (req, res) => {
//   const flights = all_flightDatabase.find({});
//
//   res.render('flight');
// });




  // all_flightDatabase.find({departureTime:'2023-06-23T15:52'}).then(results => {
  //   res.render('flight',{flightname:results["flightNumber"],seats:results.seatCount})
  // }).catch(err => {
  //   console.log(err);
  // });




app.post("/login", function(req, res){

  const user = new all_userdatabase({
    username: req.body.username,
    password: req.body.password
  });
  userid=req.body.username;
  req.login(user, function(err){
    if (err) {
      console.log(err);
      res.redirect('/sigin')
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/search");
      });
    }
  });

});






app.post('/signin',  async(req, res) => {
  try {
    const { username, password } = req.body;

    const user = await all_userdatabase.findOne({ username });
    userid=user.username
    console.log(userid);
    if (!user) {
      return res.send('<script>alert("Invalid credentials"); window.location.href = "/signin";</script>');

    }else if (!user) {
      res.status(404).send('User not found');
    }
    const isPasswordValid = await b.compare(password, user.password)
    if (!isPasswordValid) {
      return res.send('<script>alert("Invalid credentials"); window.location.href = "/signin";</script>');
    }



    res.send('<script>alert("Sign-in successful"); window.location.href = "/booking";</script>');
  } catch (error) {
    console.log(error);
    res.status(500).send('<script>alert("Server error");</script>');
  }

  // const { username, password } = req.body;
  //
  // console.log(username,password);
  // var user = new all_userdatabase({
  //   username:username,
  //   password:password
  // })
  // req.login(user, function(err) {
  //   if (err) {
  //     console.log(err);
  //    }
  //    else{
  //   passport.authenticate("local")(req, res, () => {
  //     res.redirect("/");
  //     // Redirect to the home page or any other desired page
  //   });
  // }
  // });


});




app.post('/flights', async (req, res) => {
  const { flightNumber, origin, destination, departureTime,departuredate } = req.body;

  // Validate the flight dat

  try {

    const newFlight = new all_flightDatabase({
      flightNumber,
      origin,
      destination,
      departureTime,
      departuredate,
      seatCount:s,
    });

    await newFlight.save();
    res.status(200).send('<script>alert("flight added successfully"); window.location.href = "/admin";</script>');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving flight to database');
  }


});




app.delete('/flights/:flightNumber', async (req, res) => {
  const flightNumber = req.params.flightNumber;

  try {

    const deletedFlight = await all_flightDatabase.findOneAndDelete({ flightNumber });

    if (deletedFlight) {
      res.status(200).send('Flight deleted successfully');
    } else {
      res.status(404).send('Flight not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});



app.get('/v', async (req, res) => {
  try {

    const flights = await all_flightDatabase.find();


    let tableHtml = '<table style="border: 1px solid black; width: 100%; text-align: center;"><thead><tr><th>Flight Number</th><th>Origin</th><th>Destination</th><th>Departure Time</th></th><th>Departure Date</th><th>seatCount</th></tr></thead><tbody>';
    flights.forEach((flight) => {
      tableHtml += `<tr><td style="border-bottom: 1px solid black;">${flight.flightNumber}</td><td style="border-bottom: 1px solid black;">${flight.origin}</td><td style="border-bottom: 1px solid black;">${flight.destination}</td><td style="border-bottom: 1px solid black;">${flight.departuredate}</td><td style="border-bottom: 1px solid black;">${flight.departureTime}</td><td style="border-bottom: 1px solid black;">${flight.seatCount}</td></tr>`;
    });
    tableHtml += '</tbody></table>';
    tableHtml += `<button type="submit" onclick="window.location='/adminhome'" style="background-color: #007bff; color: #fff; padding: 10px 20px; border: none; cursor: pointer; font-size: 16px; font-weight: bold; border-radius: 5px; animation: pulse 1.5s infinite;" >Back</button>`

    // Send the HTML table as the response
    res.send(tableHtml);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

app.post('/alogin', (req, res) => {
    var username = req.body.username
      var password =req.body.password

     try {
       if (username==="admin"&&password=='password') {

         res.redirect('/adminhome')
       } else {
         alert("Email or password is worng..")
         res.redirect('/adminlogin');
       }

     } catch (e) {
       console.log(e);
     }




})





app.post('/book', async (req, res) => {
  const { flightNumber, origin, destination, departureTime, seat } = req.body;

  // console.log(flightNumber, origin, destination, departureTime, seat);
  try {
    // Find the flight in the database
    const flight = await all_flightDatabase.findOne({ flightNumber, origin, destination, departureTime });





    if (!flight) {
      res.status(404).send('<script>alert("Flight not found"); window.location.href = "/search";</script>');
      return;
    }

    // Check if the seat is available
    if (flight.seatCount < seat) {
      res.status(409).send('<script>alert("No available seats on this flight"); window.location.href = "/search";</script>');
      return;
    }

    // Update the available seats and save the changes
    flightid=flight.flightNumber
    console.log(flightid);
    flight.seatCount -= seat;
    await flight.save();
    const booked = new mybooking ({
      userid:userid,
      flightid: flightid,
      seatno:seat
    })
    booked.save()
    // Return the response to the client
    res.send('<script>alert("Your seats booked........"); window.location.href = "/search";</script>');

  } catch (error) {
    console.error('Error booking flight:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }

  try {
    const flights = await all_flightDatabase.find({});
    res.sendFile(__dirname + '/public/flight-database.html');
  } catch (error) {
    console.error('Error retrieving flights:', error);
    res.status(500).send('Error retrieving flights');
  }
});





app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
  userid=''
});

// app.get('/search', (req, res) => {
//   const { origin, destination } = req.query;
//
//   // Perform search logic based on origin and destination
//
//   // For example, let's assume you have a flights collection in your database
//   // and you are searching for flights with matching origin and destination
//   const flights = all_flightDatabase.find({
//     origin: { $regex: origin, $options: 'i' },
//     destination: { $regex: destination, $options: 'i' },
//   });
//
//   res.render('flight', { flights });
// });
//





// Flight search route
app.get('/search', async (req, res) => {
  // Retrieve the search parameters from the query string
  const { origin, destination, departureTime } = req.query;

  try {
    // Perform the flight search logic
    // ...

    // Retrieve the matching flights from the flight database
    const flights = await all_flightDatabase.find({
      origin: { $regex: origin, $options: 'i' },
      destination: { $regex: destination, $options: 'i' },
      departureTime: { $gte: new Date(departureTime) }
    });

    // Generate the HTML markup for flight results
    let flightResultsHTML = '<h2>Flight Search Results</h2>';
    flightResultsHTML += '<ul>';
    flights.forEach(flight => {
      flightResultsHTML += `
        <li>
          <strong>Origin:</strong> ${flight.origin}<br>
          <strong>Destination:</strong> ${flight.destination}<br>
          <strong>Departure Date:</strong> ${flight.departureDate}<br>
          <hr>
        </li>
      `;
    });
    flightResultsHTML += '</ul>';

    // Send the flight results HTML as the response
    res.send(flightResultsHTML);
  } catch (error) {
    console.error('Error searching flights:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/mybook', async (req, res) => {
  try {
    const flights = await mybooking.find({ userid });

    if (flights.length === 0) {
      // If no flights found, display a message
      res.send(`<p>No bookings found.</p> <button type="submit" onclick="window.location='/booking'" style="background-color: #007bff; color: #fff; padding: 10px 20px; border: none; cursor: pointer; font-size: 16px; font-weight: bold; border-radius: 5px; animation: pulse 1.5s infinite;" >Back</button>`);

      return;
    }

    let tableHtml = '<table style="border: 1px solid black; width: 100%; text-align: center;"><thead><tr><th>User Name</th><th>Flight Name</th><th>Seat No</th></thead><tbody>';
    flights.forEach((flight) => {
      tableHtml += `<tr><td style="border-bottom: 1px solid black;">${flight.userid}</td><td style="border-bottom: 1px solid black;">${flight.flightid}</td><td style="border-bottom: 1px solid black;">${flight.seatno}</td></tr>`;
    });
    tableHtml += '</tbody></table>';
    tableHtml += `<button type="submit" onclick="window.location='/booking'" style="background-color: #007bff; color: #fff; padding: 10px 20px; border: none; cursor: pointer; font-size: 16px; font-weight: bold; border-radius: 5px; animation: pulse 1.5s infinite;" >Back</button>`

    // Send the HTML table as the response
    res.send(tableHtml);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});




// app.post('/show', (req, res) => {
//   // Retrieve form data from req.body
//   const flightNumber = req.body.flightNumber;
//   const origin = req.body.origin;
//   const destination = req.body.destination;
//   const departureTime = req.body.departureTime;
//   // const seat = req.body.seat;
//
//   // Perform database query or API request to fetch flights based on the form data
//   // Example database query using a hypothetical Flight model:
//   Flight.find({ flightNumber, origin, destination, departureTime })
//     .then((flights) => {
//       // Render the flights.html template and pass the flights as data
//       res.render('flights', { flights });
//     })
//     .catch((error) => {
//       console.log(error);
//       res.status(500).send('Error fetching flights');
//     });
// });
//




app.listen(3000, () => {
  console.log("port:3000");
})
