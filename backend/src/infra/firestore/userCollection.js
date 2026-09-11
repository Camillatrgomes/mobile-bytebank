const { Timestamp } = require('firebase-admin/firestore')
const { db } = require('../firebase/admin')

const toApiValue = (value) => (value instanceof Timestamp ? value.toDate().toISOString() : value)

const wrap = (snapshot) => {
  const data = { _id: snapshot.id }
  for (const [key, value] of Object.entries(snapshot.data())) data[key] = toApiValue(value)
  return { ...data, toJSON: () => data }
}

const toFirestore = (entity) => Object.fromEntries(
  Object.entries({ ...entity }).filter(([key, value]) => value !== undefined && key !== 'id' && key !== '_id')
)

const isValidId = (id) => typeof id === 'string' && id.length > 0 && !id.includes('/')

// Escopa cada operação em users/{uid}: um usuário nunca alcança documentos de outro.
const userCollection = (name, beforeWrite = (data) => data) => ({
  forUser(userId) {
    const collection = db.collection('users').doc(userId).collection(name)

    return {
      async create(entity) {
        const ref = await collection.add(beforeWrite(toFirestore(entity)))
        return wrap(await ref.get())
      },

      async getById(id) {
        if (!isValidId(id)) return null
        const snapshot = await collection.doc(id).get()
        return snapshot.exists ? wrap(snapshot) : null
      },

      async get(filter = {}) {
        let query = collection
        for (const [key, value] of Object.entries(filter)) {
          if (value !== undefined) query = query.where(key, '==', value)
        }
        const snapshot = await query.get()
        return snapshot.docs.map(wrap)
      },

      async updateById(id, updates = {}) {
        if (!isValidId(id)) return null
        const ref = collection.doc(id)
        const current = await ref.get()
        if (!current.exists) return null
        await ref.update(beforeWrite(toFirestore(updates), current.data()))
        return wrap(await ref.get())
      },

      async removeById(id) {
        if (!isValidId(id)) return null
        const ref = collection.doc(id)
        if (!(await ref.get()).exists) return null
        await ref.delete()
        return true
      },
    }
  },
})

module.exports = { userCollection }
