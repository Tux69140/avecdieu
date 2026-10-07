// Les dates des offices s'écrivent AAAA-MM-JJ, comme dans l'API AELF et les
// routes. Le jour est celui de l'horloge du téléphone, pas celui de Greenwich.

const deux = (n: number) => String(n).padStart(2, '0')

export function dateDuJour(maintenant = new Date()): string {
  return `${maintenant.getFullYear()}-${deux(maintenant.getMonth() + 1)}-${deux(maintenant.getDate())}`
}

export const enDate = (date: string) => {
  const [annee, mois, jour] = date.split('-').map(Number)
  return new Date(annee, mois - 1, jour)
}

export function estDate(valeur: string | undefined): valeur is string {
  return /^\d{4}-\d{2}-\d{2}$/.test(valeur ?? '') && dateDuJour(enDate(valeur!)) === valeur
}

const FORMAT = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

// « mardi 6 octobre », « dimanche 1er novembre ».
export function dateLisible(date: string): string {
  return FORMAT.format(enDate(date)).replace(/^(\S+) 1 /, '$1 1er ')
}

// « du mardi 6 au mercredi 14 octobre » : le mois n'est dit qu'une fois s'il
// est le même aux deux bouts.
export function periodeLisible(debut: string, fin: string): string {
  const memeMois = debut.slice(0, 7) === fin.slice(0, 7)
  const premier = dateLisible(debut)
  return `du ${memeMois ? premier.replace(/ \S+$/, '') : premier} au ${dateLisible(fin)}`
}

const COURT = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric' })

// « dim. 4 », « dim. 1er » : les jours voisins, sur l'accueil.
export function dateCourte(date: string): string {
  return COURT.format(enDate(date)).replace(/ 1$/, ' 1er')
}

export const decaler = (date: string, jours: number) => {
  const d = enDate(date)
  d.setDate(d.getDate() + jours)
  return dateDuJour(d)
}

// Le dimanche de Pâques, par le comput grégorien (algorithme anonyme de Meeus).
export function paques(annee: number): string {
  const a = annee % 19
  const b = Math.floor(annee / 100)
  const c = annee % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mois = Math.floor((h + l - 7 * m + 114) / 31)
  const jour = ((h + l - 7 * m + 114) % 31) + 1
  return `${annee}-${deux(mois)}-${deux(jour)}`
}

// R2 : l'Alléluia de l'introduction se tait du mercredi des Cendres (Pâques
// moins 46 jours) jusqu'à la Vigile pascale, solennités comprises.
export function sansAlleluia(date: string): boolean {
  const dimanche = paques(Number(date.slice(0, 4)))
  return date >= decaler(dimanche, -46) && date < dimanche
}
