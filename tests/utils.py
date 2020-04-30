import requests
import json

baseUrl = 'http://localhost:5000'

headers = {'Content-Type': 'application/json' }

created_pods = []

def create_pod():
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
  pod = response.json()

  assert response.status_code == 201

  created_pods.append(pod['_id'])
  
  return response

def get_pod(pod_id):
  url = f'{baseUrl}/api/pods/{pod_id}'
  response = requests.request('GET', url)
  assert response.status_code == 200
  return response.json()

def cleanup_created_pods():
  for pod_id in created_pods:
    url = f'{baseUrl}/api/pods/{pod_id}'
    response = requests.request('DELETE', url)
    body = response.json()

    if (response.status_code == 200):
      assert f'Deleted pod [{pod_id}]' in body['message']