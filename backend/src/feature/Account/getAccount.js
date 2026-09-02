const Account = require("../../models/Account")

const getAccount = async ({
  filter, repository
}) => {
  const result = await repository.get(filter)
  return result?.map(account => new Account(account))
}

module.exports = getAccount