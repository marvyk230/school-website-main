const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const envPath = path.join(process.cwd(), ".env");
const examplePath = path.join(process.cwd(), ".env.example");
if (!fs.existsSync(examplePath)) {
	throw new Error("Missing .env.example. Run this command from the app directory.");
}

let contents = fs.existsSync(envPath)
	? fs.readFileSync(envPath, "utf8")
	: fs.readFileSync(examplePath, "utf8");

function setDefault(name, value, replacePlaceholder = false) {
	const prefix = `${name}=`;
	const line = contents.split(/\r?\n/).find((item) => item.startsWith(prefix));
	if (line) {
		const current = line.slice(prefix.length).trim().replace(/^["']|["']$/g, "");
		if (current && !(replacePlaceholder && current.startsWith("replace-with-"))) return;
		contents = contents.replace(line, `${prefix}${value}`);
		return;
	}
	contents = `${contents.trimEnd()}\n${prefix}${value}\n`;
}

setDefault("DATABASE_URL", '"file:./dev.db"');
setDefault("JWT_ACCESS_TOKEN_SECRET", crypto.randomBytes(32).toString("hex"), true);
setDefault("JWT_REFRESH_TOKEN_SECRET", crypto.randomBytes(32).toString("hex"), true);
fs.writeFileSync(envPath, contents, { encoding: "utf8", mode: 0o600 });
console.log("Local environment is ready. SQLite is configured and missing JWT secrets were generated.");
