
const { google } = require('googleapis');


const oauth2Client = new google.auth.OAuth2(
    '237393158742-se7477e3kpsp266lpjoenr4is60ta3i9.apps.googleusercontent.com',
    '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',
    'http://localhost:3000/auth/google/callback'
);

let auth = async function (req, res) {
    try {

        // Generate a URL to request access from the user
        console.log("code", req.query.code)
        const authorizeUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/drive.readonly.metadata', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.readonly',]
        });
        console.log(`Visit this URL to authorize the application: ${authorizeUrl}`);
       return  res.redirect(authorizeUrl)


    } catch (error) {
        res.status(500).send({status:false , message : error.message});
    }
};

const getFiles = async function (req, res) {
    try {
        console.log("hllo")

        console.log('Access token:', req.accessToken);
        //console.log('Refresh token:', refresh_token)

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: req.accessToken });
        const drive = google.drive({ version: 'v3', auth: auth });

        const emailSet = new Set();

        let finalData = {
            publicFiles: [],
            peopleWithAccess: [],
            externallyShared: []
        };

        let nextPageToken = null;

        do {
            let response = await drive.files.list({
                fields: "nextPageToken, files",
                pageSize: 1000, // set the number of files to retrieve per page
                pageToken: nextPageToken
            });

            let files = response.data.files;
            nextPageToken = response.data.nextPageToken;

            for (let item of files) {
                if (item.capabilities.canEdit || item.capabilities.canComment) {
                    const permissionsResponse = await drive.permissions.list({
                        fileId: item.id,
                        fields: 'permissions',
                    });
                    const permissions = permissionsResponse.data.permissions;

                    const hasPublicPermission = permissions.filter(permission => {
                        return permission.type === 'anyone'
                    });

                    if (hasPublicPermission) {
                        let count = 0;
                        permissions.filter((perm) => { return perm.type === "user" ? count++ : count });
                        let data = {
                            name: item.name,
                            createdByname: item.owners[0].displayName,
                            createdByemail: item.owners[0].emailAddress,
                            type: item.mimeType,
                            size: item.size,
                            linkToFile: item.webViewLink,
                            sharedWithCount: count,
                            accessSetting: "Anyone With The Link",
                        };
                        finalData.publicFiles.push(data);
                    }

                    permissions.map((permission) => {
                        const email = permission.emailAddress;

                        if (email === undefined) return;

                        const fileAccess = {
                            fileName: item.name,
                            accessSetting: permission.role,
                            linkToFile: item.webViewLink
                        };
                        // If email is already in the emailSet, push fileAccess to its array in finalData.peopleWithAccess
                        if (emailSet.has(email)) {
                            const existingData = finalData.peopleWithAccess.find(data => data[email]);
                            existingData[email].push(fileAccess);
                        }
                        // If email is not already in the emailSet, create a new object with email as key and its value as an array containing fileAccess
                        else {
                            emailSet.add(email);
                            const newData = {
                                [email]: [fileAccess]
                            };
                            finalData.peopleWithAccess.push(newData);
                        }
                    });

                    const externalPermissions = permissions.filter(permission => {
                        return permission.type === 'user' && permission.emailAddress !== item.owners[0].emailAddress;
                    });

                    if (externalPermissions.length > 0) {
                        let data = {
                            name: item.name,
                            createdByname: item.owners[0].displayName,
                            createdByemail: item.owners[0].emailAddress,
                            type: item.mimeType,
                            size: item.size,
                            linkToFile: item.webViewLink,
                            sharedWithCount: externalPermissions.length,
                            accessSetting: "External",
                        };
                        finalData.externallyShared.push(data);
                    }
                }
            }

        } while (nextPageToken);

        console.log(finalData.publicFiles.length);
        return res.sendStatus(finalData.externallyShared.length)
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}

module.exports.auth = auth
module.exports.getFiles = getFiles


