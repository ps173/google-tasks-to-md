import readline from "readline";
import { getGoogleAuthLink, exchangeAuthCode } from "./tasks";
import { saveCredentials, getCredentials, updateCredentials } from "./db";
import dayjs from "dayjs";

export const connectToGoogle = async () => {
  console.log("Connecting to Google account...");

  // Check if credentials are already saved and not expired
  const credentials = await getCredentials();
  if (credentials) {
    const accessTokenExpired = dayjs().isAfter(
      dayjs(credentials.accessTokenExpiry)
    );
    const refreshTokenExpired = dayjs().isAfter(
      dayjs(credentials.refreshTokenExpiry)
    );

    if (!accessTokenExpired && !refreshTokenExpired) {
      console.log("Already connected.");
      return;
    }
  }

  const authLink = getGoogleAuthLink();
  console.log(`Please visit the following URL to authenticate: ${authLink}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the authorization code: ", async (code) => {
    console.log(`Received authorization code: ${code}`);
    try {
      const tokens = await exchangeAuthCode(code);
      console.log("Tokens received:", tokens);

      if (credentials) {
        await updateCredentials(
          credentials.id,
          tokens.refresh_token,
          tokens.access_token,
          tokens.expires_in,
          tokens.refresh_token_expires_in
        );
        console.log("Credentials updated successfully.");
      } else {
        await saveCredentials(
          tokens.refresh_token,
          tokens.access_token,
          tokens.expires_in,
          tokens.refresh_token_expires_in
        );
        console.log("Credentials saved successfully.");
      }
    } catch (error) {
      console.error("Error exchanging authorization code:", error);
    }
    rl.close();
  });
};
