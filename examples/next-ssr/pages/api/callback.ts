import { deleteCookie, getCookie, setCookie } from "cookies-next";
import type { NextApiRequest, NextApiResponse } from "next";
import { AuthCode } from "@soundify/node-auth";
import {
	env,
	SPOTIFY_ACCESS_TOKEN,
	SPOTIFY_REFRESH_TOKEN,
	SPOTIFY_STATE,
} from "../../spotify";

export default async function (
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (!req.url) {
		res.status(400).send("req.url is undefined");
		return;
	}

	const url = new URL(req.url, `http://${req.headers.host}`);

	const data = AuthCode.parseCallbackData(url.searchParams);

	if ("error" in data) {
		res.status(400).send(data.error);
		return;
	}

	const storedState = getCookie(SPOTIFY_STATE, { req, res });
	if (
		typeof data.state !== "string" || !storedState || data.state !== storedState
	) {
		res.status(400).send("Unable to verify request with state.");
		return;
	}

	deleteCookie(SPOTIFY_STATE, { req, res });

	try {
		const { refresh_token, access_token, expires_in } = await AuthCode
			.getGrantData({
				code: data.code,
				...env,
			});

		setCookie(SPOTIFY_REFRESH_TOKEN, refresh_token, {
			httpOnly: true,
			sameSite: "strict",
			path: "/api/refresh",
			req,
			res,
		});

		setCookie(SPOTIFY_ACCESS_TOKEN, access_token, {
			req,
			res,
			maxAge: expires_in,
			sameSite: "strict",
		});

		res.redirect("/");
	} catch (error) {
		res.status(400).send(String(error));
	}
}
