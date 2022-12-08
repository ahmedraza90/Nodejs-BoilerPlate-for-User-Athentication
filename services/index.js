const {register,verifyEmail,login,changePassword,forgotPassword,resetPassword} = require("./auth.services")
const {wellComeEmail} = require("./mail.services.js")



const mailService = {
    wellComeEmail
}
const authService = {
    register,
    verifyEmail,
    login,
    changePassword,
    forgotPassword,
    resetPassword
}

module.exports = {
    authService,
    mailService
}