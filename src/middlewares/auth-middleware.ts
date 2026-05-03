export const isAuth = async (ctx: any) => {
  const auth = ctx.headers.authorization;
  
  if (!auth?.startsWith("Bearer ")) {
    ctx.set.status = 401;
    return { message: "Unauthorized" };
  }
  
  const token = auth.split(" ")[1];
  try {
    const payload = await ctx.jwt.verify(token);
    ctx.user = payload;
  } catch {
    ctx.set.status = 401;
    return { message: "Invalid token" };
  }
};
