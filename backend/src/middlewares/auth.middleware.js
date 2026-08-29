import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const verifyJWT = asyncHandler(async(req, res, next) => {
    try{
        // extract the token
        // but can we trust this token?
        // get token from cookies or authorization header
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer", "");
        
        if(!token){
            throw new ApiError(401, "Unauthorized request");
        }

        // verifies the token
        // does 2 things - is the signature genuine?
        // has it expired?
        // what u want to verify - token
        // secret key - only the one who has the key can decode it
        // Verify token using secret key
        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        // find the user from db
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if(!user){
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "Invalid access token"
        );
    }
})

export { verifyJWT };