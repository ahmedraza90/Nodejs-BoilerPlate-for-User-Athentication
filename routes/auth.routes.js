const {router} = require("../app")
const authController = require("../controllers/auth.controllers")
const { requireSignin } = require('../middlewares/authorization');

router.post("/register", authController.register);
router.post("/verify-email", authController.verifyEmail);
router.post("/login", authController.login);
router.patch("/change-password",requireSignin, authController.changePassword);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password", authController.resetPassword); 
module.exports = router