import { RUBRIQUE_EXAMEN, TEXTES_OFFICE } from '../recueil/office'
import { PRIERES, RUBRIQUE_ENSEMBLE } from '../recueil/prieres'
import { sansAlleluia } from './dates'
import type { Bloc, NomOffice, Office, Partie, Strophe } from './modele'
import { conclureOraison } from './oraison'
import { strophesDe, texteDesBlocs } from './textes'

// L'office complet, reconstitué selon les règles validées par le porteur du
// projet (src/recueil/office.ts, R1 à R10) à partir du texte abrégé de l'AELF.
// Tout ce que l'app ajoute est marqué (Bloc.ajoute, Partie.ajoutee).

export interface Contexte {
  // R1 : cet office ouvre la journée de prière.
  premier: boolean
  // L'invitatoire du jour, que l'AELF ne donne qu'aux laudes : il suit
  // l'office des lectures quand celui-ci ouvre la journée.
  invitatoire?: Partie[]
  plusieurs: boolean
}

const OUVRENT_LA_JOURNEE: readonly NomOffice[] = ['lectures', 'laudes']
const CONCLUSION_LONGUE: readonly NomOffice[] = ['lectures', 'laudes', 'vepres']

const estPsalmique = (partie?: Partie) => partie?.type === 'psaume' || partie?.type === 'cantique'
const strophesDeLaPartie = (partie: Partie): Strophe[] => partie.blocs.flatMap((b) => b.strophes)

// L'antienne et le psaume de l'invitatoire, tels que l'AELF les donne aux laudes.
export function invitatoireDe(laudes: Office): Partie[] | undefined {
  const debut = laudes.parties.findIndex((p) => p.type === 'invitatoire')
  if (debut < 0) return undefined
  const psaume = laudes.parties[debut + 1]
  return estPsalmique(psaume) ? [laudes.parties[debut], psaume] : [laudes.parties[debut]]
}

function gloire(plusieurs: boolean, ajoute = true): Bloc {
  return {
    strophes: strophesDe(TEXTES_OFFICE['gloire-au-pere']),
    priere: 'Gloire au Père',
    ...(ajoute && { ajoute }),
    // R10 : à plusieurs, tous disent le Gloire au Père.
    ...(plusieurs && { rubrique: RUBRIQUE_ENSEMBLE }),
  }
}

const antienneReprise = (strophes: Strophe[]): Bloc => ({ strophes, ajoute: true, antienne: true })

// R1 et R2 : « Dieu, viens à mon aide », le Gloire au Père, et l'Alléluia hors Carême.
function introductionCourante(date: string, plusieurs: boolean): Bloc[] {
  return [
    { strophes: strophesDe(TEXTES_OFFICE.introduction) },
    gloire(plusieurs, false),
    ...(sansAlleluia(date) ? [] : [{ strophes: strophesDe(['Alléluia.']) }]),
  ]
}

// R3 : l'antienne, aussitôt répétée, puis reprise après chaque strophe ; le
// Gloire au Père, et l'antienne une dernière fois.
function invitatoireComplet([antienne, psaume]: Partie[], plusieurs: boolean, deplace: boolean) {
  const refrain = strophesDeLaPartie(antienne)
  const parties: Partie[] = [
    { ...antienne, blocs: [{ strophes: refrain }, antienneReprise(refrain)], ajoutee: deplace },
  ]
  if (psaume)
    parties.push({
      ...psaume,
      blocs: [
        ...strophesDeLaPartie(psaume).flatMap((strophe) => [
          { strophes: [strophe] },
          antienneReprise(refrain),
        ]),
        gloire(plusieurs),
        antienneReprise(refrain),
      ],
      ajoutee: deplace,
    })
  return parties
}

// R5 : seul le cantique des trois enfants « Toutes les œuvres du Seigneur »
// (Dn 3, 57-88) se passe du Gloire au Père.
function sansGloire(partie: Partie): boolean {
  const premierVerset = strophesDeLaPartie(partie)
    .flat(2)
    .find((s) => s.signe === 'verset')
  return /Dn 3/.test(partie.libelle) && premierVerset?.texte === '57'
}

// « R/ du psaume » : l'AELF renvoie au refrain du psaume, la première strophe
// marquée R/. Il devient l'antienne, sans repères de psalmodie.
const RENVOI_AU_REFRAIN = /^R\/\s*du psaume\.?$/i

function refrainDe(psaume?: Partie): Strophe | undefined {
  const strophe = psaume && strophesDeLaPartie(psaume).find((s) => s[0]?.[0]?.signe === 'R')
  return strophe?.map((ligne) => [
    {
      texte: ligne
        .filter((s) => s.signe !== 'R' && s.signe !== 'verset')
        .map((s) => s.texte)
        .join('')
        .trim(),
    },
  ])
}

