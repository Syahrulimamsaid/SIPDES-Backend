export const isAuth = async (ctx: any) => {
  const { cookie, jwt, set } = ctx;
  const token = cookie.auth?.value;
  // console.log(token);
  // console.log(cookie);
  if (!token) {
    set.status = 401;
    return { message: "Unauthorized" };
  }

  try {
    const payload = await jwt.verify(token);
    ctx.user = payload;
  } catch (err) {
    set.status = 401;
    return { message: "Token invalid / expired" };
  }
};
