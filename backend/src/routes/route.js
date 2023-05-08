const express= require('express')
const router = express.Router();
const tokenController = require('../controller/tokenController')
const auth = require('../auth/auth')

router.get("/test",function(req,res){
    res.send("i am working perfect")
})

router.get("/auth",tokenController.auth)
router.get("/auth/google/callback",auth.getToken,tokenController.getFiles)
router.get('/auth/revokeToken',tokenController.revokeToken)
// router.get("/listfiles", tokenController.listfiles)



module.exports = router