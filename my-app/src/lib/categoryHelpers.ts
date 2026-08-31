/**
 * Suggests a transaction category based on description keywords.
 * Mirrors the logic from the mfe-bytebank web project.
 */
export function suggestCategory(description: string): string | null {
  const lower = description.toLowerCase();

  if (/uber|99|taxi|gasolina|ônibus|metro|combustível/.test(lower)) return 'Transporte';
  if (/mercado|supermercado|ifood|padaria|restaurante|lanche|açougue/.test(lower)) return 'Alimentação';
  if (/aluguel|condomínio|condominio|iptu/.test(lower)) return 'Moradia';
  if (/luz|água|agua|internet|telefone|energia|gás|gas/.test(lower)) return 'Contas';
  if (/farmácia|farmacia|médico|medico|academia|hospital|plano de saúde/.test(lower)) return 'Saúde';
  if (/escola|faculdade|curso|universidade|mensalidade|material/.test(lower)) return 'Educação';
  if (/cinema|netflix|spotify|viagem|hotel|show|festa|assinatura/.test(lower)) return 'Lazer';
  if (/salário|salario|pagamento/.test(lower)) return 'Salário';
  if (/freela|freelance|reembolso/.test(lower)) return 'Reembolso';
  if (/dividendo|rendimento|investimento/.test(lower)) return 'Investimentos';
  if (/transferência recebida|transferencia recebida|pix recebido/.test(lower)) return 'Transferência recebida';

  return null;
}
