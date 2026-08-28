import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// register user
// asynchandler -> wraps the controller
// req contains the incoming request
// res is used to send the response
const registerUser = asyncHandler ( async (req, res) => {
    // extract the incoming data from postman -> express ) cuz of express.json()) convert it 
    // destructuring simply
    const { username, fullName, email, password } = req.body;

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
        // avatar
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

export {
    registerUser
}