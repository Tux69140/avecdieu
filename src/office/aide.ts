import { aideMasquable, RACINE } from '../reglages/stockage'

// L'aide à la lecture de l'office (« Lire un office ») : elle revient à chaque
// office tant que « Ne plus afficher » n'est pas coché, ou que le réglage ne
// l'a pas coupée.
const CLE = `${RACINE}aide-office`

// Rétablie depuis les réglages, elle revient au prochain office.
export const {
  aMontrer: aideOfficeAMontrer,
  masquer: masquerAideOffice,
  montrer: montrerAideOffice,
} = aideMasquable(CLE)
