"use client";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
const query = gql`
  {
    swapETHToTokens(
      where: { user: "0xd53cc2fAD80f2661e7Fd70fC7F2972A9fd9904C3" }
    ) {
      id
    }
  }
`;
const url = "https://api.studio.thegraph.com/query/97549/swipe/version/latest";
export default function Data() {
  // the data is already pre-fetched on the server and immediately available here,
  // without an additional network call
  const { data } = useQuery({
    queryKey: ["data"],
    async queryFn() {
      return await request(url, query);
    },
  });
  console.log(data);
  return <div></div>;
}
