import Cookies from 'js-cookie';

// This file contains utility functions for the webapp

export function retrieveUserToken() {
    const userCookie = Cookies.get('user');
    if (!userCookie) {
        throw new Error("You are not logged in.");
    }

    const { token } = JSON.parse(userCookie) || {};
    if (!token) {
        throw new Error("Cannot parse auth token.");
    }

    return token;
}