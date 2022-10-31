from sgqlc.endpoint.http import HTTPEndpoint

# for local development, get the POST endpoint from the Hasura interface
url = 'http://localhost:8080/v1/graphql'
headers = {}

# For local development, first add labels using "Add mutation" in the interface
query = 'query { labels {id} }'
variables = {}

endpoint = HTTPEndpoint(url, headers)
data = endpoint(query, variables)

print(data)