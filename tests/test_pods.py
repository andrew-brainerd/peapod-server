import requests
import json

baseUrl = 'http://localhost:5000'

headers = {'Content-Type': 'application/json' } 

def test_create_pod_success():
  url = f'{baseUrl}/api/pods'

  pod = {
    'name': 'Test Pod',
    'createdBy': {
      'id': '12345',
      'name': 'Test User',
      'email': 'test@peapod.app'
    }
  }

  response = requests.request('POST', url, data=json.dumps(pod), headers=headers)
  body = response.json()

  assert response.status_code == 201
  assert body['name'] == 'Test Pod'
  assert body['createdBy']['id'] == '12345'

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
  assert 'ValidationError' in body['message']
  assert '["name" is required]' in body['message']

def test_get_user_pods_success():
  url = f'{baseUrl}/api/pods?userId=12345'

  response = requests.request('GET', url)
  body = response.json()

  print(body)

  assert response.status_code == 200
  assert len(body['items']) > 0

def test_get_pod_by_id_success():
  url = f'{baseUrl}/api/pods'

  pod = {
    'name': 'Test Pod',
    'createdBy': {
      'id': '12345',
      'name': 'Test User',
      'email': 'test@peapod.app'
    }
  }

  createResponse = requests.request('POST', url, data=json.dumps(pod), headers=headers)
  createBody = createResponse.json()
  createdId = createBody['_id']

  print(createBody)

  url = f'{baseUrl}/api/pods/{createdId}'

  response = requests.request('GET', url)
  body = response.json()

  assert response.status_code == 200
  assert body['name'] == 'Test Pod'
  assert body['createdBy']['id'] == '12345'
