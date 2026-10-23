# Can the browser call Claude, OpenAI and Gemini directly?

Date: 2026-10-23. Question from task 10 (backend v1): Lu chose to check keys in the browser (PRD 8.12). A provider that blocks browser calls would move to the local `server/`.

## Answer

All three allow it. None needs the local server.

| Provider | Check call | Browser can read the reply | Extra header needed |
|---|---|---|---|
| Claude | `GET https://api.anthropic.com/v1/models?limit=1` | Yes | `anthropic-dangerous-direct-browser-access: true` |
| OpenAI | `GET https://api.openai.com/v1/models` | Yes | none |
| Gemini | `GET https://generativelanguage.googleapis.com/v1beta/models?pageSize=1` | Yes | none (key in `x-goog-api-key`) |

Jimeng has no browser API in this project: it runs through the Dreamina CLI on the user's machine, so it stays on the local `server/`.

## Our measurements

Run with `curl` from Lu's Mac on 2026-10-23, `Origin: null` (what a page opened over `file://` sends), with no key or a made-up key. No real key was used.

| Request | Result |
|---|---|
| Claude preflight `OPTIONS /v1/models` | 200, `access-control-allow-origin: *`, allows `x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access` |
| Claude `GET /v1/models`, bad key, **without** the browser header | 401, **no** `access-control-allow-origin`: the browser cannot read the error |
| Claude `GET /v1/models`, bad key, **with** the browser header | 401, `access-control-allow-origin: *`, body `authentication_error` / `invalid x-api-key` |
| OpenAI preflight | 200, `access-control-allow-origin: *`, allows `authorization` |
| OpenAI `GET /v1/models`, bad key | 401, `access-control-allow-origin: *`, `code: invalid_api_key` |
| Gemini preflight | 200, `access-control-allow-origin: null`, allows `x-goog-api-key` |
| Gemini `GET /v1beta/models`, bad key | 400, `access-control-allow-origin: null`, `status: INVALID_ARGUMENT`, `reason: API_KEY_INVALID` |

So Claude works from the browser only with the extra header; without it, even errors are unreadable.

## The calls the page makes (task 14)

Run with `curl` from Lu's Mac on 2026-10-23, `Origin: null`, no key or a made-up key (`FAKE`). No real key was used.

| Request | Result |
|---|---|
| Claude preflight `OPTIONS /v1/messages` | 200, `access-control-allow-origin: *`, allows `content-type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access` |
| Claude `POST /v1/messages`, bad key, with the browser header | 401, `access-control-allow-origin: *`, `authentication_error` |
| OpenAI preflight `OPTIONS /v1/images/edits` | 200, `access-control-allow-origin: *`, allows `authorization` |
| OpenAI `POST /v1/images/edits` (multipart), bad key | 401, `access-control-allow-origin: *`, "Incorrect API key provided" |
| Gemini preflight `OPTIONS /v1beta/models/gemini-3.8-flash:generateContent` | 200, `access-control-allow-origin: null`, allows `content-type, x-goog-api-key` |
| Gemini `POST …:generateContent`, bad key | 400, `access-control-allow-origin: null`, `API_KEY_INVALID` |

Docs for these calls:
- Claude structured output (`output_config.format` with `json_schema`; every object needs `additionalProperties: false`; the JSON comes back in the text block): https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- OpenAI image edits (multipart `model`, `image`, `prompt`; GPT Image models return `b64_json`): https://developers.openai.com/api/docs/guides/image-generation. `gpt-image-1` and `gpt-image-1-mini` are deprecated and removed on 2026-12-01; replacements `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare`: https://developers.openai.com/api/docs/deprecations
- Gemini audio (`generateContent` with `inlineData`; the examples use `gemini-3.8-flash`; requests up to 20 MB including inline files): https://ai.google.dev/gemini-api/docs/generate-content/audio

## What the docs say

**Claude**
- Browser use is off by default in the official SDK and turned on with `dangerouslyAllowBrowser`: https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript ("Enable browser support by explicitly setting `dangerouslyAllowBrowser` to `true`"). The SDK sends `anthropic-dangerous-direct-browser-access: true` when that option is on: https://github.com/anthropics/anthropic-sdk-typescript/blob/main/src/client.ts. The header name itself is not on a docs page; our measurement above confirms its effect.
- List models: https://platform.claude.com/docs/en/api/models/list. `x-api-key` is still supported ("Legacy fallback for `Authorization`, still supported"), and `anthropic-version` is required: https://platform.claude.com/docs/en/api/overview.
- Errors: https://platform.claude.com/docs/en/api/errors — 401 `authentication_error`, 402 `billing_error`, 403 `permission_error`, 429 `rate_limit_error`, 529 `overloaded_error`; 400 when an organization or workspace spend limit is reached.

