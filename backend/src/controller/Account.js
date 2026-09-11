const TransactionDTO = require('../models/DetailedAccount')

const TRANSACTION_TYPES = ['Credit', 'Debit']

const parseAmount = (value) => {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') return Number(value)
  return NaN
}

const isOptionalString = (value) => value === undefined || value === null || typeof value === 'string'


class AccountController {
  constructor(di = {}) {
    this.di = Object.assign({
      accountRepository: require('../infra/firestore/repository/accountRepository'),
      cardRepository: require('../infra/firestore/repository/cardRepository'),
      transactionRepository: require('../infra/firestore/repository/detailedAccountRepository'),

      getAccount: require('../feature/Account/getAccount'),
      saveTransaction: require('../feature/Transaction/saveTransaction'),
      getTransaction: require('../feature/Transaction/getTransaction'),
      updateTransaction: require('../feature/Transaction/updateTransaction'),
      deleteTransaction: require('../feature/Transaction/deleteTransaction'),
      getCard: require('../feature/Card/getCard'),
    }, di)
  }

  async find(req, res) {
    const { accountRepository, getAccount, getCard, getTransaction, transactionRepository, cardRepository } = this.di

    try {
      const userId = req.user.id
      const account = await getAccount({ repository: accountRepository.forUser(userId), filter: { userId } })
      const transactions = await getTransaction({ filter: { accountId: account[0].id }, repository: transactionRepository.forUser(userId) })
      const cards = await getCard({ filter: { accountId: account[0].id }, repository: cardRepository.forUser(userId) })

      res.status(200).json({
        message: 'Conta encontrada carregado com sucesso',
        result: {
          account,
          transactions,
          cards,
        }
      })
    } catch {
      res.status(500).json({
        message: 'Erro no servidor'
      })
    }

  }

  async createTransaction(req, res) {
    const { saveTransaction, transactionRepository } = this.di
    const { accountId, value, type, from, to, anexo, category, date } = req.body
    const urlAnexo = req.body.urlAnexo ?? req.body.urlanexo ?? null
    const amount = parseAmount(value)

    const isValid = TRANSACTION_TYPES.includes(type)
      && Number.isFinite(amount)
      && typeof accountId === 'string' && accountId !== ''
      && [from, to, anexo, category].every(isOptionalString)
    if (!isValid) {
      return res.status(400).json({ message: 'Transação inválida' })
    }

    const transactionDate = date ? new Date(date) : new Date()
    if (Number.isNaN(transactionDate.getTime())) {
      return res.status(400).json({ message: 'Data inválida' })
    }

    const transactionDTO = new TransactionDTO({ accountId, value: amount, from, to, anexo, urlAnexo, category, type, date: transactionDate })

    try {
      const transaction = await saveTransaction({ transaction: transactionDTO, repository: transactionRepository.forUser(req.user.id) })

      res.status(201).json({
        message: 'Transação criada com sucesso',
        result: transaction
      })
    } catch {
      res.status(500).json({ message: 'Erro ao criar transação' })
    }
  }

  async updateTransaction(req, res) {
    const { updateTransaction, transactionRepository } = this.di
    const { id } = req.params
    const { value, type, from, to, anexo, category } = req.body
    const urlAnexo = req.body.urlAnexo ?? req.body.urlanexo

    const isValid = (type === undefined || TRANSACTION_TYPES.includes(type))
      && (value === undefined || Number.isFinite(parseAmount(value)))
      && [from, to, anexo, urlAnexo, category].every(isOptionalString)
    if (!isValid) {
      return res.status(400).json({ message: 'Transação inválida' })
    }

    const updates = {
      value: value === undefined ? undefined : parseAmount(value),
      type,
      from,
      to,
      anexo,
      urlAnexo,
      category
    }

    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key])

    try {
      const transaction = await updateTransaction({ transactionId: id, updates, repository: transactionRepository.forUser(req.user.id) })

      if (!transaction) {
        return res.status(404).json({ message: 'Transação não encontrada' })
      }

      res.status(200).json({
        message: 'Transação atualizada com sucesso',
        result: transaction
      })
    } catch {
      res.status(500).json({ message: 'Erro ao atualizar transação' })
    }
  }

  async deleteTransaction(req, res) {
    const { deleteTransaction, transactionRepository } = this.di
    const { id } = req.params

    try {
      const deleted = await deleteTransaction({ transactionId: id, repository: transactionRepository.forUser(req.user.id) })

      if (!deleted) {
        return res.status(404).json({ message: 'Transação não encontrada' })
      }

      res.status(204).send()
    } catch {
      res.status(500).json({ message: 'Erro ao deletar transação' })
    }
  }

  async getStatment(req, res) {
    const { getTransaction, transactionRepository } = this.di

    const { accountId } = req.params

    try {
      const transactions = await getTransaction({ filter: { accountId }, repository: transactionRepository.forUser(req.user.id) })
      res.status(200).json({
        message: 'Extrato carregado com sucesso',
        result: {
          transactions
        }
      })
    } catch {
      res.status(500).json({ message: 'Erro ao carregar extrato' })
    }
  }
}

module.exports = AccountController
