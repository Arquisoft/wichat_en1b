import axios from "axios";

export default class UserProfileSettings {
  
  API_GATEWAY = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  async changeUsernameAndPassword(cookie, username, password, passwordRepeat) {
    try {
      const response = await axios.patch(this.API_GATEWAY + `/users/${JSON.parse(cookie).username}`, { username: username, password: password, passwordRepeat: passwordRepeat },
        {
          headers: {
            "Authorization": `Bearer ${JSON.parse(cookie).token}`,
          }
        }
      );

      return { username: response.data.newUsername, token: response.data.token };
    } catch (error) {
      throw new Error(error.response?.data?.error ||  "Unknown error.");
    }
  }

  async changeDefaultProfileImage(username, cookie, image) {
    try {
      if (image) {
        await axios.post(this.API_GATEWAY + `/users/${username}/default-image`, { image: image },
          {
            headers: {
              "Authorization": `Bearer ${JSON.parse(cookie).token}`,
            }
          }
        );
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async changeCustomProfileImage(username, cookie, file) {
    try {
      if (file) {
        let formData = new FormData();
        formData.append("image", file);

        await axios.post(this.API_GATEWAY + `/users/${username}/custom-image`, formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "Authorization": `Bearer ${JSON.parse(cookie).token}`,
            },
          }
        );
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  getProfileImageUrl(username) {
    return `${this.API_GATEWAY}/users/${username}/image?timestamp=${Date.now()}`;
  }
  
  getStaticProfileImageUrl(username) {
    return `${this.API_GATEWAY}/users/${username}/image`;
  }
  
  getDefaultImages(count = 16) {
    return Array.from({ length: count }, (_, i) =>
      `${this.API_GATEWAY}/default-images/image_${i + 1}.png`
    );
  }
}