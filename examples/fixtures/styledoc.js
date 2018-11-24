// example, from https://github.com/thybzi/styledoc/blob/master/styledoc.js
/**
 * Load and parse CSS file, creating showcase page
 * @param {string} url URL or relative path to root CSS file
 * @param {object} options
 * @param {string} [options.output_dir="showcase/"] Path to showcase page directory, relative to current location (FS mode only)
 * @param {string} [options.$container=$("body")] Root container for showcase in parent document (HTTP mode only)
 * @param {string} [options.template="default"] Name of showcase page template
 * @param {string} [options.language="en"] Language to apply when creating page
 * @param {string} [options.doctype="html5"] Target doctype
 * @param {string} [options.page_title="StyleDoc showcase"] Main title of showcase page (in HTTP mode document.title has priority)
 * @param {string} [options.css_url_http] HTTP(S) path to CSS file to use in preview (detected automatically by default) (FS mode only)
 * @param {number} [options.iframe_delay=2000] Delay (ms) before measuring iframe height
 * @param {boolean} [options.use_phantomjs=false] Use PhantomJS to pre-measure iframes height (FS mode only)
 * @param {string|object} [options.phantomjs_viewport="1280x800"] Viewport size for PhantomJS instances (FS mode only)
 * @param {object} [options.phantomjs_noweak=false] Disable "weak" module usage for PhantomJS instances (FS mode only)
 * @param {boolean} [options.silent_mode=false] Disable console messages (FS mode only)
 * @param {number|number[]} [options.preview_padding] Padding value(s) for preview container (4 or [4, 8], or [4, 0, 12, 8] etc.)
 * @param {string} [options.background_color] Background color CSS value for both main showcase page and preview iframe pages
 * @returns {JQueryPromise<void>}
 */
styledoc.showcaseFile = function (url, options) {};