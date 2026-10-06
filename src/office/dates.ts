// Les dates des offices s'écrivent AAAA-MM-JJ, comme dans l'API AELF et les
// routes. Le jour est celui de l'horloge du téléphone, pas celui de Greenwich.

const deux = (n: number) => String(n).padStart(2, '0')

export function dateDuJour(maintenant = new Date()): string {
  return `${maintenant.getFullYear()}-${deux(maintenant.getMonth() + 1)}-${deux(maintenant.getDate())}`
}

const enDate = (date: string) => {
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
