# ByteBank — Tech Challenge Fase 3

Aplicativo de gerenciamento financeiro em **React Native (Expo)** integrado ao **Firebase** (Authentication, Cloud Firestore e Storage), desenvolvido para o Tech Challenge da Fase 3 da Pós-Tech FIAP.

## Arquitetura

```text
┌──────────────── my-app (Expo) ────────────────┐
│ Context API · SWR · react-hook-form + zod     │
└──────┬───────────────┬───────────────┬────────┘
       │ login         │ extrato       │ recibos
       ▼               ▼               ▼
 Firebase Auth   Cloud Firestore  Firebase Storage
       ▲               ▲
       │ ID token      │ Admin SDK
┌──────┴───────────────┴────────┐
│ backend (Express)             │ ← conta, cartão e gravação de transações
└───────────────────────────────┘
```

- **App (`my-app`)**: Utiliza Expo SDK 57, React Native 0.86, `expo-router` e React Compiler. O estado global é gerenciado com **Context API**, enquanto o cache e as requisições da API utilizam **SWR**.
- **Leituras do extrato**: Feitas diretamente no Firestore, com filtragem e paginação nativas na query. As **Security Rules** garantem que o usuário tenha acesso apenas às suas próprias transações.
- **Gravações**: Centralizadas na API, que valida o ID Token do Firebase via **Admin SDK** e isola as operações no documento do próprio usuário (`users/{uid}`).
- **Recibos**: Uploads feitos diretamente pelo app para o Firebase Storage. A URL final é salva no documento da transação correspondente.

**Modelo de Dados no Firestore:**
- `users/{uid}/accounts/{accountId}`
- `users/{uid}/cards/{cardId}`
- `users/{uid}/transactions/{transactionId}`
  *(Campos: type, value, from, to, category, date, descriptionLower, anexo, urlAnexo)*

## Estrutura de pastas

```text
.
├── my-app/                 # App Expo (Frontend)
│   ├── .env                   # Configuração pública do Firebase e flags
│   └── src/
│       ├── app/               # Rotas (expo-router): (auth) e (app)
│       ├── components/        # Componentes visuais (atoms, molecules, organisms)
│       ├── contexts/          # Contextos globais (AuthContext, TransactionsContext)
│       ├── hooks/             # Hooks customizados (SWR, autenticação, etc.)
│       └── lib/               # Utilitários, formatações e schemas (Zod)
│
├── backend/                # API Express + Firebase Admin SDK
│   ├── scripts/seed.js        # Script de geração de dados (demo user + transações)
│   ├── src/                   # Rotas, controllers e repositórios (Firestore)
│   └── tests/                 # Suíte de testes de integração (via emuladores)
│
├── Configurações Firebase
│   ├── firebase.json          # Configuração dos emuladores e caminhos
│   ├── firestore.rules        # Regras de segurança do Firestore
│   ├── firestore.indexes.json # Índices compostos para consultas
│   └── storage.rules          # Regras de segurança do Storage
```

## Pré-requisitos

