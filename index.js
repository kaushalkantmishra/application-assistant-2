require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const {
  addCompany,
  getAllCompanies,
  addUser,
  getAllUsers,
  User,
  Registration,
  Company,
} = require("./models");

// Connect to MongoDB
// async function main() {
//   await mongoose.connect(
//     process.env.MONGO_URI
//   );
// }
// main()
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((err) => console.log(err));



mongoose.connect(process.env.MONGODB_URI).then(()=>{
  console.log("connected to mongoDB atls");
}).catch((err)=>console.log(err));

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// first route
app.get("/", (req, res) => {
  res.render("welcome.ejs");
});

// login route
app.get("/login", (req, res) => {
  res.render("login_page.ejs");
});

app.post("/login", async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await Registration.findOne({ name, email });

    if (user) {
      // Redirect to "/home" or another route after successful login
      res.redirect("/home");
    } else {
      // User not found, handle accordingly (e.g., show an error message)
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Error logging in");
  }
});

app.get("/register", (req, res) => {
  res.render("register_page.ejs");
});

app.post("/register", async (req, res) => {
  const { name, email } = req.body;

  try {
    const newRegistration = await Registration.create({ name, email });
    console.log("New registration added with id:", newRegistration._id);
    res.redirect("/login");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Error registering user: " + error.message);
  }
});

// home page code
app.get("/home", async (req, res) => {
  try {
    const companies = await getAllCompanies();
    res.render("home.ejs", { companies });
  } catch (error) {
    console.error("Error retrieving companies:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/company", async (req, res) => {
  try {
    const companies = await getAllCompanies();
    res.render("company.ejs", { companies });
  } catch (error) {
    console.error("Error retrieving companies:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/company", async (req, res) => {
  const { company_name, expected_date, company_url } = req.body;
  const companyData = {
    company_name,
    expected_date,
    company_url,
  };

  try {
    await addCompany(companyData);
    res.redirect("/company");
  } catch (error) {
    console.error("Error adding company:", error.message);
    res.status(500).send("Error adding company: " + error.message);
  }
});

// applied vacancy route
app.get("/applied_vacancy", (req, res) => {
  res.render("applied_vacancy.ejs");
});

app.post("/applied_vacancy", async (req, res) => {
  const { company_name, role, applied_date, email, status } = req.body;
  const userData = {
    company_name,
    role,
    applied_date,
    email,
    status,
  };

  try {
    await addUser(userData);
    res.redirect("/user_table");
  } catch (error) {
    console.error("Error adding user:", error.message);
    res.status(500).send("Error adding user: " + error.message);
  }
});

// user table route
app.get("/user_table", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.render("user_table.ejs", { users: users || [] });
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).send("Error retrieving user data");
  }
});

// delete user route
app.delete("/user_table/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    await User.findByIdAndDelete(userId);
    res.redirect("/user_table");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Error deleting user");
  }
});

// edit user route
app.get("/user_table/edit/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (user) {
      res.render("edit_user.ejs", { user });
    } else {
      res.render("edit_user.ejs", { user: null });
    }
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).send("Error retrieving user data");
  }
});

// update user route
app.put("/user_table/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { company_name, role, applied_date, email, status } = req.body;

  try {
    // Update user in the database using userId
    await User.findByIdAndUpdate(userId, {
      company_name,
      role,
      applied_date,
      email,
      status,
    });
    res.redirect("/user_table");
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).send("Error updating user data");
  }
});

app.delete("/company/:companyId", async (req, res) => {
  const companyId = req.params.companyId;

  try {
    const company = await Company.findById(companyId);
    if (!company) {
      res.status(404).send("Company not found");
      return;
    }

    // Delete associated users before deleting the company
    await User.deleteMany({ company_name: company.company_name });

    await Company.findByIdAndDelete(companyId);
    res.redirect("/company");
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).send("Error deleting company");
  }
});

// edit company route
app.get("/company/edit/:companyId", async (req, res) => {
  const companyId = req.params.companyId;

  try {
    const company = await Company.findById(companyId);

    if (!company) {
      // Company not found, handle accordingly (e.g., show an error message)
      res.status(404).send("Company not found");
      return;
    }

    res.render("edit_company.ejs", { company });
  } catch (error) {
    console.error("Error retrieving company data:", error);
    res.status(500).send("Error retrieving company data");
  }
});

// update company route
app.put("/company/:companyId", async (req, res) => {
  const companyId = req.params.companyId;
  const { company_name, expected_date } = req.body;

  try {
    // Update company in the database using companyId
    await Company.findByIdAndUpdate(companyId, { company_name, expected_date });
    res.redirect("/company");
  } catch (error) {
    console.error("Error updating company data:", error);
    res.status(500).send("Error updating company data");
  }
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on port ${process.env.PORT || 8080}`);
});
