import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const { username } = params;
  console.log(username);

  // Replace with your actual Neynar API key
  const neynarApiKey = process.env.NEYNAR_API_KEY || '';

  if (!neynarApiKey) {
    return NextResponse.json(
      { error: 'Neynar API key is missing' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?usernames=${username}`,
      {
        headers: {
          accept: 'application/json',
          api_key: neynarApiKey,
        },
      }
    );

    console.log(response);

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Error fetching user data' },
      { status: 500 }
    );
  }
}
