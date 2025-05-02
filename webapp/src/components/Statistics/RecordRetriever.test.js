import RecordRetriever from './RecordRetriever';
import axios from 'axios';
import Cookies from 'js-cookie';

jest.mock('axios');
jest.mock('js-cookie');

describe('RecordRetriever', () => {
    let recordRetriever;

    beforeEach(() => {
        recordRetriever = new RecordRetriever();
        process.env.REACT_APP_API_ENDPOINT = 'http://mockapi.com';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getRecords', () => {
        it('should fetch user statistics with valid filters and token', async () => {
            const mockUserCookie = JSON.stringify({ token: 'mockToken', username: 'mockUser' });
            Cookies.get.mockReturnValue(mockUserCookie);

            const mockResponse = {
                data: {
                    users: [{ id: 1, name: 'User1' }],
                    pagination: { total: 1, limit: 10, offset: 0 },
                },
            };
            axios.get.mockResolvedValue(mockResponse);

            const filters = { sort: 'name', order: 'asc' };
            const result = await recordRetriever.getRecords(filters);

            expect(axios.get).toHaveBeenCalledWith(
                'http://localhost:8000/statistics?sort=name&order=asc',
                { headers: { Authorization: 'Bearer mockToken' } }
            );
            expect(result).toEqual({
                users: mockResponse.data.users,
                pagination: mockResponse.data.pagination,
                username: 'mockUser',
            });
        });

        it('should throw an error if user is not logged in', async () => {
            Cookies.get.mockReturnValue(null);

            await expect(recordRetriever.getRecords()).rejects.toThrow(
                'profile.errors.failedToRetrieveStatistics'
            );
        });

        it('should throw an error if token is missing in the cookie', async () => {
            const mockUserCookie = JSON.stringify({ username: 'mockUser' });
            Cookies.get.mockReturnValue(mockUserCookie);

            await expect(recordRetriever.getRecords()).rejects.toThrow(
                'profile.errors.failedToRetrieveStatistics'
            );
        });

        it('should handle API errors gracefully', async () => {
            const mockUserCookie = JSON.stringify({ token: 'mockToken', username: 'mockUser' });
            Cookies.get.mockReturnValue(mockUserCookie);

            axios.get.mockRejectedValue({
                response: {
                    status: 500,
                    data: { error: 'Internal Server Error' },
                },
            });

            await expect(recordRetriever.getRecords()).rejects.toThrow(
                'Internal Server Error'
            );
        });

        it('should throw session expired error for 401 or 403 status codes', async () => {
            const mockUserCookie = JSON.stringify({ token: 'mockToken', username: 'mockUser' });
            Cookies.get.mockReturnValue(mockUserCookie);

            axios.get.mockRejectedValue({
                response: {
                    status: 401,
                },
            });

            await expect(recordRetriever.getRecords()).rejects.toThrow(
                'statistics.errors.sessionExpired'
            );
        });
    });

    describe('getStaticProfileImageUrl', () => {
        it('should return the correct profile image URL', () => {
            const username = 'mockUser';
            const result = recordRetriever.getStaticProfileImageUrl(username);

            expect(result).toBe('http://mockapi.com/users/mockUser/image');
        });
    });
});