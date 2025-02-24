import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config({
  path: "./env",
});

// Connect to the database
const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    process.on("SIGINT", async () => {
      console.log("Server shutting down...");
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start the server:", error.message);
    process.exit(1); // Exit the process with failure code
  }
};

startServer();
