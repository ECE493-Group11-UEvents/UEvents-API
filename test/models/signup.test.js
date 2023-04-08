const request = require('supertest');
const app = require('../../app');
const UserModel = require('../../models/user');

describe('POST /signup', () => {
  // Mock the userExists and create methods of the UserModel
  UserModel.userExists = jest.fn().mockReturnValue(false);
  UserModel.create = jest.fn().mockReturnValue({ email: 'test@example.com' });

  test('should return 200 OK with the new user object if user does not exist', async () => {
    const response = await request(app)
      .post('/signup')
      .send({
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password: 'password123',
      });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ email: 'test@example.com' });
  });

  test('should return 409 Conflict if user already exists', async () => {
    UserModel.userExists.mockReturnValue(true);
    const response = await request(app)
      .post('/signup')
      .send({
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password: 'password123',
      });
    expect(response.status).toBe(409);
    expect(response.text).toBe('user already exists');
  });
});