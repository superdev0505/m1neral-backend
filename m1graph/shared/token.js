import { UserAgentApplication } from "msal";

import { ImplicitMSALAuthenticationProvider } from "@microsoft/microsoft-graph-client/lib/src/ImplicitMSALAuthenticationProvider";
import { MSALAuthenticationProviderOptions } from '@microsoft/microsoft-graph-client/lib/src/MSALAuthenticationProviderOptions';

// An Optional options for initializing the MSAL @see https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL-basics#configuration-options
const msalConfig = {
    auth: {
        clientId: process.env.OAUTH_APP_ID, // Client Id of the registered application
        redirectUri: "your_redirect_uri",
    },
};
const graphScopes = ["user.read", "mail.send"]; // An array of graph scopes

// Important Note: This library implements loginPopup and acquireTokenPopup flow, remember this while initializing the msal
// Initialize the MSAL @see https://github.com/AzureAD/microsoft-authentication-library-for-js#1-instantiate-the-useragentapplication
const msalApplication = new UserAgentApplication(msalConfig);
const options = new MSALAuthenticationProviderOptions(graphScopes);
const authProvider = new ImplicitMSALAuthenticationProvider(msalApplication, options);

module.exports = {
    getAccessToken: async function(req) {
      if (req.user) {
        // Get the stored token
        var storedToken = req.user.oauthToken;
  
        if (storedToken) {
          if (storedToken.expired()) {
            // refresh token
            var newToken = await storedToken.refresh();
  
            // Update stored token
            req.user.oauthToken = newToken;
            return newToken.token.access_token;
          }
  
          // Token still valid, just return it
          return storedToken.token.access_token;
        }
      }
    }
  };