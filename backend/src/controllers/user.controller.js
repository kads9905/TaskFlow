import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// separate method for access and refresh token - call as per need
// this is an reusable helper function 
// to avoid repeated code
// has one responsibility -> given a userId, generate both tokens,
// save the refresh token, return them
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();


        // refresh token saved in db to not ask user again for pw 
        user.refreshToken = refreshToken;
        // usually user.save() runs all validations again -> means mongoose checks
        // username required, email.... but we are only updating one field
        // i.e., refreshtoken -> running every validation is unnecessary
        // so we save this document without re-validating every field
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        console.log(error);
        throw new ApiError(500, error.message);
    }
}

// register user
// asynchandler -> wraps the controller
// req contains the incoming request
// res is used to send the response
const registerUser = asyncHandler ( async (req, res) => {
    // extract the incoming data from postman -> express ) cuz of express.json()) convert it 
    // destructuring simply
    const { username, fullName, email, password } = req.body;

    const avatarLocalPath = req.file?.path;
    console.log(req.file);
    console.log(req.body);

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(500, "Error uploading avatar");
    }

    // validate the fields
    // suppose user sends nothing in username ["", "Kads", "k@gmail.com", "abc123"]
    // then .some() asks 
    // does any element satisfy this conditon?
    // condition -> field?>trim() === ""
    // for the first element value "" after trim() "" empty? yes
    // since one field is empty .some() returns true and throw the error
    if (
        [username, fullName, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username} , { email }]
    });

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists");
    }

    // create the user
    // mighte be wondering why dont we hash our password here wwhile creating user
    // we r passing plain pw so you might think we should do bcrypt.hash(pw)
    // we dont cuz when user.create() runs, mongoose automatically triggers
    // userschema.pre(Save) hook -> bcrypt hashes pw -> mongodb stores hashed pw
    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        email,
        password,
        avatar: avatar.secure_url
    })

    // check if user is actually created or empty -> the data is created and
    // mongodb with every entry adds an underscore id field in it
    // fetch the created user safely
    // user still contains every field including pw and refresthoken
    // we never send them to frontend
    // so .select() return everything except these fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res
    .status(201)
    .json(
        201,
        createdUser,
        "User registered successfully"
    )
})

const loginUser = asyncHandler(async(req, res) => {
    // recieve and validate credetials
    const { email, username, password } = req.body
    console.log(email);
    
    if((!email && !username) || !password) {
        throw new ApiError(400, "Username or email and password are required")
    }

    // find user 
    const user = await User.findOne({
        $or: [{ email }, { username } ]
    });

    if(!user) {
        throw new ApiError(404, "User does not exist");
    }

    // verify password
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    // generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // fetch the updated user
    // we now fetch the latest user and exclude sensitive fields before sending
    // it to the frontend
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // cookies
    // we need to send them to frontend -> 2 ways
    // json response -> frontend stores it (localstorage/sessionstorage)
    // http-only cookie -> browser stores it automatically
    // http is preferred cu js cannot read them making them much safer against xss attacks
    const options = {
        httpOnly: true,
        secure: true
        // secure-> only send this cookie over https
    };

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )


})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully"
        )
    )
})

// when user logs out -> do 2 things
// removes refresh token from db(invalidate the sesh)
// delete cookies from browser
const logoutUser = asyncHandler(async(req, res) => {

    // remove the refresh token from database
    await User.findByIdAndUpdate(
        req.user._id,
        {
            // unset -> remove the field
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out successfully")
    )

})

export {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser
}