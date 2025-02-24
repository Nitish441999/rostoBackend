import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/auth.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(400, "Token is not valid");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await userModel
      .findById(decodedToken._id)
      .select("-password -refreshToken");

    if (!user) {
      throw new ApiError(400, "Invalid Access Token");
    }
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
export default verifyJWT;
