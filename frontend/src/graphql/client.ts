import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { API_URL } from "../lib/env";
import { readStoredSession, writeStoredSession } from "../lib/storage";

const authLink = new ApolloLink((operation, forward) => {
  const session = readStoredSession();
  operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
    headers: session ? { ...headers, Authorization: `Bearer ${session.token}` } : headers,
  }));
  return forward(operation);
});

const unauthorizedLink = onError(({ networkError }) => {
  if (networkError && "statusCode" in networkError && networkError.statusCode === 401) {
    writeStoredSession(null);
    window.location.assign("/login");
  }
});

export function createApolloClient(uri: string = `${API_URL}/graphql`): ApolloClient {
  return new ApolloClient({
    link: ApolloLink.from([unauthorizedLink, authLink, new HttpLink({ uri })]),
    cache: new InMemoryCache(),
  });
}
