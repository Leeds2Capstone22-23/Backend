from sgqlc.endpoint.http import HTTPEndpoint
import base64


class User:
    def __init__(self, username, password):
        self.username = username
        self.password = password

    # Return base64 encoded Basic Authorization header
    def get_auth_header(self):
        creds = f'{self.username}:{self.password}'
        creds_b64 = str(base64.b64encode(creds.encode('ascii')), 'ascii')
        return f'Basic {creds_b64}'


demo_user = User('demo_python_client_username', 'demo_python_client_password')


# for local development, get the POST endpoint from the Hasura interface
# dont include Authorization header yet since we need to register the user
url = 'http://localhost:8080/v1/graphql'
endpoint = HTTPEndpoint(url)


# make sure demo_user is registered
register_mutation = '''
mutation RegisterUser($username: String!, $password: String!) {
    register_new_user(username: $username, password: $password) {
        id
    }
}
'''
register_variables = {
    'username': demo_user.username,
    'password': demo_user.password
}
data = endpoint(register_mutation, register_variables)
# try getting user id after registration
try:
    demo_user_id = data['data']['register_new_user']['id']
    print(f'\nNew user id: {demo_user_id}')
except KeyError:
    # if this fails, look within the errors to see if we received a 401 Unauthorized status
    # this likely means the user already exists
    try:
        status = data['errors'][0]['extensions']['internal']['response']['status']
        if (status == 401):
            print('User probably already exists, continuing...')
            pass
    except:
        print('Unknown error. Data returned:')
        print(data)
        exit(1)


# now since we know the user exists, we can set their headers
headers = {
    'Authorization': demo_user.get_auth_header()
}
print('\nUsing headers:')
print(headers)
endpoint = HTTPEndpoint(url, headers)


# For local development, first add labels using "Add mutation" in the interface
query = '''
query {
    labels {
        id
        name
    }
}
'''

data = endpoint(query)
print('\nSelect labels for user:')
print(data)

query_for_user_id = '''
query MyQuery($_eq: String = "demo_python_client_username") {
  users(where: {username: {_eq: $_eq}}) {
    id
  }
}
'''

data = endpoint(query_for_user_id)
print('\nUser id:')
print(data)
