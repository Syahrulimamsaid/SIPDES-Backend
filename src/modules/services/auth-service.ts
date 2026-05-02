import { request } from "node:http";
import { LoginValidation } from "../../validations/auth-validation";
import { ResponseError } from "../../response/response-error";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/user.model";

const login = async (request: any) => {
  const user = await LoginValidation.validateAsync(request);

  const userData = await User.findUnique({
    select: { id: true, email: true, password: true },
    where: { email: user.email },
  });

  if (!userData) {
    throw new ResponseError(404, "Email or password wrong");
  }

  const isValid = await bcrypt.compare(user.password, userData.password);
  if (!isValid) {
    throw new ResponseError(404, "Email or password wrong");
  }

  // const token = await token.create({
  //   data: {
  //     userId: userData.id,
  //     token: generateAccessToken(userData),
  //     expired: new Date(new Date().setHours(new Date().getHours() + 2)),
  //   },
  //   select: { token: true, expired: true },
  // });

  // const userResult = await sequelize.user.findFirst({
  //   select: {
  //     id: true,
  //     email: true,
  //     name: true,
  //   },
  //   where: { id: user.id },
  // });

  // return { ...userResult, token: token.token, expired: token.expired };
};

// const logout = async (request: any) => {
//   const token = request.headers.authorization?.split(" ")[1];
//   if (!token) {
//     throw new ResponseError(404, "Token not found");
//   }

//   await sequelize.token.deleteMany({
//     where: { AND: [{ userId: request.user.id, token: token }] },
//   });

//   return true;
// };

// const logked = async (request: any) => {
//   const token = request.headers.authorization?.split(" ")[1];
//   if (!token) {
//     throw new ResponseError(404, "Token not found");
//   }

//   const user = await sequelize.token.findFirst({
//     where: { userId: request.user.id, token: token },
//     select: {
//       token: true,
//       expired: true,
//       user: { select: { name: true, email: true } },
//     },
//   });

//   if (!user) {
//     throw new ResponseError(404, "User not logked");
//   }
//   return user;
// };

const generateAccessToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "2h" },
  );
};

export default {
  login,
  // logout,

  // logked,
};
