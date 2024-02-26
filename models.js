// models.js
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  company_name: { type: String, required: true },
  expected_date: { type: Date },
  company_url: { type: String },
});

const userSchema = new mongoose.Schema({
  company_name: { type: String, required: true },
  role: { type: String, required: true },
  applied_date: { type: Date },
  email: { type: String, required: true },
  status: { type: String, required: true },
});

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

const Company = mongoose.model("Company", companySchema);
const User = mongoose.model("User", userSchema);
const Registration = mongoose.model("Registration", registrationSchema);

const addCompany = async (companyData) => {
  try {
    const newCompany = await Company.create(companyData);
    console.log("New company added with id:", newCompany._id);
  } catch (error) {
    console.error("Error adding company:", error.message);
    throw error;
  }
};

const getAllCompanies = async () => {
  try {
    const companies = await Company.find();
    return companies;
  } catch (error) {
    throw error;
  }
};

const addUser = async (userData) => {
  try {
    const newUser = await User.create(userData);
    console.log("New user added with id:", newUser._id);
    return newUser;
  } catch (error) {
    console.error("Error adding user:", error.message);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  Company,
  User,
  Registration,
  addCompany,
  getAllCompanies,
  addUser,
  getAllUsers,
};
