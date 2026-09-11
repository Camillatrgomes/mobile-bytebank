const { auth } = require('../src/infra/firebase/admin')
const accountRepository = require('../src/infra/firestore/repository/accountRepository')
const cardRepository = require('../src/infra/firestore/repository/cardRepository')
const transactionRepository = require('../src/infra/firestore/repository/detailedAccountRepository')
const AccountDTO = require('../src/models/Account')
const CardDTO = require('../src/models/Card')
const TransactionDTO = require('../src/models/DetailedAccount')
const getAccount = require('../src/feature/Account/getAccount')
const saveAccount = require('../src/feature/Account/saveAccount')
const saveCard = require('../src/feature/Card/saveCard')
const saveTransaction = require('../src/feature/Transaction/saveTransaction')

const SEED_USER = { email: 'teste@teste.com', password: 'teste123', displayName: 'Usuário Teste' }
const TOTAL_TRANSACTIONS = 60

const MONTHLY_TEMPLATE = [
  { day: 5, type: 'Credit', category: 'Salário', to: 'Salário mensal', base: 5200, spread: 0 },
  { day: 15, type: 'Credit', category: 'Investimentos', to: 'Rendimento de investimentos', base: 280, spread: 140 },
  { day: 6, type: 'Debit', category: 'Moradia', to: 'Aluguel', base: 1500, spread: 0 },
  { day: 8, type: 'Debit', category: 'Alimentação', to: 'Supermercado', base: 380, spread: 160 },
  { day: 18, type: 'Debit', category: 'Alimentação', to: 'iFood', base: 55, spread: 60 },
  { day: 10, type: 'Debit', category: 'Contas', to: 'Conta de luz', base: 150, spread: 80 },
  { day: 12, type: 'Debit', category: 'Transporte', to: 'Uber', base: 45, spread: 70 },
  { day: 22, type: 'Debit', category: 'Lazer', to: 'Cinema', base: 60, spread: 90 },
  { day: 25, type: 'Debit', category: 'Saúde', to: 'Farmácia', base: 70, spread: 110 },
  { day: 27, type: 'Debit', category: 'Educação', to: 'Curso online', base: 199, spread: 0 },
]

function buildTransactions(now) {
  const transactions = []

  for (let monthOffset = 0; monthOffset < 8; monthOffset++) {
    MONTHLY_TEMPLATE.forEach((item, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, item.day, 12)
      if (date > now) return

      const variation = item.spread
        ? ((monthOffset * 37 + index * 13) % item.spread) + ((monthOffset * 7 + index * 3) % 100) / 100
        : 0

      transactions.push({ ...item, value: Math.round((item.base + variation) * 100) / 100, date })
    })
  }

  return transactions.sort((a, b) => b.date - a.date).slice(0, TOTAL_TRANSACTIONS)
}

async function findOrCreateUser() {
  try {
    return await auth.getUserByEmail(SEED_USER.email)
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error
    return auth.createUser(SEED_USER)
  }
}

async function seed() {
  const user = await findOrCreateUser()
  const accounts = accountRepository.forUser(user.uid)
  const cards = cardRepository.forUser(user.uid)
  const transactions = transactionRepository.forUser(user.uid)

  const [existingAccount] = await getAccount({ repository: accounts, filter: { userId: user.uid } })
  const account = existingAccount
    ?? await saveAccount({ account: new AccountDTO({ userId: user.uid, type: 'Debit' }), repository: accounts })

  if ((await cards.get({ accountId: account.id })).length === 0) {
    await saveCard({
      card: new CardDTO({
        type: 'GOLD',
        number: '13748712374891010',
        dueDate: '2027-01-07',
        functions: 'Debit',
        cvc: '505',
        paymentDate: null,
        name: SEED_USER.displayName,
        accountId: account.id,
      }),
      repository: cards,
    })
  }

  const existing = await transactions.get({ accountId: account.id })
  if (existing.length >= TOTAL_TRANSACTIONS) {
    console.log(`Seed já aplicado para ${SEED_USER.email}; nada foi alterado.`)
    return
  }

  // Retoma um seed interrompido: grava só as transações que ainda não existem.
  const existingKeys = new Set(existing.map((t) => `${t.to}|${t.date}`))
  const missing = buildTransactions(new Date()).filter((item) => !existingKeys.has(`${item.to}|${item.date.toISOString()}`))

  for (const item of missing) {
    await saveTransaction({
      transaction: new TransactionDTO({
        accountId: account.id,
        type: item.type,
        value: item.value,
        to: item.to,
        category: item.category,
        date: item.date,
      }),
      repository: transactions,
    })
  }

  console.log(`Seed aplicado: ${missing.length} transações gravadas para ${SEED_USER.email} / ${SEED_USER.password}`)
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Falha no seed:', error)
    process.exit(1)
  })
