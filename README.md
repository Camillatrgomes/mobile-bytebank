# ByteBank — Tech Challenge Fase 4

Aplicativo de gerenciamento financeiro em **React Native (Expo)** integrado ao **Firebase** (Authentication, Cloud Firestore e Storage). A Fase 3 entregou o app com Firebase; a **Fase 4** reorganiza o código em camadas (Clean Architecture), troca Context API e SWR por **Zustand** e **RxJS**, e adiciona **cache persistente cifrado**, **lazy loading** e **criptografia da sessão no aparelho**. Desenvolvido para a Pós-Tech FIAP.

## Sumário

- [Requisitos da Fase 4](#requisitos-da-fase-4)
- [Arquitetura em camadas](#arquitetura-em-camadas)
- [Tecnologias](#tecnologias)
- [Performance: code splitting](#performance-code-splitting)
- [Funcionalidades (Fase 3)](#funcionalidades-fase-3)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do Firebase](#configuração-do-firebase)
- [Como rodar localmente](#como-rodar-localmente)
- [Rodando no celular (Expo Go)](#rodando-no-celular-expo-go)
- [Testes e qualidade](#testes-e-qualidade)
- [Rodando contra o Firebase real](#rodando-contra-o-firebase-real)
- [Segurança](#segurança)
- [Scripts](#scripts)

## Requisitos da Fase 4

Caminhos relativos a `my-app/src`, salvo indicação.

| Requisito | Como foi atendido | Onde no código |
|---|---|---|
| Arquitetura modular | Código dividido em domínio, infraestrutura e apresentação, cada um em pastas próprias; UI em atoms, molecules e organisms | `domain/`, `infra/`, `app/`, `components/`, `hooks/`, `stores/` |
| State Management avançado | Zustand com um store e cinco slices (auth, conta, extrato, filtros, UI), seletores e `resetAll` no logout | `stores/index.ts`, `stores/*Slice.ts`, `stores/selectors.ts` |
| Clean Architecture | Entidades, portas (interfaces) e use cases no domínio; Firebase, HTTP e criptografia só na infraestrutura; a apresentação usa o `container` | `domain/entities`, `domain/repositories`, `domain/usecases`, `infra/container.ts` |
| Lazy loading e pré-carregamento | `React.lazy` + `Suspense` nos gráficos; rotas assíncronas (`asyncRoutes`, só no build web de produção); `router.prefetch` na home | `app/(app)/home.tsx`, `app/(app)/investments.tsx`, `my-app/app.json` |
| Cache | Conta e transações persistidas e hidratadas no primeiro paint, com TTL de 24 h e checagem de dono; na web, cache local do Firestore | `stores/index.ts` (`persist`), `stores/cachePolicy.ts`, `infra/firebase/client.ts` |
| Programação reativa | Saldo e extrato são streams do Firestore (`onSnapshot`); o extrato passa por um pipeline RxJS (debounce de 300 ms na busca, `switchMap` para trocar o listener, `distinctUntilChanged`) | `infra/repositories/FirestoreTransactionRepository.ts`, `lib/statementStream.ts`, `hooks/useStatementStream.ts`, `hooks/useAccountSync.ts` |
| Autenticação segura | Firebase Authentication (e-mail/senha); a API valida o ID token com o Admin SDK; rotas do app protegidas por `AuthGate`; no logout, os listeners são cancelados e o cache e a chave são apagados | `infra/repositories/FirebaseAuthRepository.ts`, `domain/usecases/login.ts`, `components/AuthGate.tsx`, `hooks/useAuth.ts`, `backend/src` |
| Criptografia de dados sensíveis | AES-256-GCM (`expo-crypto`) com chave gerada no aparelho e guardada no `expo-secure-store` (Keychain/Keystore); cifra o cache de conta/transações e, no nativo, a persistência da sessão do Firebase Auth | `infra/security/cryptoBox.ts`, `infra/security/secureStorage.ts`, `infra/security/encryptedStateStorage.ts` |

## Arquitetura em camadas

```
┌───────────────────────── Apresentação ──────────────────────────┐
│ app/ (rotas)  components/  hooks/  contexts/  stores/ (Zustand)│
└───────────────────────────────┬─────────────────────────────────┘
                                │ só pelo container
                                ▼
                       infra/container.ts   (composition root)
                                │ instancia e injeta
                                ▼
┌──────────────────────────── Infra ──────────────────────────────┐
│ Firebase (Auth, Firestore, Storage) · HTTP (API) · security/    │
│ (AES-256-GCM, SecureStore): implementam as portas do domínio    │
└───────────────────────────────┬─────────────────────────────────┘
                                │ depende de (implementa)
                                ▼
┌──────────────────────────── Domínio ────────────────────────────┐
│ entities/  repositories/ (portas)  usecases/                    │
└─────────────────────────────────────────────────────────────────┘
```

**Regra de dependência:** o domínio só importa dele mesmo, de `constants/` e do tipo `Observable` do RxJS; a infraestrutura depende do domínio, nunca o contrário; a apresentação acessa a infraestrutura somente por `@/infra/container`. O `container` cria os repositórios concretos e os entrega aos use cases.

Decisões que valem declarar:

- **O domínio importa o tipo `Observable` do RxJS.** O contrato de leitura (`watchAll`, `watchStatement`) é um stream, requisito de programação reativa. É só o tipo (`import type`), sem código do RxJS no domínio.
- **Na web não existe SecureStore.** Lá a chave AES fica em `localStorage`, ao lado do payload, então a cifra na web só vale como limitação de desenvolvimento. No aparelho a chave fica no Keychain (iOS) ou Keystore (Android).
- **O cache persiste só dado do servidor**: conta e transações, com TTL de 24 h e dono (`cacheOwner`). Se o dono não for o usuário logado ou o TTL tiver vencido, o cache é descartado. Filtros, UI e autenticação não são persistidos. Um payload ilegível é ignorado e o app abre com skeleton.
- **Leitura direto do Firestore, escrita pela API.** As Security Rules só permitem ler `users/{uid}/transactions` do próprio usuário e negam toda escrita; criar, editar e excluir passam pela API, que usa o Admin SDK.
- **Cache do Firestore na web.** Além do cache cifrado acima, no navegador o Firestore usa `persistentLocalCache` (IndexedDB), gerenciado pelo SDK e fora da nossa cifra.
- **Sessão do Firebase Auth:** no nativo, a persistência usa o `encryptedStateStorage`; na web o Firebase usa `browserLocalPersistence`, sem cifra nossa.
- **Limitações conhecidas:** com várias abas abertas, o logout numa aba apaga a chave mas pode deixar, na outra, o blob cifrado antigo (ilegível sem a chave); o `persist` regrava (e recifra) o cache a cada mudança do store.

Modelo de dados no Firestore:

```
users/{uid}/accounts/{accountId}
users/{uid}/cards/{cardId}
users/{uid}/transactions/{transactionId}   type, value, from, to, category, date, descriptionLower, anexo, urlAnexo
```

## Tecnologias

| Área | Tecnologia |
|---|---|
| App | Expo SDK 57, React Native 0.86, React 19 com React Compiler, expo-router, react-native-web |
| Estado global | **Zustand** (slices e middleware `persist`) |
| Programação reativa | **RxJS** 7 e `onSnapshot` do Firestore |
| Criptografia | **expo-crypto** (AES-256-GCM) e **expo-secure-store** |
| Persistência local | `@react-native-async-storage/async-storage` (guarda o payload já cifrado) |
| Backend | Firebase Authentication, Cloud Firestore e Storage; API Express com Firebase Admin SDK |
| Formulários e validação | react-hook-form e zod |
| Gráficos | react-native-chart-kit e react-native-gifted-charts |
| Animações | `Animated` (`FadeInView`) e react-native-reanimated |
| Desenvolvimento | Firebase Emulator Suite, TypeScript, ESLint (`expo lint`) |

O **SWR foi removido** na Fase 4 (substituído por Zustand + `onSnapshot`). O Context API ficou só como ligação do `onAuthStateChanged` (`contexts/AuthContext.tsx`), que escreve no store.

## Performance: code splitting

Medido com `npx expo export --platform web` (JS), antes e depois do lazy loading e das rotas assíncronas:

| | Bundle inicial |
|---|---|
| Antes | 5,50 MB (bundle único) |
| Depois | 1,09 MB (entry) + 3,88 MB de código compartilhado (`__common`: Firebase, RxJS etc.) |

- O ganho vem das rotas assíncronas (`asyncRoutes`) e do `react-native-gifted-charts`, que só carrega em `/investments` (chunk `InvestmentsTable` de 396 KB). Os gráficos do `react-native-chart-kit` geram chunks de 3 a 4 KB: ganho marginal.
- O `__common` de 3,88 MB ainda é baixado em toda página.
- **Pré-carregamento:** `router.prefetch('/transactions')` e `('/investments')` rodam na home, mas só têm efeito no **build de produção da web** (`asyncRoutes.web = "production"`). No desenvolvimento as rotas são síncronas e não há chunks de rota para pré-buscar. O efeito do `prefetch` não foi observado em execução; só o export estático gerando os chunks. No nativo as rotas também são síncronas (`asyncRoutes.default = false`).
- O extrato usa `FlatList` com `initialNumToRender={10}`, `maxToRenderPerBatch={10}` e `windowSize={5}`.

Para reproduzir, a partir de `my-app`: `npx expo export --platform web` e compare os arquivos de `dist/_expo/static/js/web` (apague `dist` depois).

## Funcionalidades (Fase 3)

Continuam valendo:

| Requisito do desafio | Como foi atendido |
|---|---|
| Dashboard com gráficos e análises | Tela **Início** (saldo, receitas, despesas, despesas por categoria) e tela **Investimentos** |
| Animações entre seções com `Animated` | `FadeInView` nos blocos do dashboard e na troca de mês dos investimentos; painel dos modais |
| Listagem com filtros avançados | **Extrato**: busca, mês ("Todos os meses" incluso), período De/Até, tipo e categoria |
| Scroll infinito | `FlatList` com página crescente (`limit` de página + 1) em um único listener do Firestore |
| Busca integrada ao Cloud Firestore | O extrato assina `users/{uid}/transactions` direto no Firestore, com busca por prefixo da descrição |
| Adicionar e editar transações | Modal **Nova Transação** e tela de detalhe com edição e exclusão |
| Validação avançada | Formato e limites do valor, saldo disponível para saídas, categoria compatível com o tipo, tamanho da descrição |
| Upload de recibos no Firebase Storage | Imagem ou PDF de até 5 MB por transação, em `receipts/{uid}/` |
| Estado global | Zustand (ver [Requisitos da Fase 4](#requisitos-da-fase-4)); na Fase 3 era Context API |
| Login e autenticação | Firebase Authentication com e-mail e senha |

## Estrutura de pastas

```
.
├── my-app/                    App Expo
│   ├── .env                   Configuração web do Firebase (pública) e flag do emulador
│   └── src/
│       ├── app/               Rotas (expo-router): (auth) e (app)
│       ├── components/        atoms, molecules e organisms
│       ├── contexts/          AuthContext (ligação do onAuthStateChanged)
│       ├── domain/            entities, repositories (portas) e usecases
│       ├── infra/             container, firebase, http, repositories e security
│       ├── stores/            Zustand: slices, selectors e política de cache
│       ├── hooks/             useAuth, useAccountSync, useStatementStream...
│       └── lib/               statementStream, formatters, transactionSchema...
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
| `CORS_ORIGINS` | Origens liberadas no CORS da API, separadas por vírgula. Padrão `http://localhost:8081` (veja `backend/.env.example`) |

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

- **Web aberta por IP da rede** (por exemplo `http://192.168.0.10:8081`, de outro computador): a API só aceita navegadores de origens listadas em `CORS_ORIGINS`. Crie `backend/.env` com `CORS_ORIGINS=http://localhost:8081,http://192.168.0.10:8081` (com o seu IP) e reinicie a API. O app nativo não envia `Origin` e não é afetado.
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

- **Dados no aparelho**: o cache de conta/transações e, no nativo, a sessão do Firebase Auth ficam cifrados com AES-256-GCM; a chave está no Keychain/Keystore e é apagada no logout. Na web a chave fica em `localStorage` (só desenvolvimento).
- **CORS da API**: allowlist em `CORS_ORIGINS`; corpo JSON limitado a 100 kb.
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
| `my-app` | `start` | Inicia o Expo (QR code para o Expo Go) |
| `my-app` | `lint` | ESLint (expo lint) |
