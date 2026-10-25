export const STORAGE_KEY = "istoque.sessao";

export function isExpired(expiraEm, now = Date.now()) {
  const ms = typeof expiraEm === "number" ? expiraEm : Date.parse(expiraEm);
  return !(ms > now);
}

export function writeStoredSession(storage, session) {
  try {
    if (session) storage.setItem(STORAGE_KEY, JSON.stringify(session));
    else storage.removeItem(STORAGE_KEY);
  } catch {
    // sem acesso ao armazenamento do navegador: a sessão vale só nesta aba
  }
}

export function readStoredSession(storage, now = Date.now()) {
  let stored = null;
  try {
    stored = JSON.parse(storage.getItem(STORAGE_KEY));
  } catch {
    return { session: null, expired: false };
  }
  if (!stored?.empresaId) return { session: null, expired: false };
  if (!stored.token || isExpired(stored.expiraEm, now)) {
    return { session: null, expired: true };
  }
  return { session: stored, expired: false };
}
