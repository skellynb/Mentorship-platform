import request from 'supertest';
import app from '../server/src'; // path to your Express app
import mongoose from 'mongoose';
import UserModel from '../server/src/models/user';
import RequestModel from '../server/src/models/request';

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/mentorship-test');
  await UserModel.deleteMany({});
  await RequestModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Mentorship Request Flow', () => {
  let menteeToken: string;
  let mentorToken: string;
  let mentorId: string;
  let requestId: string;

  const menteeData = {
    name: 'Mentee One',
    email: 'mentee1@example.com',
    password: 'pass1234',
    role: 'mentee',
  };

  const mentorData = {
    name: 'Mentor One',
    email: 'mentor1@example.com',
    password: 'pass1234',
    role: 'mentor',
  };

  beforeAll(async () => {
    // Register mentee
    const menteeRes = await request(app).post('/auth/register').send(menteeData);
    menteeToken = menteeRes.body.token;

    // Register mentor
    const mentorRes = await request(app).post('/auth/register').send(mentorData);
    mentorToken = mentorRes.body.token;

    console.log('mentorRes.body:', mentorRes.body);

    // Try to get mentorId from response user.id
    mentorId = mentorRes.body.user?.id;

    // Fallback: if undefined, query DB directly
    if (!mentorId) {
      const mentorUser = await UserModel.findOne({ email: mentorData.email });
      mentorId = mentorUser?._id.toString() || '';
    }

    console.log('Captured mentorId:', mentorId);
  });

  it('POST /requests - Mentee sends mentorship request', async () => {
    const res = await request(app)
      .post('/requests')
      .set('Authorization', `Bearer ${menteeToken}`)
      .send({
        to: mentorId,
        message: 'I would like mentorship in backend.',
      });

    console.log('POST /requests res.body:', res.body);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.to).toBe(mentorId);

    requestId = res.body._id;
  });

  it('GET /requests/sent - Mentee views sent requests', async () => {
    const res = await request(app)
      .get('/requests/sent')
      .set('Authorization', `Bearer ${menteeToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]._id).toBe(requestId);
  });

  it('GET /requests/received - Mentor views received requests', async () => {
    const res = await request(app)
      .get('/requests/received')
      .set('Authorization', `Bearer ${mentorToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]._id).toBe(requestId);
    expect(res.body[0].message).toBe('I would like mentorship in backend.');
  });

  it('PUT /requests/:id - Mentor updates request status', async () => {
    const res = await request(app)
      .put(`/requests/${requestId}`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({ status: 'ACCEPTED' });

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(requestId);
    expect(res.body.status).toBe('ACCEPTED');
  });
});