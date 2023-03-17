import { objectToSearchParams } from "shared/mod.ts";
import { AUTHORIZE_URL, AuthorizeReqParams, AuthScope } from "auth/general.ts";

export type GetRedirectURLOpts = {
	/**
	 * List of scopes.
	 *
	 * @default
	 * If no scopes are specified, authorization will be granted
	 * only to access publicly available information
	 */
	scopes?: AuthScope[];
	/**
	 * Whether or not to force the user to approve the app again
	 * if they’ve already done so.
	 *
	 * - If false, a user who has already approved the application
	 *  may be automatically redirected to the URI specified by `redirect_uri`.
	 * - If true, the user will not be automatically redirected and will have
	 *  to approve the app again.
	 *
	 * @default false
	 */
	show_dialog?: boolean;
	/**
	 * The Client ID generated after registering your Spotify application.
	 */
	client_id: string;
	/**
	 * The URI to redirect to after the user grants or denies permission.
	 * This URI needs to have been entered in the _Redirect URI Allowlist_
	 * that you specified when you registered your application.
	 */
	redirect_uri: string;
	/**
	 * This provides protection against attacks such as
	 * cross-site request forgery.
	 */
	state?: string;
};

export const getRedirectURL = ({ scopes, ...opts }: GetRedirectURLOpts) => {
	const url = new URL(AUTHORIZE_URL);

	url.search = objectToSearchParams<AuthorizeReqParams>({
		response_type: "token",
		scope: scopes?.join(" "),
		...opts,
	}).toString();

	return url;
};

export interface CallbackErrorData extends Record<string, string | undefined> {
	/**
	 * The reason authorization failed, for example: “access_denied”.
	 */
	error: string;
	/**
	 * The value of the state parameter supplied in the request.
	 */
	state?: string;
}

export interface CallbackSuccessData
	extends Record<string, string | undefined> {
	/**
	 * An access token that can be provided in subsequent calls, for example to Spotify Web API services.
	 */
	access_token: string;
	token_type: "Bearer";
	/**
	 * The time period (in seconds) for which the access token is valid.
	 */
	expires_in: string;
	/**
	 * The value of the state parameter supplied in the request.
	 */
	state?: string;
}

export type CallbackData = CallbackSuccessData | CallbackErrorData;

export const parseCallbackData = (hash: string) => {
	const params = Object.fromEntries(
		new URLSearchParams(hash.substring(1)),
	) as CallbackData;

	if ("error" in params) return params;
	if (
		"access_token" in params && "expires_in" in params && "token_type" in params
	) {
		return params;
	}

	throw new Error("Invalid params");
};
