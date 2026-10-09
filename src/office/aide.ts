import { effacer, ecrire, lire } from '../reglages/stockage'

// L'aide à la lecture de l'office (« Lire un office ») : elle revient à chaque
// office tant que « Ne plus afficher » n'est pas coché, ou que le réglage ne
// l'a pas coupée.
const CLE = 'avec-dieu.aide-office'

export function aideOfficeAMontrer(): boolean {
  return lire(CLE) !== 'masquee'
}

export function masquerAideOffice() {
  ecrire(CLE, 'masquee')
}

// Rétablie depuis les réglages : elle revient au prochain office.
export function montrerAideOffice() {
  effacer(CLE)
}
