class Investment {
    constructor({ _id, type, value, name, accountId}) {
        this.id = _id
        this.type = type
        this.value = value
        this.name = name
        this.accountId = accountId
    }

}

module.exports = Investment
