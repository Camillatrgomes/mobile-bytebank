const accountDTO = require('../models/Account')
const cardDTO = require('../models/Card')

class UserController {
  constructor(di = {}) {
    this.di = Object.assign({
      accountRepository: require('../infra/mongoose/repository/accountRepository'),
      cardRepository: require('../infra/mongoose/repository/cardRepository'),

      getAccount: require('../feature/Account/getAccount'),
      saveAccount: require('../feature/Account/saveAccount'),
      saveCard: require('../feature/Card/saveCard'),
    }, di)
  }

  async create(req, res) {
    const { accountRepository, cardRepository, getAccount, saveAccount, saveCard } = this.di
    const userId = req.user.id

    try {
      const [existingAccount] = await getAccount({ repository: accountRepository, filter: { userId } })
      if (existingAccount) {
        return res.status(200).json({
          message: 'Conta já provisionada',
          result: { accountId: existingAccount.id },
        })
      }

      const accountCreated = await saveAccount({ account: new accountDTO({ userId, type: 'Debit' }), repository: accountRepository })

      const firstCard = new cardDTO({
        type: 'GOLD',
        number: 13748712374891010,
        dueDate: '2027-01-07',
        functions: 'Debit',
        cvc: '505',
        paymentDate: null,
        name: req.body.username || req.user.email,
        accountId: accountCreated.id,
      })

      await saveCard({ card: firstCard, repository: cardRepository })

      res.status(201).json({
        message: 'Conta provisionada com sucesso',
        result: { accountId: accountCreated.id },
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'caiu a aplicação' })
    }
  }
}

module.exports = UserController
