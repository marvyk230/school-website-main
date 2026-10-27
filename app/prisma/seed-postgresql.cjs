if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
	throw new Error("Set DATABASE_URL and DIRECT_URL to the Neon connection strings before seeding PostgreSQL.");
}
if (!process.env.ADMIN_PASSWORD || Buffer.byteLength(process.env.ADMIN_PASSWORD, "utf8") < 10) {
	throw new Error("Set ADMIN_PASSWORD to a strong password of at least 10 bytes before seeding PostgreSQL.");
}
if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_EMAIL) {
	throw new Error("Set ADMIN_USERNAME and ADMIN_EMAIL before seeding PostgreSQL.");
}

require("./seed.cjs");
