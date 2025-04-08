import axios from "axios";

export default class UserProfileSettings {
  
  async changeProfileImage(username, cookie, file) {

    if (file) {
      let formData = new FormData();
      formData.append("image", file);

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000'}/users/${username}/image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "Authorization": `Bearer ${cookie}`,
            },
          }
        );

        return response.data.imageUrl;
      } catch (error) {
        console.error("Error uploading profile image:", error);
        throw error;
      }
        }
  }
}