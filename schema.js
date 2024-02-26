// mongo_schema.js
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  company_name: { type: String, required: true },
  expected_date: { type: Date },
  company_url: { type: String, default: null },
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

module.exports = { Company, User, Registration };
