import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src'; // adjust if your app is in another path
import UserModel from '../src/models/user';

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/mentorship-test');
  await UserModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Auth Routes', () => {
  const userData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'mentee'
  };

  let token: string;

  it('POST /auth/register - should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send(userData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(userData.email);

    token = res.body.token; // save for /auth/me test
  });

  it('POST /auth/login - should log in the user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });

    
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('token');
});

  it('GET /auth/me - should return current logged-in user', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(userData.email);
    expect(res.body.role).toBe(userData.role);
  });
});
