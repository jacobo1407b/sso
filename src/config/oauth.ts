import OAuth2Server from "oauth2-server";

let config: OAuth2Server;

function startConfig() {
    config = new OAuth2Server({
        model: require('../models/auth.model'),
        allowBearerTokensInQueryString: true,
    });
    
}
function getServer() {
    return config;
}

export {
    startConfig,
    getServer
} 

