var graph = require('@microsoft/microsoft-graph-client');
const fetch = require('node-fetch');
const { Headers } = require('node-fetch');

async function getAppAccessToken(scope) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    
    var urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "client_credentials");
    urlencoded.append("client_id", "ecdc741a-6b2c-4158-93d3-b5bccc2d7e76");
    urlencoded.append("client_secret", "AP_yKQTe50jZ..p4tkzlE81dMxXaDMvF_r");
    urlencoded.append("scope", scope);
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow'
    };
    
    const response = await fetch("https://login.microsoftonline.com/8a5745e7-9ec5-4815-a505-795b18826191/oauth2/v2.0/token", requestOptions)
    const data = checkStatus(response);
    const json = await data.json();

    console.log(json);
    return json.access_token
}

function getAuthenticatedClient(accessToken) {
    // Initialize Graph client
    const client = graph.Client.init({
        // Use the provided access token to authenticate
        // requests
        authProvider: (done) => {
            done(null, accessToken);
        }
    });

    return client;
}

const checkStatus = res => {
	if (res.ok) {
		// res.status >= 200 && res.status < 300
		return res;
	} else {
		throw Error(res.statusText);
	}
}

module.exports = () => ({
    Query: {
        allUsers: async () => {
            try {
                const accessToken = await getAppAccessToken("https://graph.microsoft.com/.default");
                const client = getAuthenticatedClient(accessToken);
                const user = await client.api('/users?$select=city,country,displayName,givenName,id,identities,jobTitle,mail,postalCode,state,streetAddress,surname,userPrincipalName,extension_ecdc741a6b2c415893d3b5bccc2d7e76_mustResetPassword').get();

                // const accessToken2 = await getAppAccessToken("https://graph.windows.net/.default");

                // var myHeaders = new Headers();
                // myHeaders.append("Authorization", "Bearer " + accessToken2);
                
                // var requestOptions = {
                //   method: 'GET',
                //   headers: myHeaders,
                //   redirect: 'follow'
                // };
                
                // const response = await fetch("https://graph.windows.net/8a5745e7-9ec5-4815-a505-795b18826191/users?api-version=1.6", requestOptions)
                // const data = checkStatus(response);
                // const json = await data.json();

                let users = user.value
                users.map(user => {
                    user.emails = [];
                    user.identities.forEach(identity => { if(identity.signInType.startsWith('emailAddress')) user.emails.push(identity.issuerAssignedId) });
                    // delete user.identities;
                })

                return users.filter(user => (user.emails.length > 0));
                // return json.value;

            } catch (err) {
                return err;
            }
        },
        allGroups: async () => {
            try {
                const accessToken = await getAppAccessToken("https://graph.microsoft.com/.default");
                const client = getAuthenticatedClient(accessToken);
                const group = await client.api('/groups').get();

                return group.value;

            } catch (err) {
                return err;
            }
        },
        userGroups: async (_, { userId }) => {
            try {
                const accessToken = await getAppAccessToken("https://graph.microsoft.com/.default");
                const client = getAuthenticatedClient(accessToken);
                const group = await client.api(`/users/${userId}/memberOf`).get();

                return group.value;

            } catch (err) {
                return err;
            }
        },
        groupUsers: async (_, { groupId }) => {
            try {
                const accessToken = await getAppAccessToken("https://graph.microsoft.com/.default");
                const client = getAuthenticatedClient(accessToken);
                const user = await client.api(`/groups/${groupId}/members`).get();

                return user.value;

            } catch (err) {
                return err;
            }
        },
    },
    Mutation: {
        addUser: async (_, { user }) => {
            try {
                const accessToken = await getAppAccessToken("https://graph.microsoft.com/.default");
                const client = getAuthenticatedClient(accessToken);
                const userRes = await client.api('/users').post(JSON.stringify(user));

                return userRes;

            } catch (err) {
                return err;
            }
        },
        addGroup: async (_, { group }) => {
            try {
                const accessToken = await getAppAccessToken("https://graph.microsoft.com/.default");
                const client = getAuthenticatedClient(accessToken);
                const groupRes = await client.api('/groups').post(JSON.stringify(group));

                return groupRes;

            } catch (err) {
                return err;
            }
        },
        addGroupMembers: async (_, { groupId, userIds }) => {
            try {
                const accessToken = await getAppAccessToken("https://graph.microsoft.com/.default");
                const client = getAuthenticatedClient(accessToken);

                let members = {
                    "members@odata.bind": userIds.map(userId => `https://graph.microsoft.com/v1.0/directoryObjects/${userId}`)
                }

                const userRes = await client.api(`/groups/${groupId}`).patch(JSON.stringify(members));

                return userRes;

            } catch (err) {
                return err;
            }
        },
        removeUser: async (_, { userId }) => {
            try {
                const accessToken = await getAppAccessToken("https://graph.microsoft.com/.default");
                const client = getAuthenticatedClient(accessToken);
                const userRes = await client.api(`/users/${userId}`).delete();

                return userRes;

            } catch (err) {
                return err;
            }
        },
        removeGroup: async (_, { groupId }) => {
            try {
                const accessToken = await getAppAccessToken("https://graph.microsoft.com/.default");
                const client = getAuthenticatedClient(accessToken);
                const groupRes = await client.api(`/groups/${groupId}`).delete();

                return groupRes;

            } catch (err) {
                return err;
            }
        },
        removeGroupMembers: async (_, { groupId, userIds }) => {
            try {
                const accessToken = await getAppAccessToken("https://graph.microsoft.com/.default");
                const client = getAuthenticatedClient(accessToken);

                let members = {
                    "members@odata.bind": userIds.map(userId => `https://graph.microsoft.com/v1.0/directoryObjects/${userId}`)
                }

                const userRes = await client.api(`/groups/${groupId}/$ref`).delete(JSON.stringify(members));

                return userRes;

            } catch (err) {
                return err;
            }
        },
    }
});