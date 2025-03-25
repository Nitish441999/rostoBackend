import asyncHandler from "../utils/asyncHandler.js";
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

const users = {};

const sendOTP = asyncHandler(async (req, res) => {
  const { mobile, fullName } = req.body;
  console.log("Body:", req.body);

  if (!mobile || !fullName) {
    return res.status(400).json({
      success: false,
      message: "Mobile Number And Name are Required",
    });
    // throw new ApiError(400, "Mobile Number And Name are Required");
  }

  if (mobile.length !== 10) {
    return res.status(400).json({
      success: false,
      message: "Invalid mobile number",
    });
    // throw new ApiError(400, "Invalid mobile number");
  }

  users[mobile] = process.env.STATIC_OTP || "123456";

  res.status(200).json(
    {
      success: true,
      message: "OTP sent successfully",
      otp: users[mobile],
    }
    // new ApiResponse(200, { otp: users[mobile] }, "OTP sent successfully")
  );
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { mobile, otp, fullName } = req.body;

  if (!mobile || !otp || !fullName) {
    return res.status(400).json({
      success: false,
      message: "Mobile, Name, and OTP are required",
    });
  }

  if (!users[mobile]) {
    return res.status(401).json({
      success: false,
      message: "OTP expired or not sent",
    });
  }

  if (users[mobile] !== otp) {
    return res.status(401).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  let user = await User.findOne({ mobile });

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

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      success: true,
      message: "OTP verified successfully",
      user,
      accessToken,
      refreshToken,
    });
});

export { sendOTP, verifyOTP };
