import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src';  // your express app
import UserModel from '../src/models/user';
import { Session } from '../src/models/session';

describe('Mentorship Sessions', () => {
  let menteeToken: string;
  let mentorToken: string;
  let menteeId: string;
  let mentorId: string;
  let sessionId: string;

  const menteeData = {
    name: 'Test Mentee',
    email: 'mentee@example.com',
    password: 'password123',
    role: 'mentee',
  };

  const mentorData = {
    name: 'Test Mentor',
    email: 'mentor@example.com',
    password: 'password123',
    role: 'mentor',
  };

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/mentorship-test');
    await UserModel.deleteMany({});
    await Session.deleteMany({});

    // Register mentee
    const menteeRes = await request(app).post('/auth/register').send(menteeData);
    menteeToken = menteeRes.body.token;
    menteeId = menteeRes.body.user.id;

    // Register mentor
    const mentorRes = await request(app).post('/auth/register').send(mentorData);
    mentorToken = mentorRes.body.token;
    mentorId = mentorRes.body.user.id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('POST /sessions - mentee books a new session', async () => {
    const res = await request(app)
      .post('/sessions')
      .set('Authorization', `Bearer ${menteeToken}`)
      .send({
        mentorId,
        date: '2025-08-15',
        startTime: '10:00',
        endTime: '11:00',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.mentorId).toBe(mentorId);
    expect(res.body.menteeId).toBe(menteeId);

    sessionId = res.body._id;
  });

  it('GET /sessions/mentor - mentor views their sessions', async () => {
    const res = await request(app)
      .get('/sessions/mentor')
      .set('Authorization', `Bearer ${mentorToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].mentorId).toBe(mentorId);
  });

  it('GET /sessions/mentee - mentee views their sessions', async () => {
    const res = await request(app)
      .get('/sessions/mentee')
      .set('Authorization', `Bearer ${menteeToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].menteeId).toBe(menteeId);
  });

  it('GET /sessions/user/:userId - get sessions for any user', async () => {
    const res = await request(app)
      .get(`/sessions/user/${mentorId}`)
      .set('Authorization', `Bearer ${mentorToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
