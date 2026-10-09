import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { situerOffices } from '../accueil/moment'
import { dateDuJour } from '../office/dates'
import { minutesDe } from '../office/heure'
import { heuresDuJour } from '../office/heures'
import { cheminOffice, estNomOffice } from '../office/modele'

// Les raccourcis de l'icône de l'app (appui long), publiés par
// android/…/Raccourcis.java : « Prière du moment », « Chapelet », « Rosaire »
// (demande du porteur du projet, 2026-10-09). Chacun ouvre l'app sur une
// adresse avecdieu://…, que l'app traduit ici en écran.

const SCHEMA = 'avecdieu://'

// L'écran d'un raccourci. La prière du moment se calcule à l'heure où on le
// touche, comme sur l'accueil ; sans prière du moment, l'accueil.
export function routeDuRaccourci(url: string, maintenant: Date): string | undefined {
  if (!url.startsWith(SCHEMA)) return undefined
  const nom = url.slice(SCHEMA.length).replace(/\/$/, '')
  if (nom === 'chapelet' || nom === 'rosaire') return `/${nom}`
  if (nom !== 'moment') return undefined
  const date = dateDuJour(maintenant)
  const { moment } = situerOffices(heuresDuJour(date), minutesDe(maintenant))
  if (moment === 'chapelet') return '/chapelet'
  return moment && estNomOffice(moment) ? cheminOffice(moment, date) : '/'
}

// L'app ouverte par un raccourci, fermée ou déjà en route.
export function ouvrirLesRaccourcis(ouvrir: (route: string) => void) {
  if (!Capacitor.isNativePlatform()) return
  const suivre = (url: string | undefined) => {
    const route = url && routeDuRaccourci(url, new Date())
    if (route) ouvrir(route)
  }
  App.getLaunchUrl()
    .then((lancement) => suivre(lancement?.url))
    .catch(() => {})
  App.addListener('appUrlOpen', ({ url }) => suivre(url)).catch(() => {})
}
