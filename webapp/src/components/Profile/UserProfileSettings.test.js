import UserProfileSettings from './UserProfileSettings';
import axios from 'axios';

jest.mock('axios');

describe('UserProfileSettings', () => {
  const userProfileSettings = new UserProfileSettings();
  const mockCookie = JSON.stringify({ username: 'testUser', token: 'testToken' });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('changeUsernameAndPassword', () => {
    it('should successfully change username and password', async () => {
      const mockResponse = { data: { newUsername: 'newUser', token: 'newToken' } };
      axios.patch.mockResolvedValue(mockResponse);

      const result = await userProfileSettings.changeUsernameAndPassword(mockCookie, 'newUser', 'newPass', 'newPass');

      expect(result).toEqual({ username: 'newUser', token: 'newToken' });
      expect(axios.patch).toHaveBeenCalledWith(
        'http://localhost:8000/users/testUser',
        { username: 'newUser', password: 'newPass', passwordRepeat: 'newPass' },
        { headers: { Authorization: 'Bearer testToken' } }
      );
    });

    it('should throw an error if the API call fails', async () => {
      axios.patch.mockRejectedValue({ response: { data: { error: 'Error message' } } });

      await expect(userProfileSettings.changeUsernameAndPassword(mockCookie, 'newUser', 'newPass', 'newPass'))
        .rejects.toThrow('Error message');
    });
  });

  describe('changeDefaultProfileImage', () => {
    it('should successfully change the default profile image', async () => {
      axios.post.mockResolvedValue();

      await userProfileSettings.changeDefaultProfileImage('testUser', mockCookie, 'imageData');

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/users/testUser/default-image',
        { image: 'imageData' },
        { headers: { Authorization: 'Bearer testToken' } }
      );
    });

    it('should throw an error if the API call fails', async () => {
      axios.post.mockRejectedValue({ response: { data: { error: 'Error message' } } });

      await expect(userProfileSettings.changeDefaultProfileImage('testUser', mockCookie, 'imageData'))
        .rejects.toThrow('Error message');
    });
  });

  describe('changeCustomProfileImage', () => {
    it('should successfully change the custom profile image', async () => {
      const mockFile = new Blob(['fileContent'], { type: 'image/png' });
      axios.post.mockResolvedValue();

      await userProfileSettings.changeCustomProfileImage('testUser', mockCookie, mockFile);

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/users/testUser/custom-image',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: 'Bearer testToken' } }
      );
    });

    it('should throw an error if the API call fails', async () => {
      axios.post.mockRejectedValue({ response: { data: { error: 'Error message' } } });

      await expect(userProfileSettings.changeCustomProfileImage('testUser', mockCookie, new Blob(['fileContent'], { type: 'image/png' })))
        .rejects.toThrow('Error message');
    });
  });

  describe('getProfileImageUrl', () => {
    it('should return the correct profile image URL', () => {
      const url = userProfileSettings.getProfileImageUrl('testUser');
      expect(url).toMatch(/http:\/\/localhost:8000\/users\/testUser\/image\?timestamp=\d+/);
    });
  });

  describe('getStaticProfileImageUrl', () => {
    it('should return the correct static profile image URL', () => {
      const url = userProfileSettings.getStaticProfileImageUrl('testUser');
      expect(url).toBe('http://localhost:8000/users/testUser/image');
    });
  });

  describe('getDefaultImages', () => {
    it('should return the correct default image URLs', () => {
      const urls = userProfileSettings.getDefaultImages(3);
      expect(urls).toEqual([
        'http://localhost:8000/default-images/image_1.png',
        'http://localhost:8000/default-images/image_2.png',
        'http://localhost:8000/default-images/image_3.png'
      ]);
    });
  });
});