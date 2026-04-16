module.exports = {
    apps: [
        {
            name: "nuxt-prod",
            script: ".output/server/index.mjs",
            env: {
                NODE_ENV: "production",
                // APP_ENV: "prod", 
                NUXT_PUBLIC_SOCKET_BASE_URL: 'wss://drinkwater.fun/chatapi/ws'
            }
        },
        // {
        //     name: "nuxt-uat",
        //     script: ".output/server/index.mjs",
        //     env: {
        //         NODE_ENV: "production",
        //         APP_ENV: "uat",
        //         NUXT_PUBLIC_API_BASE_URL: "http://uat-api.xxx.com"
        //     }
        // }
    ]
}