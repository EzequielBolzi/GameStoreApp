class RegisterDto {
    constructor(message, token, profile) {
      this.message = message;
      this.profile = profile;
      this.token = token;

    }
  }
module.exports = { RegisterDto };
