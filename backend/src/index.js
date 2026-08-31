const Express = require('express')
const publicRoutes = require('./publicRoutes')
const routes = require('./routes')
const connectDB = require('./infra/mongoose/mongooseConect');
const app = new Express()
const swaggerUi = require('swagger-ui-express');
const swaggerDocs =  require('./swagger')
const UserController = require('./controller/User')
const cors = require('cors')

app.use(Express.json({ limit: '5mb' }))

app.use(cors({
    origin: '*'
}))

app.use(publicRoutes)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use((req, res, next) => {
    if (req.url.includes('/docs')) {
        return next();
    }
    const [_, token] = req.headers['authorization']?.split(' ') || []
    const user = UserController.getToken(token)
    if (!user) return res.status(401).json({ message: 'Token inválido' })
    req.user = user
    next()
})
app.use(routes)

const serverPromise = connectDB().then(async () => {
    if (process.env.NODE_ENV !== 'test') {
        const port = process.env.PORT || process.env.port || 3000;
        
        // Seed test user automatically
        try {
            const userModel = require('./infra/mongoose/modelos').User;
            const exist = await userModel.findOne({ email: 'teste@teste.com' });
            if (!exist) {
                const userDTO = require('./models/User');
                const accountDTO = require('./models/Account');
                const cardDTO = require('./models/Card');
                const userRepository = require('./infra/mongoose/repository/userRepository');
                const accountRepository = require('./infra/mongoose/repository/accountRepository');
                const cardRepository = require('./infra/mongoose/repository/cardRepository');
                const salvarUsuario = require('./feature/User/salvarUsuario');
                const saveAccount = require('./feature/Account/saveAccount');
                const saveCard = require('./feature/Card/saveCard');
                
                const user = new userDTO({ username: 'Usuário Teste', email: 'teste@teste.com', password: '123' });
                const userCreated = await salvarUsuario({ user, repository: userRepository });
                const accountCreated = await saveAccount({ account: new accountDTO({ userId: userCreated.id, type: 'Debit' }), repository: accountRepository });
                const firstCard = new cardDTO({ 
                  type: 'GOLD', number: 13748712374891010, dueDate: '2027-01-07', functions: 'Debit',
                  cvc: '505', paymentDate: null, name: userCreated.username, accountId: accountCreated.id, type: 'Debit' 
                });
                await saveCard({ card: firstCard, repository: cardRepository });
                console.log('✅ Usuário de teste criado: teste@teste.com / 123');
            }
        } catch (e) {
            console.error('Erro ao popular usuário de teste:', e);
        }

        app.listen(port, () => {
            console.log(`Servidor rodando na porta ${port}`);
        });
    }
});


module.exports = app
module.exports.ready = serverPromise
