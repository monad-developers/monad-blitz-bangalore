import { OnboardingPage } from "@/components/pages/onboarding";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import Data from "../components/Data";
const query = gql`
  {
    swapETHToTokens(
      where: { user: "0xd53cc2fAD80f2661e7Fd70fC7F2972A9fd9904C3" }
    ) {
      id
      token
    }
  }
`;
const url = "https://api.studio.thegraph.com/query/97549/swipe/version/latest";

export default async function Home() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["data"],
    async queryFn() {
      return await request(url, query);
    },
  });
  return (
    // Neat! Serialization is now as easy as passing props.
    // HydrationBoundary is a Client Component, so hydration will happen there.
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Data />
      <OnboardingPage />
    </HydrationBoundary>
  );
}
