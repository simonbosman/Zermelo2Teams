export const msalConfig = (tenantId: string, appId: string) => {
	let config = {
		auth: {
			clientId: appId,
			authority: `https://login.microsoftonline.com/${tenantId}`,
			redirectUri: `${window.location.origin}/_layouts/15/workbench.aspx`,
		},
		cache: {
			cacheLocation: "sessionStorage",
			storeAuthStateInCookie: false,
		},
	};
	return config;
};
