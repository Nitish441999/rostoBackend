import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/auth.model.js";

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

const users = {}; // Ensure this object exists at a global scope

const sendOTP = asyncHandler(async (req, res) => {
  const { mobile, fullName } = req.body;
  if (!mobile || !fullName) {
    throw new ApiError(400, "Mobile Number And Name are Required");
  }

  if (mobile.length !== 10) {
    throw new ApiError(400, "Invalid mobile number");
  }

  users[mobile] = process.env.STATIC_OTP || "123456"; // Store OTP

  res
    .status(200)
    .json(
      new ApiResponse(200, { otp: users[mobile] }, "OTP sent successfully")
    );
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { mobile, otp, fullName } = req.body;

  if (!mobile || !otp || !fullName) {
    throw new ApiError(400, "Mobile, Name, and OTP are required");
  }

  if (!users[mobile]) {
    throw new ApiError(401, "OTP expired or not sent")
  }

  if (users[mobile] !== otp) {
    throw new ApiError(401, "Inviled OTP")
  }

  let user = await User.findOne({ mobile });
  console.log(user);

  if (!user) {
    user = new User({ fullName, mobile });
    await user.save(); 
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  user.refreshToken = refreshToken;
  await user.save();

  delete users[mobile];

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

export { sendOTP, verifyOTP };
