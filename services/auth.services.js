
const { createResponse, formatResponse } = require("../handlers/utility");
const validate = require("../handlers/validationSchemas");
const { BaseError } = require("../handlers/errorHandling");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { wellComeEmail } = require("../services/mail.services");



async function register(data) {
  const { firstName, lastName, email, password } = data;
  const response = validate.registerUserSchema.validate({
    firstName,
    lastName,
    email,
    password,
  });

  if (typeof response.error !== "undefined") {
    return createResponse(response);
  }

  const oldUser = await User.findOne({ email });

  if (oldUser) {
    throw new BaseError("User already exist", 400);
  }

  async function generateCode() {
    let str = parseInt(Math.random() * 1000000);
    if (await User.findOne({ emailVerifyToken: str })) {
      generateCode();
      return;
    }
    return str;
  }

  const emailVerifyToken = await generateCode();


  await User.create({
    firstName,
    lastName,
    emailVerifyToken,
    email: email.toLowerCase(), // sanitize: convert email to lowercase
    password: await bcrypt.hash(password, 10),
  });

  wellComeEmail({
    firstName,
    lastName,
    email,
    emailVerifyToken,
    verifyEmailLink: `${process.env.APP_URL}`,
  });

  return formatResponse(
    201,
    "Success",
    "Plz verify your account. Minthouse sent you a six digit code"
  );
}
const verifyEmail = async ({ verifyEmailToken }) => {
  const response = validate.verifyEmailSchema.validate({
    verifyEmailToken,
  });
  if (typeof response.error !== "undefined") {
    return createResponse(response);
  }

  const user = await User.findOne({ emailVerifyToken: verifyEmailToken });
  if (!user) throw new BaseError("Invalid token", 404);
  await User.findOneAndUpdate(
    { _id: user._id },
    {
      $set: {
        emailVerifyToken: null,
        isEmailVerified: true,
      },
    }
  );
  return formatResponse(201, "Success", "User Verified Successfully");
};
async function login(data) {
  const { email, password } = data;

  if (!(email && password)) {
    throw new BaseError("Email and password is required", 404);
  }
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_TOKEN_KEY,
      {
        expiresIn: "48h",
      }
    );

    return formatResponse(200, "Success", "Login Successfully", {
      token,
      user,
    });
  }
  throw new BaseError("Invalid credentials", 404);
}

const changePassword = async (data, _id) => {
  const {password}= data;
  const response = validate.changePasswordSchema.validate({
    password,
  });
  if (typeof response.error !== "undefined") {
    return createResponse(response);
  }
  await User.findOneAndUpdate(
    { _id },
    {
      $set: {
        password: await bcrypt.hash(password, 10),
      },
    }
  );
  return formatResponse(201, "Success", "Password Updated Successfully");
};
const forgotPassword = async (data) => {
  const { email } = data;

  const user = await User.findOne({ email });

  if (!user) {
    throw new BaseError("User with this email not exist", 400);
  }
  async function generateCode() {
    let str = parseInt(Math.random() * 1000000);
    if (await User.findOne({ resetVerifyToken: str })) {
      generateCode();
      return;
    }
    return str;
  }

  const resetVerifyToken = await generateCode();

  await User.findOneAndUpdate(
    { _id: user._id },
    {
      $set: {
        resetVerifyToken,
      },
    }
  );
  const { firstName, lastName } = user;
  wellComeEmail({
    firstName,
    lastName,
    email,
    emailVerifyToken: resetVerifyToken,
    verifyEmailLink: `${process.env.APP_URL}/reset-password`,
  });
  return formatResponse(
    201,
    "Success",
    "Your reset verification code has been sent On Your Email"
  );
};
const resetPassword = async (data) => {
  const { resetCode, password } = data;
  console.log("hello")
  const response = validate.changePasswordSchema.validate({
    password,
  });
  if (typeof response.error !== "undefined") {
    return createResponse(response);
  }
  const user = await User.findOne({ resetVerifyToken: resetCode });
  if (!user) throw new BaseError("Invalid token", 404);

  update = {
    $set: {
      password: await bcrypt.hash(password , 10),
      resetVerifyToken: null,
    },
  };
  await User.findOneAndUpdate({ _id: user._id }, update, { new: true });
  return formatResponse(201, "Success", "Password Reset Successfully");
};
module.exports = {
  register,
  verifyEmail,
  login,
  changePassword,
  forgotPassword,
  resetPassword
}