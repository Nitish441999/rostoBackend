import mongoose from "mongoose";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, mobileNumber, role, password } = req.body;

  if (!fullName || !email || !mobileNumber || !role || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingEmployee = await User.findOne({ email });
  if (existingEmployee) {
    throw new ApiError(409, "Employee already exists");
  }
  console.log(req.file);

  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  console.log(avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarURL = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarURL) {
    throw new ApiError(400, "Failed to upload avatar file");
  }

  const newEmployee = await User.create({
    fullName,
    email,
    mobileNumber,
    role,
    password,
    avatar: avatarURL.url,
  });

  res
    .status(201)
    .json(new ApiResponse(201, newEmployee, "Employee added successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    throw new ApiError(400, "All fields are required");
  }

  const existingEmployee = await User.findOne({ email });

  if (!existingEmployee) {
    throw new ApiError(400, "Employee not found");
  }

  const isPasswordValid = await existingEmployee.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  if (existingEmployee.role !== role) {
    throw new ApiError(403, "Unauthorized role access");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    existingEmployee._id
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure only in production
    sameSite: "Strict",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken, user: existingEmployee },
        "Login successful"
      )
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  console.log("Authenticated user:", user);
  if (!user) {
    throw new ApiError(401, "User not authenticated");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const userLogout = asyncHandler(async (req, res) => {
  console.log(req.user._id);

  await User.findByIdAndUpdate(
    req.user._id,

    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const allusers = await User.find({});
  res
    .status(200)
    .json(new ApiResponse(200, allusers, "Get All User successful"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "ID is not valid");
  }
  await User.findByIdAndDelete(id);

  res.status(200).json(new ApiResponse(200, {}, "User deleteed successful"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { fullName, mobileNumber, role } = req.body;
  console.log(req.body);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "ID is not valid");
  }

  let user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "user Not found");
  }

  // Update user details
  user = await User.findByIdAndUpdate(
    id,
    {
      fullName,

      mobileNumber,
      role,
    },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"));
});

export {
  createUser,
  loginUser,
  getCurrentUser,
  changeCurrentPassword,
  userLogout,
  getAllUsers,
  deleteUser,
  updateUserDetails,
};
