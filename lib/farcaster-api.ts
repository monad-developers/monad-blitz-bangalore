const NEYNAR_API_KEY = process.env.FARCASTER_API_KEY
const NEYNAR_BASE_URL = "https://api.neynar.com/v2/farcaster"

export interface FarcasterUser {
  fid: number
  username: string
  displayName: string
  bio: string
  pfpUrl: string
  followerCount: number
  followingCount: number
  verifications: string[]
  connectedAddresses: string[]
}

export class FarcasterAPI {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async searchUsers(query: string): Promise<any[]> {
    try {
      if (!this.apiKey) {
        console.error("Neynar API key (FARCASTER_API_KEY) is missing or empty. User search will fail.")
        return [] // Return empty if no API key
      }
      const response = await fetch(`${NEYNAR_BASE_URL}/user/search?q=${encodeURIComponent(query)}&limit=10`, {
        headers: {
          accept: "application/json",
          "x-api-key": this.apiKey,
        },
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error(
          `Farcaster API error during user search: ${response.status} - ${response.statusText}. Query: "${query}". Response body: ${errorBody}`,
        )
        if (response.status === 401) {
          console.error("Neynar API request unauthorized. This often indicates an invalid or missing API Key.")
        }
        return [] // Return empty on API error
      }

      const data = await response.json()
      return data.result?.users || []
    } catch (error) {
      console.error("Error searching Farcaster users:", error)
      return []
    }
  }

  async getUserByUsername(username: string): Promise<any | null> {
    try {
      const response = await fetch(`${NEYNAR_BASE_URL}/user/by_username?username=${username}`, {
        headers: {
          accept: "application/json",
          "x-api-key": this.apiKey,
        },
      })

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`Farcaster API error: ${response.status}`)
      }

      const data = await response.json()
      return data.result?.user || null
    } catch (error) {
      console.error("Error fetching Farcaster user:", error)
      return null
    }
  }

  async getUsersByFids(fids: number[]): Promise<any[]> {
    try {
      console.log("Fetching users by FIDs:", fids)

      const response = await fetch(`${NEYNAR_BASE_URL}/user/bulk?fids=${fids.join(",")}`, {
        headers: {
          accept: "application/json",
          "x-api-key": this.apiKey,
        },
      })

      if (!response.ok) {
        console.error("Farcaster API error:", response.status, await response.text())
        throw new Error(`Farcaster API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Farcaster API response:", data)

      // Fix: The bulk API returns users directly in the users array, not in result.users
      return data.users || []
    } catch (error) {
      console.error("Error fetching Farcaster users:", error)
      return []
    }
  }

  transformUser(apiUser: any): FarcasterUser {
    console.log("Transforming user:", apiUser)
    console.log("Raw verified_addresses:", apiUser.verified_addresses)

    const transformed = {
      fid: apiUser.fid,
      username: apiUser.username,
      displayName: apiUser.display_name || apiUser.username,
      bio: apiUser.profile?.bio?.text || "",
      pfpUrl: apiUser.pfp_url || "/placeholder.svg",
      followerCount: apiUser.follower_count || 0,
      followingCount: apiUser.following_count || 0,
      verifications: apiUser.verifications || [],
      connectedAddresses: apiUser.verified_addresses?.eth_addresses || [],
    }

    console.log("Transformed user result:", transformed)
    console.log("Connected addresses extracted:", transformed.connectedAddresses)
    return transformed
  }
}

export const farcasterAPI = new FarcasterAPI(NEYNAR_API_KEY || "")
