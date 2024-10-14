class CompanyDto {
    constructor(company) {
      this.id = company._id;
      this.email = company.email;
      this.companyName = company.companyName;
      this.role = company.role;
      this.country = company.country;
      this.city = company.city;
      this.street = company.street;
      this.address = company.address;
      this.phoneNumber = company.phoneNumber;
      this.createdAt = company.createdAt;
    }
  }

  module.exports = { CompanyDto };
