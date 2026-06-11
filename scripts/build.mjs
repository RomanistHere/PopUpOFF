// Builds the extension for each supported browser into dist/.
//
//   node scripts/build.mjs
//
// dist/chrome  - copy of the source as-is (the root manifest.json is the Chrome one)
// dist/firefox - same source with a derived manifest and firefox-specific tweaks:
//                  * event page background ("scripts") instead of "service_worker"
//                  * browser_specific_settings with the published AMO id
//                  * "source=chrome" link params rewritten to "source=firefox"

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

// everything the shipped extension consists of
const sources = ["manifest.json", "background", "constants", "content", "css", "images", "options", "popup"];

const GECKO_ID = "{154cddeb-4c8b-4627-a478-c7e5b427ffdf}";
// 128 ESR: ES module event pages and install-time prompt for MV3 host permissions
const GECKO_MIN_VERSION = "128.0";

const copySources = target => {
	fs.mkdirSync(target, { recursive: true });
	for (const entry of sources) {
		fs.cpSync(path.join(root, entry), path.join(target, entry), { recursive: true });
	}
};

const buildChrome = () => {
	copySources(path.join(dist, "chrome"));
};

const buildFirefox = () => {
	const target = path.join(dist, "firefox");
	copySources(target);

	// derive the firefox manifest from the chrome one
	const manifestPath = path.join(target, "manifest.json");
	const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

	// firefox doesn't support background service workers - use an event page
	manifest.background = {
		scripts: [manifest.background.service_worker],
		type: "module",
	};
	manifest.browser_specific_settings = {
		gecko: {
			id: GECKO_ID,
			strict_min_version: GECKO_MIN_VERSION,
			// AMO requires declaring what data the extension collects: nothing
			data_collection_permissions: {
				required: ["none"],
			},
		},
		gecko_android: {},
	};
	fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t") + "\n");

	// rewrite the analytics source param in links (popup/options html, background js)
	const rewriteSourceParam = dir => {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const entryPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				rewriteSourceParam(entryPath);
			} else if (/\.(html|js)$/.test(entry.name)) {
				const content = fs.readFileSync(entryPath, "utf8");
				const replaced = content.replaceAll("source=chrome", "source=firefox");
				if (replaced !== content) fs.writeFileSync(entryPath, replaced);
			}
		}
	};
	rewriteSourceParam(target);
};

fs.rmSync(dist, { recursive: true, force: true });
buildChrome();
buildFirefox();
console.log("Built dist/chrome and dist/firefox");
