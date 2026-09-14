process.env.NODE_ENV = 'test'

// Sem os emuladores o Admin SDK usaria credenciais reais do gcloud.
if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  throw new Error('Rode a suíte contra os emuladores: npm test (com os emuladores no ar) ou npm run test:emulators')
}

const { after, before, describe, test } = require('node:test')
const assert = require('node:assert/strict')
const request = require('supertest')
const { deleteApp } = require('firebase-admin/app')
const app = require('../src/index')
const { app: firebaseApp, auth, db } = require('../src/infra/firebase/admin')

const SIGN_UP_URL = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=test`

async function createAuthUser(label) {
  const response = await fetch(SIGN_UP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@teste.com`,
      password: 'senha123',
      returnSecureToken: true
    })
  })
  const body = await response.json()
  if (!body.idToken) throw new Error(`Falha ao criar usuário no emulador: ${JSON.stringify(body)}`)
  return { uid: body.localId, token: body.idToken }
}

const bearer = (user) => ({ Authorization: `Bearer ${user.token}` })
const storedTransaction = (uid, id) => db.collection('users').doc(uid).collection('transactions').doc(id).get()

describe('Financial manager API', { timeout: 60000 }, () => {
  let owner
  let intruder
  let accountId
  let transactionId

  before(async () => {
    owner = await createAuthUser('dono')
    intruder = await createAuthUser('outro')
  })

  // Apaga só o que a suíte criou, preservando o seed do emulador.
  after(async () => {
    await Promise.all([owner, intruder].filter(Boolean).map(async ({ uid }) => {
      await db.recursiveDelete(db.collection('users').doc(uid))
      await auth.deleteUser(uid)
    }))
    await deleteApp(firebaseApp)
  })

  test('rejects requests without a valid Firebase ID token', async () => {
    const missing = await request(app).get('/account')
    const invalid = await request(app).get('/account').set('Authorization', 'Bearer token-invalido')

    assert.equal(missing.status, 401)
    assert.equal(invalid.status, 401)
  })

  test('provisions account and card once for the authenticated user', async () => {
    const created = await request(app).post('/user').set(bearer(owner)).send({ username: 'Dono da Conta' })

    assert.equal(created.status, 201)
    accountId = created.body.result.accountId
    assert.ok(accountId)

    const repeated = await request(app).post('/user').set(bearer(owner)).send({ username: 'Dono da Conta' })

    assert.equal(repeated.status, 200)
    assert.equal(repeated.body.result.accountId, accountId)
  })

  test('retrieves the account, card and an empty statement', async () => {
    const response = await request(app).get('/account').set(bearer(owner))
    const { account, cards, transactions } = response.body.result

    assert.equal(response.status, 200)
    assert.equal(account.length, 1)
    assert.equal(account[0].id, accountId)
    assert.equal(account[0].userId, owner.uid)
    assert.equal(cards.length, 1)
    assert.equal(cards[0].name, 'Dono da Conta')
    assert.deepEqual(transactions, [])
  })

  test('creates a transaction honoring the client date', async () => {
    const payload = {
      accountId,
      value: 200,
      type: 'Debit',
      to: 'Supermercado Exemplo',
      category: 'Alimentação',
      date: '2026-08-15T12:00:00.000Z',
      anexo: 'recibo.pdf',
      urlAnexo: 'https://example.com/anexos/recibo.pdf'
    }

    const response = await request(app).post('/account/transaction').set(bearer(owner)).send(payload)
    const { result } = response.body

    assert.equal(response.status, 201)
    assert.equal(result.accountId, accountId)
    assert.equal(result.type, 'Debit')
    assert.equal(result.value, -200)
    assert.equal(result.date, payload.date)
    assert.equal(result.anexo, payload.anexo)
    assert.equal(result.urlAnexo, payload.urlAnexo)

    transactionId = result.id
    const stored = await storedTransaction(owner.uid, transactionId)
    assert.equal(stored.data().descriptionLower, 'supermercado exemplo')
  })

  const invalidTransactions = [
    ['unknown type', { type: 'Pix', value: 10 }],
    ['non numeric value', { type: 'Debit', value: 'abc' }],
    ['invalid date', { type: 'Debit', value: 10, date: 'ontem' }],
    ['non string receipt url', { type: 'Debit', value: 10, urlAnexo: 123 }]
  ]

  for (const [label, fields] of invalidTransactions) {
    test(`rejects a transaction with ${label}`, async () => {
      const response = await request(app)
        .post('/account/transaction')
        .set(bearer(owner))
        .send({ accountId, ...fields })

      assert.equal(response.status, 400)
    })
  }

  test('updates an existing transaction', async () => {
    const payload = {
      value: 150,
      type: 'Credit',
      to: 'Padaria Pão Doce',
      urlAnexo: 'https://example.com/anexos/recibo-atualizado.pdf'
    }

    const response = await request(app).put(`/account/transaction/${transactionId}`).set(bearer(owner)).send(payload)
    const { result } = response.body

    assert.equal(response.status, 200)
    assert.equal(result.id, transactionId)
    assert.equal(result.type, 'Credit')
    assert.equal(result.value, 150)
    assert.equal(result.urlAnexo, payload.urlAnexo)

    const stored = await storedTransaction(owner.uid, transactionId)
    assert.equal(stored.data().descriptionLower, 'padaria pao doce')
  })

  test('isolates transactions between users', async () => {
    const provisioned = await request(app).post('/user').set(bearer(intruder)).send({ username: 'Outro Usuário' })
    assert.equal(provisioned.status, 201)

    const update = await request(app).put(`/account/transaction/${transactionId}`).set(bearer(intruder)).send({ value: 1 })
    const removal = await request(app).delete(`/account/transaction/${transactionId}`).set(bearer(intruder))
    const statement = await request(app).get(`/account/${accountId}/statement`).set(bearer(intruder))
    const account = await request(app).get('/account').set(bearer(intruder))

    assert.equal(update.status, 404)
    assert.equal(removal.status, 404)
    assert.equal(statement.status, 200)
    assert.deepEqual(statement.body.result.transactions, [])
    assert.deepEqual(account.body.result.transactions, [])
  })

  test('returns the account statement with the transaction', async () => {
    const response = await request(app).get(`/account/${accountId}/statement`).set(bearer(owner))

    assert.equal(response.status, 200)
    assert.deepEqual(response.body.result.transactions.map((transaction) => transaction.id), [transactionId])
  })

  test('deletes the transaction', async () => {
    const removed = await request(app).delete(`/account/transaction/${transactionId}`).set(bearer(owner))
    const repeated = await request(app).delete(`/account/transaction/${transactionId}`).set(bearer(owner))

    assert.equal(removed.status, 204)
    assert.equal(repeated.status, 404)
  })

  test('returns an empty statement after the removal', async () => {
    const response = await request(app).get(`/account/${accountId}/statement`).set(bearer(owner))

    assert.equal(response.status, 200)
    assert.deepEqual(response.body.result.transactions, [])
  })
})
