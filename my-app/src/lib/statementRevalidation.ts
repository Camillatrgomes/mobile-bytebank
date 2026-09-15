const revalidators = new Set<() => void>();

// O mutate global do SWR ignora chaves do useSWRInfinite; quem altera transações chama isto.
export function revalidateStatement() {
  revalidators.forEach((revalidate) => revalidate());
}

export function registerStatementRevalidator(revalidate: () => void) {
  revalidators.add(revalidate);
  return () => {
    revalidators.delete(revalidate);
  };
}
