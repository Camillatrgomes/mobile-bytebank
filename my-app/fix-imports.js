const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const findAndReplace = (dir) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findAndReplace(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // 1. Atoms (ui -> atoms)
      content = content.replace(/@\/components\/ui\//g, '@/components/atoms/');

      // 2. Molecules
      content = content.replace(/@\/components\/FilterBar/g, '@/components/molecules/FilterBar');
      content = content.replace(/@\/components\/ExtratoItem/g, '@/components/molecules/ExtratoItem');
      content = content.replace(/@\/components\/ReceitasDespesasCard/g, '@/components/molecules/ReceitasDespesasCard');
      content = content.replace(/@\/components\/InvestmentsKPICards/g, '@/components/molecules/InvestmentsKPICards');

      // 3. Organisms
      content = content.replace(/@\/components\/Header/g, '@/components/organisms/Header');
      content = content.replace(/@\/components\/SaldoDashboard/g, '@/components/organisms/SaldoDashboard');
      content = content.replace(/@\/components\/TransactionForm/g, '@/components/organisms/TransactionForm');
      content = content.replace(/@\/components\/TransactionEditForm/g, '@/components/organisms/TransactionEditForm');
      content = content.replace(/@\/components\/ExtratoList/g, '@/components/organisms/ExtratoList');
      content = content.replace(/@\/components\/DespesasPorCategoriaChart/g, '@/components/organisms/DespesasPorCategoriaChart');
      content = content.replace(/@\/components\/InvestmentsPieChart/g, '@/components/organisms/InvestmentsPieChart');
      content = content.replace(/@\/components\/InvestmentsTable/g, '@/components/organisms/InvestmentsTable');

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
};

findAndReplace(directoryPath);
console.log('Imports fixed!');
