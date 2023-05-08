const { google } = require('googleapis');
const axios = require('axios');
const tokenModel = require('../model/tokenModel')


let count = 0

const getToken = async function (req, res, next) {
    try {

        count++
        console.log(count)

        if (count > 1) {
            let refreshToken = req.cookies.refreshToken // retrieve refresh token from cookie
            let findToken = await tokenModel.findOne({ refresh_token: refreshToken })
            console.log(findToken)
            let { refresh_token } = findToken;

            // Make a POST request to the token endpoint to get a new access token
            let { data: newToken } = await axios({
                url: 'https://oauth2.googleapis.com/token',
                method: 'post',
                params: {
                    client_id: '237393158742-se7477e3kpsp266lpjoenr4is60ta3i9.apps.googleusercontent.com',
                    client_secret: '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',
                    grant_type: 'refresh_token',
                    refresh_token
                }
            });

            console.log('New token:', newToken);

            let access_token = newToken.access_token;
            req.accessToken = access_token;

            next()
        } else {

            let code = req.query.code;
            console.log('Authorization code:', code);

            // Exchange the authorization code for an access token
            let { data } = await axios({
                url: 'https://oauth2.googleapis.com/token',
                method: 'post',
                params: {
                    code,
                    client_id: '237393158742-se7477e3kpsp266lpjoenr4is60ta3i9.apps.googleusercontent.com',
                    client_secret: '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',
                    redirect_uri: 'https://6458c3b7a3b01400098a085b--chic-tanuki-6f29cd.netlify.app/auth/google/callback',
                    grant_type: 'authorization_code'
                }
            });

            console.log('API response:', data);

            let access_token = data.access_token;
            let refresh_token = data.refresh_token;

            const response = await axios({
                method: 'GET',
                url: 'https://www.googleapis.com/oauth2/v1/userinfo',
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            const email = response.data.email;

            req.email = email
            console.log('Email:', email);

            const saveRefreshToken = await tokenModel.create({
                user: email,
                refresh_token: refresh_token
            })

            req.accessToken = access_token
            req.refreshToken = refresh_token

            // Store refresh token in a cookie
            res.cookie('refreshToken', refresh_token, { httpOnly: true })
            next()
        }

    } catch (error) {
        return res.status(500).send({status:false , message : error.message})
    }
}


module.exports.getToken = getToken