const clientId = process.env.GOOGLE_CLIENT_ID as string;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
const redirectUri = "http://localhost"; // Loopback URL for desktop apps

export function getGoogleAuthLink() {
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append(
    "scope",
    "https://www.googleapis.com/auth/tasks.readonly"
  );
  authUrl.searchParams.append("access_type", "offline");
  return authUrl.toString();
}

export async function getTaskLists(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/tasks/v1/users/@me/lists",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(`Error fetching task lists: ${response.statusText}`);
  }
  return response.json();
}

export async function getTasks(accessToken: string, taskListId: string) {
  const response = await fetch(
    `https://www.googleapis.com/tasks/v1/lists/${taskListId}/tasks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(`Error fetching tasks: ${response.statusText}`);
  }
  return response.json();
}

export async function exchangeAuthCode(authCode: string) {
  const tokenUrl = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams();
  params.append("code", authCode);
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("redirect_uri", redirectUri);
  params.append("grant_type", "authorization_code");

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Error exchanging auth code: ${response.statusText}`);
  }

  return response.json();
}
