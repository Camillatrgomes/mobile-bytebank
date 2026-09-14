# ByteBank — Tech Challenge Fase 3

Aplicativo de gerenciamento financeiro em **React Native (Expo)** integrado ao **Firebase** (Authentication, Cloud Firestore e Storage), desenvolvido para o Tech Challenge da Fase 3 da Pós-Tech FIAP.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do Firebase](#configuração-do-firebase)
- [Como rodar localmente](#como-rodar-localmente)
- [Rodando no celular (Expo Go)](#rodando-no-celular-expo-go)
- [Testes e qualidade](#testes-e-qualidade)
- [Rodando contra o Firebase real](#rodando-contra-o-firebase-real)
- [Segurança](#segurança)
- [Scripts](#scripts)

## Funcionalidades

| Requisito do desafio | Como foi atendido |
|---|---|
| Dashboard com gráficos e análises | Tela **Início** (saldo, receitas, despesas, despesas por categoria) e tela **Investimentos** |
| Animações entre seções com `Animated` | `FadeInView` nos blocos do dashboard e na troca de mês dos investimentos; painel dos modais |
| Listagem com filtros avançados | **Extrato**: busca, mês ("Todos os meses" incluso), período De/Até, tipo e categoria |
| Scroll infinito | `FlatList` com paginação por cursor do Firestore (`limit` + `startAfter`) |
| Busca integrada ao Cloud Firestore | O extrato consulta `users/{uid}/transactions` direto no Firestore, com busca por prefixo da descrição |
| Adicionar e editar transações | Modal **Nova Transação** e tela de detalhe com edição e exclusão |
| Validação avançada | Formato e limites do valor, saldo disponível para saídas, categoria compatível com o tipo, tamanho da descrição |
| Upload de recibos no Firebase Storage | Imagem ou PDF de até 5 MB por transação, em `receipts/{uid}/` |
| Estado global com Context API | `AuthContext` (autenticação) e `TransactionsContext` (transações, filtros e formulário) |
| Login e autenticação | Firebase Authentication com e-mail e senha |

## Arquitetura

```
┌──────────────── my-app (Expo) ────────────────┐
│ Context API · SWR · react-hook-form + zod     │
└──────┬───────────────┬───────────────┬────────┘
       │ login         │ extrato       │ recibos
       ▼               ▼               ▼
 Firebase Auth   Cloud Firestore  Firebase Storage
       ▲               ▲
       │ ID token      │ Admin SDK
┌──────┴───────────────┴────────┐
│ backend (Express)             │  ← conta, cartão e gravação de transações
└───────────────────────────────┘
```

- **App (`my-app`)**: Expo SDK 57, React Native 0.86, expo-router e React Compiler. O estado global usa Context API; os dados da API ficam em cache com SWR.
- **Leituras do extrato**: direto no Firestore, filtradas e paginadas na própria query. As Security Rules só permitem ler as transações do usuário logado.
- **Gravações**: passam pela API, que valida o ID token do Firebase com o Admin SDK e escopa cada operação em `users/{uid}`.
- **Recibos**: enviados pelo app direto ao Storage; a URL fica salva na transação.

Modelo de dados no Firestore:

```
users/{uid}/accounts/{accountId}
users/{uid}/cards/{cardId}
users/{uid}/transactions/{transactionId}   type, value, from, to, category, date, descriptionLower, anexo, urlAnexo
```

## Estrutura de pastas

```
.
├── my-app/                    App Expo
│   ├── .env                   Configuração web do Firebase (pública) e flag do emulador
│   └── src/
│       ├── app/               Rotas (expo-router): (auth) e (app)
│       ├── components/        atoms, molecules e organisms
│       ├── contexts/          AuthContext e TransactionsContext
│       ├── hooks/             useAuth, useAccount, useInfiniteStatement...
│       └── lib/               firebase, api, receipts, transactionSchema...
├── backend/                   API Express + Firebase Admin SDK
│   ├── scripts/seed.js        Usuário de demonstração e 60 transações
│   ├── src/                   Rotas, controllers e repositórios Firestore
│   └── tests/                 Suíte de integração (roda nos emuladores)
├── firebase.json              Emuladores e caminhos das regras
├── firestore.rules            Regras do Firestore
├── firestore.indexes.json     Índices compostos do extrato
└── storage.rules              Regras do Storage
```

## Pré-requisitos

| Ferramenta | Versão | Para quê |
|---|---|---|
| [Node.js](https://nodejs.org) | 22 ou superior | App e API (o `firebase-admin` exige Node 22) |
| [Java JDK](https://adoptium.net) | 11 ou superior (testado com 24) | Firebase Emulator Suite |
| [Firebase CLI](https://firebase.google.com/docs/cli) | 15 ou superior | Emuladores e deploy das regras |
| Android Studio, Xcode ou Expo Go | opcional | Rodar fora do navegador |

```bash
npm install -g firebase-tools
```

## Configuração do Firebase

### Projeto do grupo

O repositório já aponta para o projeto `bytebank-48663`. A configuração web do Firebase está em `my-app/.env`: esses valores são públicos por design, e quem protege os dados são as Security Rules.

| Variável (`my-app/.env`) | Descrição |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY`, `..._AUTH_DOMAIN`, `..._PROJECT_ID`, `..._STORAGE_BUCKET`, `..._SENDER_ID`, `..._APP_ID` | Configuração do app web do Firebase |
| `EXPO_PUBLIC_USE_EMULATOR` | `1` usa o Emulator Suite local; `0` usa o projeto real |
| `EXPO_PUBLIC_DEV_HOST` | Opcional, em `my-app/.env.local`: IP da máquina na rede local, para rodar em aparelho físico |

| Variável (`backend/.env`, só para o projeto real) | Descrição |
|---|---|
| `GOOGLE_APPLICATION_CREDENTIALS` | Caminho absoluto da chave de conta de serviço, salva **fora** do repositório |
| `FIREBASE_PROJECT_ID` | Opcional; padrão `bytebank-48663` |

### Usando o seu próprio projeto Firebase

1. Crie um projeto no [console do Firebase](https://console.firebase.google.com).
2. **Authentication** → Método de login → ative **E-mail/senha**.
3. **Firestore Database** → crie o banco.
4. **Storage** → crie o bucket.
5. **Configurações do projeto** → Seus apps → adicione um app **Web** e copie a configuração para `my-app/.env`.
6. Troque o id do projeto em `.firebaserc` e informe `FIREBASE_PROJECT_ID` no `backend/.env`.
7. Publique regras e índices: `firebase deploy --only firestore:rules,firestore:indexes,storage`.

## Como rodar localmente

O desenvolvimento roda no **Firebase Emulator Suite**: não exige credencial e não gera custo. Todos os comandos abaixo são executados na raiz do repositório.

**1. Instale as dependências**

```bash
npm --prefix backend install
```

```bash
npm --prefix my-app install
```

**2. Suba os emuladores** (terminal 1; aguarde "All emulators ready")

```bash
npm --prefix backend run emulators
```

**3. Popule os dados de demonstração** (uma vez, com os emuladores no ar)

```bash
npm --prefix backend run seed
```

**4. Suba a API** (terminal 2, porta 3000)

```bash
npm --prefix backend run dev
```

**5. Suba o app** (terminal 3)

```bash
npm --prefix my-app run web
```

Acesse http://localhost:8081 e entre com **teste@teste.com** / **teste123**.

- Para Android ou iOS, use `npm --prefix my-app run android` ou `run ios`. No emulador Android, o app já aponta para `10.0.2.2`.
- Para usar um celular de verdade, veja [Rodando no celular](#rodando-no-celular-expo-go).
- Painel dos emuladores: http://localhost:4000.
- Encerre os emuladores com **Ctrl+C**: assim os dados são salvos em `.emulator-data/` e o seed não precisa ser refeito.

## Rodando no celular (Expo Go)

1. Instale o **Expo Go** (App Store ou Google Play) na versão compatível com o SDK 57.
2. Descubra o IP da máquina na rede local: `ipconfig` no Windows, `ipconfig getifaddr en0` no macOS ou `hostname -I` no Linux.
3. Crie `my-app/.env.local` (não versionado) com esse IP:

   ```
   EXPO_PUBLIC_DEV_HOST=192.168.0.10
   ```

4. Suba emuladores, seed e API como na seção anterior. Os emuladores de Auth, Firestore e Storage aceitam conexões da rede local (`"host": "0.0.0.0"` no `firebase.json`).
5. Inicie o app sem `--web` e escaneie o QR code (iPhone: câmera; Android: app Expo Go):

   ```bash
   npm --prefix my-app start
   ```

- Celular e computador precisam estar na mesma rede, sem rede de convidados ou isolamento de clientes no roteador.
- No iPhone, toque em **Permitir** quando o Expo Go pedir acesso à rede local (dá para reativar em Ajustes → Privacidade e Segurança → Rede Local).
- Se o QR code mostrar outro IP (por exemplo, de uma VPN), defina `REACT_NATIVE_PACKAGER_HOSTNAME` com o IP da máquina antes do `start`.
- Se o firewall bloquear, libere as portas 3000, 8080, 9099, 9199 e 8081.
- Os emuladores ficam acessíveis a quem estiver na mesma rede; eles guardam apenas dados de teste.
- Para voltar a rodar só na web, remova `EXPO_PUBLIC_DEV_HOST` do `.env.local`.

## Testes e qualidade

A suíte de integração do backend (`backend/tests`) roda contra os emuladores de Auth e Firestore. Ela cria os próprios usuários e apaga só o que criou, preservando os dados do seed, e se recusa a rodar sem os emuladores.

Com os emuladores já no ar:

```bash
npm --prefix backend test
```

Sem os emuladores rodando (sobe, testa e encerra sozinho):

```bash
npm --prefix backend run test:emulators
```

Lint:

```bash
npm --prefix backend run lint
```

```bash
npm --prefix my-app run lint
```

## Rodando contra o Firebase real

1. Publique regras e índices (os índices levam alguns minutos para ficar prontos):

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

2. Crie `backend/.env` a partir de `backend/.env.example` com o caminho da sua chave de conta de serviço e suba a API com `npm --prefix backend run dev:cloud`. Para popular o projeto real: `npm --prefix backend run seed:cloud`.
3. Crie `my-app/.env.local` com `EXPO_PUBLIC_USE_EMULATOR=0` e reinicie o app.

## Segurança

- **Firestore**: o app só lê `users/{uid}/transactions` do próprio usuário; toda gravação passa pela API.
- **Storage**: cada usuário grava e lê apenas `receipts/{uid}/`, com imagem ou PDF de até 5 MB.
- **API**: todas as rotas exigem o ID token do Firebase, exceto a documentação em `/docs`.
- **Chave de conta de serviço**: nunca vai para o repositório nem é compartilhada; ela ignora as Security Rules.
- Se o seed for aplicado no projeto real, remova ou troque a senha do usuário de demonstração depois da apresentação.

A documentação interativa da API fica em http://localhost:3000/docs (Swagger). Detalhes das rotas estão em [`backend/readme`](backend/readme).

## Scripts

| Pasta | Script | O que faz |
|---|---|---|
| `backend` | `emulators` | Sobe Auth, Firestore e Storage emulados, com dados persistidos |
| `backend` | `seed` / `seed:cloud` | Cria o usuário de demonstração e 60 transações (emulador / projeto real) |
| `backend` | `dev` / `dev:cloud` | API contra os emuladores / contra o projeto real |
| `backend` | `test` / `test:emulators` | Suíte de integração com emuladores já no ar / subindo os emuladores |
| `backend` | `lint` | ESLint |
| `my-app` | `web` / `android` / `ios` | Inicia o app |
| `my-app` | `lint` | ESLint (expo lint) |