**OpenAI**
- List models: https://developers.openai.com/api/reference/resources/models/methods/list
- Errors: https://developers.openai.com/api/docs/guides/error-codes — 401 "Incorrect API key provided"; 429 for rate limits; billing errors carry `error.type` `insufficient_quota` and an `error.code` such as `credit_balance_exhausted`.

**Gemini**
- List models: https://ai.google.dev/api/models. `x-goog-api-key` header: https://ai.google.dev/gemini-api/docs/api-key
- Errors: https://ai.google.dev/gemini-api/docs/generate-content/api-errors — 400 `INVALID_ARGUMENT` (bad key returns "API key not valid"), 403 `PERMISSION_DENIED`, 429 `RESOURCE_EXHAUSTED` (rate or spend limits).

**Dreamina CLI**
- Official page: https://dreamina.capcut.com/tools/dreamina-cli ("Dreamina CLI generation tasks consume account benefits or credits."). Command reference shipped by the official installer: https://lf3-static.bytednsdoc.com/obj/eden-cn/psj_hupthlyk/ljhwZthlaukjlkulzlp/dreamina_cli_beta/SKILL.md ("Use `user_credit` to check budget"; login with `dreamina login`).
- `dreamina user_credit` output format is not documented. Measured locally: JSON with `total_credit`, `user_id`, `user_name`, `vip_level`. The server returns only `total_credit`.

## Risks we accept

All three providers warn against putting keys in client-side code:
- OpenAI: "Never deploy your key in client-side environments like browsers or mobile apps." https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
- Google: "Do not hardcode API keys directly in web or mobile apps." https://ai.google.dev/gemini-api/docs/api-key
- Anthropic: `dangerouslyAllowBrowser` "exposes your secret API credentials in the client-side code."

Their concern is a developer shipping their own key inside an app. Here each user types their own key into their own browser and it stays in `localStorage` (Lu, 2026-10-23). What remains: any script running on the page can read `localStorage`, so the page must not load third-party scripts. It loads none today.

## What a key check cannot tell

Listing models is a read-only call; none of the three docs says what it costs, and it does not touch billing. So a key with no credit still passes the check. "No credit" shows up only on the first real call. The error text for it is ready (see `index.html`, `providerErrorText`), but the check itself cannot catch it without a paid call.

## `file://` pages share one `localStorage` in Chrome

**Decided (Lu, 2026-10-23, `decisions.md`, lujin88/Lumi-Storytelling#18):** keys and the GitHub token are saved only when Lumi is opened over http(s). Over `file://` they stay in memory, and old saved copies are cleared on open (lujin88/Lumi-Storytelling#20). The findings below are kept as the reason.

**Confirmed in Chrome.** Every page opened from a local file shares the same `localStorage`, whatever folder it is in.

Measured on Lu's Mac, 2026-10-23, Google Chrome 156.0.8078.48 (Playwright, headless, fresh profile): `a/deep/write.html` stored a value; `b/read.html`, in an unrelated folder and another tab, read it back. Both pages report `location.origin` as `file://`. Safari and Firefox were not tested (no driver installed here).

What this means if keys are stored while Lumi runs over `file://`:
- Any HTML file the user opens from disk in the same Chrome profile can read the keys: a downloaded email attachment, a saved web page, another tool's export, and the story site Lumi itself exports.
- Such a page can also send them out: `file://` pages can `fetch` any HTTPS endpoint that allows CORS.
- "The page loads no third-party scripts" no longer covers it, because the attacker does not need to run on our page.

Options that were put to Lu:
- **Serve Lumi over http(s) only** and refuse to store keys on `file://`. An `https://<user>.github.io` origin is shared by every Pages project of that user, so hosting at `lujin88.github.io/Lumi-Storytelling` shares storage with Lu's other Pages projects; a custom domain or a dedicated `*.github.io` account avoids that. `http://localhost:<port>` is per port.
- **Keep `file://`, keep keys only in `sessionStorage` or memory**: `sessionStorage` is per tab, so files in other tabs cannot read it (not measured here; a file opened later in the same tab still could). Cost: the user re-enters keys every visit.
- **Accept the risk** and say so on the key screen.
