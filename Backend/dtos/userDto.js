class UserDto {
    constructor(user) {
      this.id = user._id;
      this.email = user.email;
      this.username = user.username;
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.role = user.role;
      this.dateOfBirth = user.dateOfBirth;
      this.phoneNumber = user.phoneNumber;
      this.wishlist = user.wishlist;
      this.purchasedGames = user.purchasedGames;
      this.comments = user.comments;
      this.createdAt = user.createdAt;
    }
  }

  module.exports = { UserDto };
