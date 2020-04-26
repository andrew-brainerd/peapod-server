import requests
import json
from utils import baseUrl, headers, create_pod, get_pod, cleanup_created_pods

def test_create_pod_success():
  response = create_pod()
  pod = response.json()

  assert response.status_code == 201
  assert pod['name'] == 'Test Pod'
  assert pod['createdBy']['id'] == '12345'

def test_create_pod_missing_name():
  url = f'{baseUrl}/api/pods'

  pod = {
    'createdBy': {
      'id': '12345',
      'name': 'Test User',
      'email': 'test@peapod.app'
    }
  }

  response = requests.request('POST', url, data=json.dumps(pod), headers=headers)
  body = response.json()

  assert response.status_code == 400
  assert 'Missing body param: [name]' in body['message']

def test_get_user_pods_success():
  url = f'{baseUrl}/api/pods?userId=12345'

  response = requests.request('GET', url)
  body = response.json()

  assert response.status_code == 200
  assert len(body['items']) > 0

def test_get_pod_by_id_success():
  create_response = create_pod()
  created_pod = create_response.json()
  
  pod = get_pod(created_pod["_id"])

  assert pod['name'] == 'Test Pod'
  assert pod['createdBy']['id'] == '12345'

def test_add_pod_member_success():
  create_response = create_pod()
  created_pod = create_response.json()

  url = f'{baseUrl}/api/pods/{created_pod["_id"]}/members'

  user = {
    'user': {
      'id': '2345',
      'name': 'Test Member',
      'email': 'member@peapod.app'
    }
  }

  response = requests.request('PATCH', url, data=json.dumps(user), headers=headers)
  body = response.json()

  assert response.status_code == 200
  assert f'Added user [{user["user"]["name"]}]' in body['message']
  assert f'pod [{created_pod["_id"]}]' in body['message']

  pod = get_pod(created_pod['_id'])
  assert user['user'] in pod['members']

def test_remove_pod_member_success():
  create_response = create_pod()
  created_pod = create_response.json()

  url = f'{baseUrl}/api/pods/{created_pod["_id"]}/members'

  user = {
    'user': {
      'id': '2345',
      'name': 'Test Member',
      'email': 'member@peapod.app'
    }
  }

  response = requests.request('PATCH', url, data=json.dumps(user), headers=headers)
  assert response.status_code == 200

  pod = get_pod(created_pod['_id'])
  assert user['user'] in pod['members']

  response = requests.request('DELETE', url, data=json.dumps(user), headers=headers)
  assert response.status_code == 200

  pod = get_pod(created_pod['_id'])
  assert user['user'] not in pod['members']

def test_delete_pod_by_id_success():
  cleanup_created_pods()
