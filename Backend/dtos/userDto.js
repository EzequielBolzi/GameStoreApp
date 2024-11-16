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
      this.profileAvatar = user.profileAvatar;
      this.cardName = user.cardName;
      this.cardNumber = user.cardNumber;
      this.cardExpiration = user.cardExpiration;
      this.cardCVV = user.cardCVV;

      this.createdAt = user.createdAt;
    }
  }

  module.exports = { UserDto };
