import requests
import json
from utils import baseUrl, headers, create_pod, cleanup_created_pods

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
  podResponse = create_pod()
  pod = podResponse.json()

  url = f'{baseUrl}/api/pods/{pod["_id"]}'

  response = requests.request('GET', url)
  body = response.json()

  assert response.status_code == 200
  assert body['name'] == 'Test Pod'
  assert body['createdBy']['id'] == '12345'

def test_add_pod_member_success():
  podResponse = create_pod()
  pod = podResponse.json()

  url = f'{baseUrl}/api/pods/{pod["_id"]}/members'

  user = {
    'user': {
      'name': 'Test User'
    }
  }

  response = requests.request('PATCH', url, data=json.dumps(user), headers=headers)
  body = response.json()

  assert response.status_code == 200
  assert f'Added user [{user["user"]["name"]}]' in body['message']
  assert f'pod [{pod["_id"]}]' in body['message']

def test_delete_pod_by_id_success():
  cleanup_created_pods()
