import { toQueryString } from "../shared";
import {
  ApiTokenReqParams,
  AuthorizeReqParams,
  AuthProviderOpts,
  AuthScope,
  createAuthProvider,
  getBasicAuthHeader,
  KeypairResponse,
  parseCallbackData,
  ScopedAccessResponse,
  SPOTIFY_AUTH,
  SpotifyAuthError,
  URL_ENCODED
} from "./general";

type GetAuthURLOpts = {
  /**
   * URI for redirection after the user grants or denies permission. Must be included in "Redirect URIs" in the Spotify app settings.
   */
  redirect_uri: string;
  /**
   * The 'state' parameter is an optional string included in the authorization URL to protect against CSRF attacks.
   *
   * It is highly recommended to use.
   * Can be any random string, for example generated by `crypto.randomUUID()`.
   */
  state?: string;
  /**
   * List of scopes.
   *
   * If no scopes are specified, authorization will be granted
   * only to access publicly available information.
   */
  scopes?: AuthScope[];
  /**
   * Whether or not to force the user to approve the app again
   * if they’ve already done so.
   *
   * - If false, a user who has already approved the application may be automatically redirected to the URI specified by `redirect_uri`.
   * - If true, the user will not be automatically redirected and will have to approve the app again.
   *
   * @default false
   */
  show_dialog?: boolean;
};

export class AuthCode {
  private readonly basicAuthHeader: string;

  /**
   * @param creds Spotify application credentials required for Authorization Code flow.
   */
  constructor(
    private readonly creds: {
      /**
       * The Client ID generated after registering your Spotify application.
       */
      client_id: string;
      /**
       * The Client Secret generated after registering your Spotify application.
       */
      client_secret: string;
    }
  ) {
    this.basicAuthHeader = getBasicAuthHeader(
      creds.client_id,
      creds.client_secret
    );
  }

  /**
   * Creates a URL to redirect the user to the Spotify authorization page, where they can grant or deny permission to your app.
   *
   * @param opts The object of options that will be passed as search parameters in the authorization URL.
   * @returns An instance of a URL object that can be converted to a string by calling the `.toString()` method on it.
   *
   * @example
   * ```ts
   * const authURL = authFlow.getAuthURL({
   *   redirect_uri: "YOUR_REDIRECT_URI",
   *   scopes: ["user-read-email"],
   *   state: "123abc",
   * });
   * ```
   */
  getAuthURL({ scopes, ...opts }: GetAuthURLOpts): URL {
    const url = new URL(SPOTIFY_AUTH + "authorize");

    url.search = toQueryString<AuthorizeReqParams>({
      response_type: "code",
      scope: scopes?.join(" "),
      client_id: this.creds.client_id,
      ...opts
    });

    return url;
  }

  /**
   * Retrieves an access and refresh token from the Spotify API using an authorization code and client credentials.
   *
   * @param redirect_uri URI for redirection after the user grants or denies permission.
   * @param code An authorization code that you received from callback query params.
   *
   * @returns Spotify response containing access and refresh token. The following example, shows how the successful response looks like:
   * ```json
   * {
   *   "access_token": "NgCXRK...MzYjw",
   *   "token_type": "Bearer",
   *   "scope": "user-read-private user-read-email",
   *   "expires_in": 3600,
   *   "refresh_token": "NgAagA...Um_SHo"
   * }
   * ```
   */
  async getGrantData(redirect_uri: string, code: string) {
    const url = new URL(SPOTIFY_AUTH + "api/token");
    url.search = toQueryString<ApiTokenReqParams>({
      code,
      redirect_uri,
      grant_type: "authorization_code"
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: this.basicAuthHeader,
        "Content-Type": URL_ENCODED
      }
    });

    if (!res.ok) throw await SpotifyAuthError.create(res);

    return (await res.json()) as KeypairResponse;
  }

  /**
   * Requests a new access token using your refresh token and client credentials
   */
  async refresh(refresh_token: string) {
    const url = new URL(SPOTIFY_AUTH + "api/token");
    url.search = toQueryString<ApiTokenReqParams>({
      refresh_token,
      grant_type: "refresh_token"
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: this.basicAuthHeader,
        "Content-Type": URL_ENCODED
      }
    });

    if (!res.ok) throw await SpotifyAuthError.create(res);

    return (await res.json()) as ScopedAccessResponse;
  }

  static parseCallbackData = parseCallbackData;

  createAuthProvider(
    refresh_token: string,
    opts?: Omit<AuthProviderOpts<ScopedAccessResponse>, "refresher">
  ) {
    return createAuthProvider({
      refresher: (() => this.refresh(refresh_token)).bind(this),
      ...opts
    });
  }
}
