
const { google } = require('googleapis');


const oauth2Client = new google.auth.OAuth2(
    '237393158742-se7477e3kpsp266lpjoenr4is60ta3i9.apps.googleusercontent.com',
    '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',
    'https://6458e1b51db3332083a15552--chic-tanuki-6f29cd.netlify.app/Oauth2callback'
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
        return res.status(200).send({ status: true, data: authorizeUrl })


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
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


        //set cookie to use in revoke token
        res.cookie('accessToken', req.accessToken)

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

            console.log("here", files)

            if (files.length === 0) { return res.status(404).send({ status: false, message: "No Files In Drive" }) }

            nextPageToken = response.data.nextPageToken;

            for (let item of files) {
                try {

                    // if (item.name === 'Doubt  Session TA- Thorium') {
                    //     console.log("cream is here", item)
                    // }
                    if (item.name === 'Assignment_31_03_22.mp4') {
                        console.log("shit is here", item)
                    }
                    
                    //check for required permessions before accessing them
                    if (item.capabilities.canEdit === false || item.capabilities.canMoveItemWithinDrive === false || item.capabilities.canCopy === false || item.capabilities.canComment === false) {

                        continue;
                    }

                    console.log("after if ,,,,,,,,,,,,")
                    const permissionsResponse = await drive.permissions.list({
                        fileId: item.id,
                        fields: 'permissions',
                    });
                    const permissions = permissionsResponse.data.permissions;

                    const hasPublicPermission = permissions.some(permission => {
                        return permission.type === 'anyone' && permission.role !== 'owner'
                    });

                    if (hasPublicPermission) {
                        let count = 0;
                        permissions.filter((perm) => { return perm.type === "user" ? count++ : count });
                        let data = {
                            name: item.name,
                            createdByname: item.owners[0].displayName,
                            createdByemail: item.owners[0].emailAddress,
                            linkToFile: item.webViewLink,
                            sharedWithCount: count,
                            accessSetting: "Anyone With The Link",
                        };
                        finalData.publicFiles.push(data);
                    }

                    permissions.map((permission) => {
                        const email = permission.emailAddress;

                        if (email === undefined) return;
                        if (email === req.email) return;

                        const accessPermission = item.permissions.find(p => p.type === 'anyone' && p.role === 'reader');
                        const accessSetting = accessPermission ? 'Anyone with the link' : 'External';

                        const sharedCount = item.permissions.filter(permission => {
                            const email = permission.emailAddress;
                            return email !== undefined && email !== item.owners[0].emailAddress;
                        }).length;

                        const fileAccess = {
                            fileName: item.name,
                            accessSetting,
                            linkToFile: item.webViewLink,
                            createdByname: item.owners[0].displayName,
                            createdByemail: item.owners[0].emailAddress,
                            sharedWithCount: sharedCount
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
                        return permission.type === 'user' && permission.role !== 'owner' && permission.emailAddress !== req.email && !permissions.some(p => p.type === 'anyone' && p.role !== 'owner');
                    });

                    if (externalPermissions.length > 0) {
                        let data = {
                            name: item.name,
                            createdByname: item.owners[0].displayName,
                            createdByemail: item.owners[0].emailAddress,
                            linkToFile: item.webViewLink,
                            sharedWithCount: externalPermissions.length,
                            accessSetting: "External",
                        };
                        finalData.externallyShared.push(data);
                    }

                } catch (error) {
                    return res.status(400).send({ status: false, message: `Error retrieving permissions for file: ${item.name},${error.message}` })
                }


            }

        } while (nextPageToken);


        console.log("peopleWithAccess", finalData.peopleWithAccess.length);
        console.log("publicFiles", finalData.publicFiles.length);
        console.log("externallyShared", finalData.externallyShared.length)
        return res.status(200).send({ status: true, data: finalData })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}


const revokeToken = async function (req, res) {
    try {

        const accessToken = req.cookies.accessToken; // retrieve access token from cookie
        console.log('Access token:', accessToken);

        await oauth2Client.revokeToken(accessToken);

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(200).send({ status: true, message: 'Access token revoked successfully' });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

 

module.exports.revokeToken = revokeToken
module.exports.auth = auth
module.exports.getFiles = getFiles


