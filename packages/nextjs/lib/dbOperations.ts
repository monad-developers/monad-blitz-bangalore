import { TokenPair } from "@/components/providers/token-provider";

// Example utility function for API calls
const API_BASE_URL = '/api/users';

// Function to create a new user
export const createUser = async (email: string) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Function to add a coin to user's portfolio
export const addCoinToPortfolio = async (email: string, coin:TokenPair, defaultValue:string) => {
    const coinData ={
        name:coin.baseToken.name,
        imageUrl:coin.info.imageUrl,
        address:coin.baseToken.address,
        amount:coin.amount,
        value: defaultValue
    }
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, coin: coinData }),
    });

    console.log("The response is",response);

    if (!response.ok) {
      throw new Error('Failed to add coin');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding coin:', error);
    throw error;
  }
};

// Function to get user details
export const getUserDetails = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}?email=${encodeURIComponent(email)}`);

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};