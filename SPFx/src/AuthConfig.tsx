export const msalConfig = (tenantId: string, appId: string) => {
	let config = {
		auth: {
			clientId: appId,
			authority: `https://login.microsoftonline.com/${tenantId}`,
			redirectUri: "/",
		},
		cache: {
			cacheLocation: "localStorage",
			storeAuthStateInCookie: false,
		},
	};
	return config;
};