| Ferramenta | Versão Mínima | Descrição |
|:---|:---:|:---|
| [Node.js](https://nodejs.org) | **22+** | Necessário para o App e a API (exigência do `firebase-admin`). |
| [Java JDK](https://adoptium.net) | **11+** | Necessário para executar o Firebase Emulator Suite. |
| [Firebase CLI](https://firebase.google.com/docs/cli) | **15+** | Ferramenta para gerenciar emuladores e deploy de regras. |
| Android Studio / Xcode / Expo Go | - | *Opcionais* para rodar o app fora do ambiente web. |

Para instalar o Firebase CLI globalmente:
```bash
npm install -g firebase-tools
```

## Configuração do Firebase

### Projeto do Grupo

O repositório já está configurado para apontar para o projeto `bytebank-48663`. A configuração web do Firebase encontra-se no arquivo `my-app/.env`. 
> 💡 **Nota:** As variáveis web do Firebase são públicas por design; a proteção real dos dados é garantida de forma rigorosa pelas **Security Rules**.

**Variáveis do App (`my-app/.env` e `my-app/.env.local`)**
| Variável | Descrição |
|:---|:---|
| `EXPO_PUBLIC_FIREBASE_*` | Credenciais e configurações públicas do app web no Firebase. |
| `EXPO_PUBLIC_USE_EMULATOR` | `1` (Usa o Emulator Suite local) ou `0` (Usa o projeto Cloud real). |
| `EXPO_PUBLIC_DEV_HOST` | *(Apenas em `.env.local`)* IP local da máquina para rodar em dispositivo físico. |

**Variáveis da API (`backend/.env` - Apenas para uso com projeto real)**
| Variável | Descrição |
|:---|:---|
| `GOOGLE_APPLICATION_CREDENTIALS` | Caminho absoluto para o JSON da chave de conta de serviço (nunca versione este arquivo). |
| `FIREBASE_PROJECT_ID` | ID do projeto no Firebase (padrão: `bytebank-48663`). |

### Usando o seu próprio projeto Firebase

1. Crie um novo projeto no [Console do Firebase](https://console.firebase.google.com).
2. Acesse **Authentication** → **Método de login** e ative **E-mail/senha**.
3. Acesse **Firestore Database** e crie o banco de dados em modo de produção.
4. Acesse **Storage** e crie um novo bucket.
5. Em **Configurações do projeto** → **Seus apps**, adicione um app **Web** e substitua as variáveis no seu arquivo `my-app/.env`.
6. Atualize o ID do projeto no arquivo `.firebaserc` (na raiz do projeto) e informe a variável `FIREBASE_PROJECT_ID` no `backend/.env`.
7. Faça o deploy das regras e índices: 
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

## Como rodar localmente

O fluxo de desenvolvimento padrão utiliza o **Firebase Emulator Suite**. Ele não exige credenciais externas reais, roda completamente offline e não gera custos. 
> Todos os comandos abaixo devem ser executados a partir da **raiz do repositório**.

**1. Instale as dependências**
```bash
npm --prefix backend install
npm --prefix my-app install
```

**2. Inicie os Emuladores** (Terminal 1)
```bash
npm --prefix backend run emulators
```
*(Aguarde até a mensagem "All emulators ready" aparecer no terminal).*

**3. Popule os dados de demonstração** (Com os emuladores rodando)
```bash
npm --prefix backend run seed
```
*(Este script criará o usuário base e lançamentos. O processo é necessário apenas na primeira vez).*

**4. Inicie a API Backend** (Terminal 2)
```bash
npm --prefix backend run dev
```
*(O backend rodará na porta `3000`).*

**5. Inicie o App Expo** (Terminal 3)
```bash
npm --prefix my-app run web
```
Acesse [http://localhost:8081](http://localhost:8081) e faça login com:
- **E-mail:** `teste@teste.com`
- **Senha:** `teste123`

**Dicas úteis:**
- Para emular nativamente, utilize `npm --prefix my-app run android` ou `run ios`. No emulador do Android Studio, a rede já é direcionada automaticamente para `10.0.2.2`.
- O painel visual interativo dos emuladores Firebase fica em [http://localhost:4000](http://localhost:4000).
- Encerre os emuladores pressionando `Ctrl+C`. Isso salvará os dados locais na pasta `.emulator-data/`, para que você não precise rodar o `seed` novamente no futuro.

## Rodando no celular (Expo Go)

1. Instale o app **Expo Go** (via App Store ou Google Play), garantindo compatibilidade com o SDK 57.
2. Descubra o IP da sua máquina na rede local:
   - Windows: `ipconfig`
   - macOS: `ipconfig getifaddr en0`
   - Linux: `hostname -I`
3. Crie um arquivo `my-app/.env.local` (este arquivo é ignorado pelo Git) e adicione a configuração para desenvolvimento local:
   ```env
   # Arquivo my-app/.env.local
   EXPO_PUBLIC_USE_EMULATOR=1
   EXPO_PUBLIC_DEV_HOST=192.168.0.x
   ```
   *(Substitua `192.168.0.x` pelo IP real do seu computador).*
4. Inicie os emuladores, a API e tenha rodado o seed. O `firebase.json` do projeto já está configurado com `"host": "0.0.0.0"` para aceitar as conexões locais.
5. Inicie o app na rede local sem a flag web:
   ```bash
   npm --prefix my-app start
   ```
6. Escaneie o QR Code exibido no terminal (no Android, utilize o próprio Expo Go; no iPhone, use o app da Câmera nativa).

**Solução de Problemas:**
- O computador e o celular **precisam estar na mesma rede Wi-Fi**, sem configurações de isolamento de clientes (comum em redes públicas ou de convidados).
- No iPhone, não se esqueça de clicar em **Permitir** quando o Expo Go solicitar acesso à "Rede Local" na primeira abertura.
- Se o QR Code exibir um IP diferente (ex: adaptador do VirtualBox ou VPN), passe a variável `REACT_NATIVE_PACKAGER_HOSTNAME` com o seu IP correto no console antes de iniciar o `start`.
- Em caso de bloqueio por firewall, libere explicitamente as portas `3000`, `8080`, `9099`, `9199` e `8081`.

## Testes e qualidade

A suíte de integração no backend (`backend/tests`) é automatizada para rodar contra os emuladores de Auth e Firestore. Ela gera contas temporárias, valida as regras e apaga os rastros imediatamente, sem corromper ou interferir nos dados do usuário base (`seed`).

Se os emuladores **já estiverem rodando**:
```bash
npm --prefix backend test
```

Se os emuladores **não** estiverem rodando (o script levanta o ambiente, roda os testes e desliga tudo em seguida):
```bash
npm --prefix backend run test:emulators
```

**Verificação de padronização (Linting):**
```bash
npm --prefix backend run lint
npm --prefix my-app run lint
```

## Rodando contra o Firebase real

1. Faça o deploy de todas as regras de segurança e índices (os índices do Firestore levam alguns minutos para serem propagados no Google Cloud):
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```
2. Crie o arquivo `backend/.env` (tendo o arquivo `backend/.env.example` como guia) e informe o caminho absoluto da chave da sua conta de serviço (`GOOGLE_APPLICATION_CREDENTIALS`).
3. Suba a API direcionando a conexão para a nuvem:
   ```bash
   npm --prefix backend run dev:cloud
   ```
4. Para preencher o banco de dados real em nuvem com os dados de demonstração:
   ```bash
   npm --prefix backend run seed:cloud
   ```
5. Por fim, configure `EXPO_PUBLIC_USE_EMULATOR=0` em seu `my-app/.env.local` e reinicie a aplicação.

## Segurança

- **Firestore**: O front-end expo lê exclusivamente o diretório `users/{uid}/transactions` do usuário atualmente autenticado. Como proteção em profundidade, gravações são inteiramente bloqueadas no app e passam obrigatoriamente pelas rotas seguras da API.
- **Storage**: Todo usuário possui um cofre particular em `receipts/{uid}/` e a regra de segurança barra uploads que passem do limite rígido de 5 MB ou de formatos que não sejam imagens/PDF.
- **API Backend**: Todas as transações dependem do ID Token do Firebase que é validado a cada requisição (exceção feita à rota de documentação em `/docs`).
- **Credenciais Administrativas**: O arquivo `service-account.json` ignora restrições e concede controle total; por isso, nunca deve ser colocado em repositório público ou vazado.
- **Ambiente de Produção**: Após usar o comando `seed` em ambiente em nuvem para apresentação, certifique-se de apagar a conta ou revogar seu acesso alterando a senha.

🔗 A documentação interativa da API (Swagger) fica disponível localmente em [http://localhost:3000/docs](http://localhost:3000/docs). Detalhes adicionais estão disponíveis no [README do backend](backend/readme).

## Scripts Básicos

| Diretório | Comando (`npm run ...`) | Funcionalidade |
|:---|:---|:---|
| **backend** | `emulators` | Sobe os emuladores do Firebase mantendo dados salvos e persistentes localmente. |
| **backend** | `seed` / `seed:cloud` | Injeta o usuário demonstração com os lançamentos (emuladores / projeto real). |
| **backend** | `dev` / `dev:cloud` | Inicializa o servidor local em ambiente dev (emuladores / projeto real). |
| **backend** | `test` / `test:emulators` | Roda testes de integração da API (aproveitando ambiente no ar / criando novo ambiente limpo). |
| **backend** | `lint` | Verifica problemas estáticos via ESLint. |
| **my-app**  | `web` / `android` / `ios` | Executa o Metro Bundler para a respectiva plataforma alvo. |
| **my-app**  | `lint` | Checa padronização do código fonte do app. |
