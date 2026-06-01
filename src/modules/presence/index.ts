import { Elysia } from "elysia";
import user from "./routes/user.route";
import operator from "./routes/operator.route";

const presence = new Elysia();
presence.use(user).use(operator);
export default presence;
