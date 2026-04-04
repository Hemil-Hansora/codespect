import { Polar } from "@polar-sh/sdk"

const polarServer =
    process.env.POLAR_SERVER === "production" ? "production" : "sandbox";

const polarAccessToken = process.env.POLAR_ACCESS_TOKEN?.trim();

if (!polarAccessToken) {
    throw new Error(
        "POLAR_ACCESS_TOKEN is missing. Set a valid Polar access token in your environment.",
    );
}

const tokenFingerprint = `${polarAccessToken.slice(0, 12)}...${polarAccessToken.slice(-6)}`;

export const polarDiagnostics = {
    server: polarServer,
    tokenFingerprint,
};

if (process.env.NODE_ENV !== "production") {
    console.error(
        `[Polar] initialized with server=${polarServer} token=${tokenFingerprint}`,
    );
}

export const polarClient = new Polar({
    accessToken: polarAccessToken,
    server: polarServer,
});
