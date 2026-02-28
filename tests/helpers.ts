const BASE_URL = process.env.TEST_BASE_URL || 'https://127.0.0.1:3001';

const headers = { 'Content-Type': 'application/json' };

const createdPodIds: string[] = [];

export async function createPod() {
  const url = `${BASE_URL}/api/pods`;
  const pod = {
    createdBy: {
      id: '12345',
      name: 'Test User',
      email: 'test@peapod.app',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(pod),
  });

  const body = await response.json();
  if (response.status === 201) {
    createdPodIds.push(body._id);
  }

  return { response, body };
}

export async function getPod(podId: string) {
  const url = `${BASE_URL}/api/pods/${podId}`;
  const response = await fetch(url);
  return response.json();
}

export async function cleanupCreatedPods() {
  for (const podId of createdPodIds) {
    await fetch(`${BASE_URL}/api/pods/${podId}`, { method: 'DELETE' });
  }
  createdPodIds.length = 0;
}

export { BASE_URL, headers };
