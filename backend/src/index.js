const Express = require('express')
const routes = require('./routes')
const app = new Express()
const swaggerUi = require('swagger-ui-express');
const swaggerDocs =  require('./swagger')
const cors = require('cors')
const { auth } = require('./infra/firebase/admin')

app.use(Express.json({ limit: '5mb' }))

app.use(cors({
    origin: '*'
}))

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(async (req, res, next) => {
    if (req.path.startsWith('/docs')) {
        return next();
    }
    const token = req.headers['authorization']?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Token inválido' })

    let decoded
    try {
        decoded = await auth.verifyIdToken(token)
    } catch {
        return res.status(401).json({ message: 'Token inválido' })
    }

    req.user = { id: decoded.uid, email: decoded.email }
    next()
})
app.use(routes)

if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT || process.env.port || 3000;

    app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
    });
}

module.exports = app