function antiennesDites(parties: Partie[]): Partie[] {
  return parties.map((partie, i) => {
    if (partie.type !== 'antienne' || !RENVOI_AU_REFRAIN.test(texteDesBlocs(partie.blocs)))
      return partie
    const refrain = refrainDe(parties[i + 1])
    return refrain ? { ...partie, blocs: [{ strophes: [refrain], ajoute: true }] } : partie
  })
}

// R4 et R5 : le Gloire au Père après chaque psaume, et l'antienne après le
// dernier psaume qu'elle couvre.
function psalmodie(lues: Partie[], plusieurs: boolean): Partie[] {
  const parties = antiennesDites(lues)
  let antienne: Partie | undefined
  return parties.map((partie, i) => {
    if (partie.type === 'antienne') antienne = partie
    if (partie.type === 'antienne') return partie
    if (!estPsalmique(partie)) {
      antienne = undefined
      return partie
    }
    const blocs = [...partie.blocs]
    if (!sansGloire(partie)) blocs.push(gloire(plusieurs))
    if (antienne && !estPsalmique(parties[i + 1]))
      blocs.push(antienneReprise(strophesDeLaPartie(antienne)))
    return { ...partie, blocs }
  })
}

const partieAjoutee = (
  type: Partie['type'],
  libelle: string,
  blocs: Bloc[],
  ajoutee = true,
): Partie => ({ type, libelle, blocs, ajoutee })

// R9 : l'examen de conscience des complies, et sa prière de pénitence.
const examen = () =>
  partieAjoutee('examen', RUBRIQUE_EXAMEN, [
    { strophes: strophesDe(TEXTES_OFFICE['je-confesse']), priere: 'Je confesse à Dieu' },
    { strophes: strophesDe(TEXTES_OFFICE.absolution) },
  ])

// R8 : la fin de l'office, sauf aux complies, qui gardent la bénédiction de
// l'AELF, et sauf quand l'AELF joint son propre envoi à l'oraison.
function fin(nom: NomOffice): Partie | undefined {
  if (nom === 'complies') return undefined
  if (nom === 'laudes' || nom === 'vepres')
    return partieAjoutee('conclusion', 'Bénédiction', [
      { strophes: strophesDe(TEXTES_OFFICE.benediction) },
    ])
  return partieAjoutee('conclusion', 'Conclusion', [
    { strophes: strophesDe(TEXTES_OFFICE.benissons) },
  ])
}

export function reconstituer(office: Office, contexte: Contexte): Office {
  const { nom, date } = office
  const { plusieurs } = contexte
  const propre = invitatoireDe(office)
  const invitatoire = nom === 'laudes' ? propre : contexte.invitatoire
  // L'invitatoire a ses propres règles (R3) : la psalmodie se reconstitue sans lui.
  const sansInvitatoire = psalmodie(
    office.parties.filter((p) => !propre?.includes(p)),
    plusieurs,
  )
  const ouvre = contexte.premier && OUVRENT_LA_JOURNEE.includes(nom) && invitatoire !== undefined
  // À l'office des lectures, l'invitatoire vient des laudes : déplacé, il est un ajout.
  const deplace = nom !== 'laudes'

  let envoi = false
  const parties = sansInvitatoire.flatMap((partie): Partie[] => {
    switch (partie.type) {
      case 'introduction':
        if (ouvre)
          return [
            {
              ...partie,
              blocs: [{ strophes: strophesDe(TEXTES_OFFICE['introduction-invitatoire']) }],
              ajoutee: deplace,
            },
            ...invitatoireComplet(invitatoire, plusieurs, deplace),
          ]
        return [
          // Aux laudes, l'AELF ouvre toujours par l'invitatoire : le remplacer est un ajout.
          { ...partie, blocs: introductionCourante(date, plusieurs), ajoutee: nom === 'laudes' },
          ...(nom === 'complies' ? [examen()] : []),
        ]
      case 'notre-pere':
        // R6 : l'AELF n'en donne que le titre.
        return [
          {
            ...partie,
            blocs: [
              {
                strophes: strophesDe(PRIERES['notre-pere'].lignes),
                priere: 'Notre Père',
                ajoute: true,
              },
            ],
          },
        ]
      case 'oraison': {
        const conclue = conclureOraison(partie, CONCLUSION_LONGUE.includes(nom))
        if (!conclue.envoi) return [conclue.oraison]
        envoi = true
        return [
          conclue.oraison,
          partieAjoutee('conclusion', 'Conclusion', [{ strophes: conclue.envoi }], false),
        ]
      }
      default:
        return [partie]
    }
  })
  const derniere = envoi ? undefined : fin(nom)
  return { ...office, parties: [...parties, ...(derniere ? [derniere] : [])] }
}
