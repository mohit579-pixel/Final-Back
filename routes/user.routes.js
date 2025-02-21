import {Router} from "express" ;
import upload from "../middlewares/multer.middlewares.js";
import { getLoggedInUserDetails, loginUser, logoutUser, registerUser } from "../controller/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
const router=Router();


router.post('/register',upload.single("avatar"),registerUser);
router.post('/login',loginUser);
router.post('/logout',logoutUser);
router.get('/me',isLoggedIn,getLoggedInUserDetails);




export default router;