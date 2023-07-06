import {startMongo} from "./components/mongoDB/index.js";
import {startServer} from "./components/http/index.js";
import {startTelegram} from "./components/tg/index.js";

(async () => {
    await startServer();
    await startMongo();
    await startTelegram();
})();

