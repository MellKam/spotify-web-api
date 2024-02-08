import type { SimplifiedAudiobook } from "../audiobook/audiobook.types.ts";
import type {
	ExternalUrls,
	Image,
	ReleaseDatePrecision,
	Restrictions,
	ResumePoint,
} from "../general.types.ts";

export interface SimplifiedChapter {
	/**
	 * A URL to a 30 second preview (MP3 format).
	 */
	audio_preview_url: string;
	/**
	 * A list of the countries in which the episode can be played.
	 */
	available_markets: string[];
	/**
	 * The number of the episode
	 */
	chapter_number: number;
	/**
	 * The description of the episode without html tags.
	 */
	description: string;
	/**
	 * The description of the episode with html tags.
	 */
	html_description: string;
	/**
	 * The episode length in milliseconds.
	 */
	duration_ms: number;
	/**
	 * Whether or not the episode has explicit lyrics.
	 */
	explicit: boolean;
	/**
	 * External URLs for this episode.
	 */
	external_urls: ExternalUrls;
	/**
	 * A link to the Web API endpoint providing full details of the episode.
	 */
	href: string;
	/**
	 * The Spotify ID for the episode.
	 */
	id: string;
	/**
	 * Images of the episode in various sizes, widest first.
	 */
	images: Image[];
	/**
	 * If true, the episode is playable in the given market.
	 * Otherwise false.
	 */
	is_playable: boolean;
	/**
	 * A list of the languages used in the episode, identified by their ISO 639-1 code.
	 */
	languages: string[];
	/**
	 * The name of the episode.
	 */
	name: string;
	/**
	 * The date the episode was first released.
	 * Depending on the precision it might be shown in different ways
	 */
	release_date: string;
	/**
	 * The precision with which `release_date` value is known.
	 */
	release_date_precision: ReleaseDatePrecision;
	/**
	 * The user's most recent position in the episode.
	 */
	resume_point: ResumePoint;
	/**
	 * The object type.
	 */
	type: "episode";
	/**
	 * The Spotify URI for the episode.
	 */
	uri: string;
	/**
	 * Included in the response when a content restriction is applied.
	 */
	restrictions?: Restrictions;
}

export interface Chapter extends SimplifiedChapter {
	audiobook: SimplifiedAudiobook;
}
