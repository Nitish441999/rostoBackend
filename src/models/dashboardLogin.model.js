import mongoose from "mongoose";

const dashboardLoginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["Admin", "superAdmin", "marketing"], 
  },
});

export default mongoose.model("DashboardLogin", dashboardLoginSchema);
