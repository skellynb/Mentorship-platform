import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server/src'; // adjust if your app path is different
import UserModel from '../server/src/models/user';

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/mentorship-test');
  await UserModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('User Routes', () => {
  const userData = {
    name: 'Jane User',
    email: 'jane@example.com',
    password: 'securepass',
    role: 'mentee'
  };

  let userId: string;
  let token: string;

  // Register user before testing user routes
  beforeAll(async () => {
    const res = await request(app).post('/auth/register').send(userData);
    token = res.body.token;
    userId = res.body.user._id;
  });

  it('GET /users/me - should return the current user', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(userData.email);
    expect(res.body.role).toBe(userData.role);
  });

  it('PUT /users/me/profile - should update user profile', async () => {
    const updateData = {
      bio: 'Passionate about learning.',
      skills: ['JavaScript', 'Node.js'],
      goals: 'Become a full-stack developer'
    };

    const res = await request(app)
      .put('/users/me/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Profile updated successfully');
    expect(res.body.user.bio).toBe(updateData.bio);
    expect(res.body.user.skills).toEqual(expect.arrayContaining(updateData.skills));
    expect(res.body.user.goals).toBe(updateData.goals);
  });
});
