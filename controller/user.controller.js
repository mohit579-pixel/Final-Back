import AppError from "../utils/error.utils.js";
import User from "../models/user.models.js";
import cloudinary from "cloudinary";
import fs from 'fs/promises';

const cookieOptions = {
    secure: true,
    sameSite: 'None',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
  };


  export const registerUser = async (req, res, next) => {
    const { fullName, email, password } = req.body;
    let user; // Declare user variable outside the try block

    if (!fullName || !email || !password) {
        return next(new AppError('All Fields are Required', 400));
    }

    const userExists = await User.findOne({
        email
    });

    if (userExists) {
        return next(new AppError('Email Already Exists', 400));
    }

    try {
        // File Upload - Move this block to the beginning
        if (req.file) {
            console.log(req.file);
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                    width: 250,
                    height: 250,
                    gravity: 'faces',
                    crop: 'fill'
                });

                if (result) {
                    user = await User.create({
                        fullName,
                        email,
                        password,
                        avatar: {
                            public_id: result.public_id,
                            secure_url: result.secure_url
                        }
                    });

                    // Remove file from server
                    await fs.rm(`uploads/${req.file.filename}`);
                }
            } catch (error) {
                return next(new AppError(error || 'File not Uploaded'));
            }
        }

        if (!user) {
            user = await User.create({
                fullName,
                email,
                password,
                avatar: {
                    public_id: email,
                    secure_url: null
                }
            });
        }

        user.password = undefined;

        const token = await user.generateJWTToken();

        res.cookie('token', token, cookieOptions);

        // Move this block to the end
        res.status(201).json({
            success: true,
            message: 'User Registered Successfully',
            user,
        });
    } catch (e) {
        console.error(e); 
        return next(new AppError('Error creating user', 500));
    }
};

export const loginUser = async (req, res, next) => {
    // Destructuring the necessary data from req object
    const { email, password } = req.body;
  
    // Check if the data is there or not, if not throw error message
    if (!email || !password) {
      return next(new AppError('Email and Password are required', 400));
    }
  
    // Finding the user with the sent email
    const user = await User.findOne({ email }).select('+password');
  
    // If no user or sent password do not match then send generic response
    if (!(user && (await user.comparePassword(password)))) {
      return next(
        new AppError('Email or Password do not match or user does not exist', 401)
      );
    }
  
    // Generating a JWT token
    const token = await user.generateJWTToken();
  
    // Setting the password to undefined so it does not get sent in the response
    user.password = undefined;
  
    // Setting the token in the cookie with name token along with cookieOptions
    res.cookie('token', token, cookieOptions);
  
    // If all good send the response to the frontend
    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      user,
    });
  };


  export const logoutUser = async (_req, res, _next) => {
    // Setting the cookie value to null
    res.cookie('token', null, {
      secure:true,
      maxAge: 0,
      httpOnly: true,
    });
  
    // Sending the response
    res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  };


  export const getLoggedInUserDetails = async (req, res, _next) => {
    // Finding the user using the id from modified req object
    const user = await User.findById(req.user.id);
  
    res.status(200).json({
      success: true,
      message: 'User details',
      user,
    });
  };