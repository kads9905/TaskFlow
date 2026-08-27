// entry point for application - load env, connect db and start server

import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import { app } from "./src/app.js";

// loads value from .env
dotenv.config({
    path: "./.env"
});

// connects atlas before starting
connectDB()
.then(() => {
    // starts express only after db is ready
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port : ${process.env.PORT}`);
    });
})
// handles db error
.catch((err) => {
    console.log("MongoDB connection failed!", err);
});