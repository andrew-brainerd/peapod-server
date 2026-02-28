import { describe, it, expect, afterAll } from 'vitest';
import { BASE_URL, headers, createPod, getPod, cleanupCreatedPods } from './helpers.js';

afterAll(async () => {
  await cleanupCreatedPods();
});

describe('Pods', () => {
  it('should create a pod', async () => {
    const { response, body } = await createPod();

    expect(response.status).toBe(201);
    expect(body.createdBy.id).toBe('12345');
    expect(body._id).toBeDefined();
  });

  it('should return 400 when missing createdBy', async () => {
    const response = await fetch(`${BASE_URL}/api/pods`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toContain('Missing body param: [createdBy]');
  });

  it('should get pods by userId', async () => {
    await createPod();

    const response = await fetch(`${BASE_URL}/api/pods?userId=12345`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items.length).toBeGreaterThan(0);
  });

  it('should get a pod by id', async () => {
    const { body: created } = await createPod();

    const pod = await getPod(created._id);

    expect(pod.createdBy.id).toBe('12345');
  });

  it('should add a member to a pod', async () => {
    const { body: created } = await createPod();
    const user = { id: '2345', name: 'Test Member', email: 'member@peapod.app' };

    const response = await fetch(`${BASE_URL}/api/pods/${created._id}/members`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ user }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toContain(`Added user [${user.name}]`);
    expect(body.message).toContain(`pod [${created._id}]`);

    const pod = await getPod(created._id);
    expect(pod.members).toContainEqual(user);
  });

  it('should remove a member from a pod', async () => {
    const { body: created } = await createPod();
    const user = { id: '2345', name: 'Test Member', email: 'member@peapod.app' };

    await fetch(`${BASE_URL}/api/pods/${created._id}/members`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ user }),
    });

    const response = await fetch(`${BASE_URL}/api/pods/${created._id}/members`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ user }),
    });

    expect(response.status).toBe(200);

    const pod = await getPod(created._id);
    expect(pod.members).not.toContainEqual(user);
  });

  it('should add a track to the queue', async () => {
    const { body: created } = await createPod();
    const track = { artist: 'Tame Impala', name: 'Breathe Deeper' };

    const response = await fetch(`${BASE_URL}/api/pods/${created._id}/queue`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ track }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toContain(`Added track [${track.name}]`);

    const pod = await getPod(created._id);
    expect(pod.queue).toContainEqual(track);
  });

  it('should remove a track from the queue', async () => {
    const { body: created } = await createPod();
    const track = { artist: 'Tame Impala', name: 'Breathe Deeper' };

    await fetch(`${BASE_URL}/api/pods/${created._id}/queue`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ track }),
    });

    const response = await fetch(`${BASE_URL}/api/pods/${created._id}/queue`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ track }),
    });

    expect(response.status).toBe(200);

    const pod = await getPod(created._id);
    expect(pod.queue).not.toContainEqual(track);
  });

  it('should add a track to history', async () => {
    const { body: created } = await createPod();
    const track = { artist: 'Tame Impala', name: 'Breathe Deeper' };

    const response = await fetch(`${BASE_URL}/api/pods/${created._id}/history`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ track }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toContain(`Added track [${track.name}]`);

    const pod = await getPod(created._id);
    expect(pod.history).toContainEqual(track);
  });

  it('should add an active member', async () => {
    const { body: created } = await createPod();
    const user = { id: '2345', name: 'Test Member', email: 'member@peapod.app' };

    const response = await fetch(`${BASE_URL}/api/pods/${created._id}/activeMembers`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ user }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toContain(`Added active user [${user.name}]`);

    const pod = await getPod(created._id);
    expect(pod.activeMembers).toContain(user.id);
  });

  it('should delete a pod', async () => {
    const { body: created } = await createPod();

    const response = await fetch(`${BASE_URL}/api/pods/${created._id}`, {
      method: 'DELETE',
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toContain(`Deleted pod [${created._id}]`);
  });
});
