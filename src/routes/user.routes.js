import { Router } from "express";
import verifyJWT from "../middlewares/auth.Middleware.js";
import {
  changeCurrentPassword,
  createUser,
  deleteUser,
  getAllUsers,
  getCurrentUser,
  loginUser,
  updateUserDetails,
  userLogout,
} from "../controllers/employee.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  createUser
);
router.post("/login", loginUser);

router.use(verifyJWT);

router.post("/logout", userLogout);
router.post("/change-password", changeCurrentPassword);
router.get("/current-user", getCurrentUser);
router.patch("/update-user/:id", updateUserDetails);
router.get("/users", getAllUsers);
router.delete("/delete/:id", deleteUser);

export default router;
