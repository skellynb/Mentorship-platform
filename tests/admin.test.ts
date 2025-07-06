import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server/src'; // your Express app
import UserModel from '../server/src/models/user';

describe('Admin Routes', () => {
  let adminToken: string;
  let userIdToUpdate: string;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/mentorship-test');
    await UserModel.deleteMany({});

    // Create an admin user
    const adminRes = await request(app).post('/auth/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'adminpass',
      role: 'admin',
    });
    adminToken = adminRes.body.token;

    // Create a normal user to update role
    const userRes = await request(app).post('/auth/register').send({
      name: 'Normal User',
      email: 'user@example.com',
      password: 'userpass',
      role: 'mentee',
    });
    userIdToUpdate = userRes.body.user.id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('GET /admin/users - should get all users', async () => {
    const res = await request(app)
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2); // at least admin + user
  });

  it('PUT /admin/users/:id/role - should update user role', async () => {
    const res = await request(app)
      .put(`/admin/users/${userIdToUpdate}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'mentor' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/updated to mentor/i);
    expect(res.body.user.role).toBe('mentor');
  });

  it('PUT /admin/users/:id/role - should reject invalid role', async () => {
    const res = await request(app)
      .put(`/admin/users/${userIdToUpdate}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'invalidrole' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid role/i);
  });
});
