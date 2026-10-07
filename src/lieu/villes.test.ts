import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { chercherVilles, decrireVille, lireVilles, villeLaPlusProche, type Ville } from './villes'

const ville = (
  nom: string,
  population: number,
  autre = '',
  region = 'Région',
  pays = 'FR',
): Ville => ({
  nom,
  ...(autre ? { autre } : {}),
  region,
  pays,
  latitude: 0,
  longitude: 0,
  population,
})

const noms = (villes: Ville[]) => villes.map((v) => v.nom)

describe('lireVilles', () => {
  it('lit les colonnes, ignore la ligne de commentaire et les lignes vides', () => {
    const texte = [
      '# nom\tautre\tregion\tpays\tlatitude\tlongitude\tpopulation',
      'Genève\tGeneva\tCanton de Genève\tCH\t46.20\t6.15\t202',
      'Lyon\t\tAuvergne-Rhône-Alpes\tFR\t45.75\t4.85\t521',
      'Ville sans région\t\t\tSG\t1.29\t103.85\t5000',
      '',
    ].join('\n')
    expect(lireVilles(texte)).toEqual([
      {
        nom: 'Genève',
        autre: 'Geneva',
        region: 'Canton de Genève',
        pays: 'CH',
        latitude: 46.2,
        longitude: 6.15,
        population: 202,
      },
      {
        nom: 'Lyon',
        region: 'Auvergne-Rhône-Alpes',
        pays: 'FR',
        latitude: 45.75,
        longitude: 4.85,
        population: 521,
      },
      {
        nom: 'Ville sans région',
        region: '',
        pays: 'SG',
        latitude: 1.29,
        longitude: 103.85,
        population: 5000,
      },
    ])
  })
})

describe('chercherVilles', () => {
  const villes = [
    ville('Saint-Étienne', 176),
    ville('Étiennette', 20),
    ville('Lyon', 521),
    ville('Lyons', 30),
    ville('Mont-de-Lyon', 600),
    ville('Genève', 202, 'Geneva'),
    ville('Sainte-Foy', 40),
    ville('L’Haÿ-les-Roses', 30),
    ville('St. Louis', 300, '', 'Missouri', 'US'),
  ]

  it('ne donne rien sous deux caractères', () => {
    expect(chercherVilles(villes, '')).toEqual([])
    expect(chercherVilles(villes, ' l ')).toEqual([])
  })

  it('classe : nom égal, puis début du nom, puis début d’un mot ; à rang égal, la plus peuplée', () => {
    expect(noms(chercherVilles(villes, 'lyon'))).toEqual(['Lyon', 'Lyons', 'Mont-de-Lyon'])
  })

  it('ignore accents, casse, traits d’union, apostrophes et points', () => {
    expect(noms(chercherVilles(villes, 'SAINT ETIENNE'))).toEqual(['Saint-Étienne'])
    expect(noms(chercherVilles(villes, 'l haÿ'))).toEqual(['L’Haÿ-les-Roses'])
    expect(noms(chercherVilles(villes, "l'hay-les"))).toEqual(['L’Haÿ-les-Roses'])
    expect(noms(chercherVilles(villes, 'saint louis'))).toEqual(['St. Louis'])
  })

  it('trouve un mot du nom : « etienne » trouve Saint-Étienne', () => {
    expect(noms(chercherVilles(villes, 'etienne'))).toEqual(['Étiennette', 'Saint-Étienne'])
  })

  it('« st » et « ste » valent « saint » et « sainte »', () => {
    expect(noms(chercherVilles(villes, 'st etienne'))).toEqual(['Saint-Étienne'])
    expect(noms(chercherVilles(villes, 'ste foy'))).toEqual(['Sainte-Foy'])
  })

  it('le nom d’origine compte comme le nom, sans doublon', () => {
    expect(noms(chercherVilles(villes, 'geneva'))).toEqual(['Genève'])
    expect(noms(chercherVilles(villes, 'gene'))).toEqual(['Genève'])
  })

  it('limite le nombre de résultats (8 par défaut)', () => {
    const beaucoup = Array.from({ length: 20 }, (_, i) => ville(`Saint-Ville ${i}`, i))
    expect(chercherVilles(beaucoup, 'saint')).toHaveLength(8)
    expect(chercherVilles(beaucoup, 'saint', 3).map((v) => v.population)).toEqual([19, 18, 17])
  })

  it('ne répète pas deux villes qui s’afficheraient de la même façon', () => {
    const doubles = [ville('Lyon', 521), ville('Lyon', 3)]
    expect(chercherVilles(doubles, 'lyon')).toEqual([doubles[0]])
  })
})

describe('villeLaPlusProche', () => {
  const lieux: Ville[] = [
    { ...ville('Lyon', 521), latitude: 45.75, longitude: 4.85 },
    { ...ville('Saint-Étienne', 176), latitude: 45.43, longitude: 4.39 },
    { ...ville('Suva', 77, '', 'Central', 'FJ'), latitude: -18.14, longitude: 178.44 },
    { ...ville('Apia', 40, '', 'Tuamasaga', 'WS'), latitude: -13.83, longitude: -171.77 },
  ]

  it('donne la ville la plus proche', () => {
    expect(villeLaPlusProche(lieux, { latitude: 45.7, longitude: 4.8 })?.nom).toBe('Lyon')
    expect(villeLaPlusProche(lieux, { latitude: 45.45, longitude: 4.4 })?.nom).toBe('Saint-Étienne')
  })

  it('traverse l’antiméridien', () => {
    expect(villeLaPlusProche(lieux, { latitude: -15, longitude: -179 })?.nom).toBe('Suva')
  })

  it('ne donne rien sans villes', () => {
    expect(villeLaPlusProche([], { latitude: 0, longitude: 0 })).toBeUndefined()
  })
})

describe('decrireVille', () => {
  it('donne « Région, Pays » en français', () => {
    expect(decrireVille(ville('Genève', 202, 'Geneva', 'Canton de Genève', 'CH'))).toBe(
      'Canton de Genève, Suisse',
    )
  })

  it('donne le pays seul sans région', () => {
    expect(decrireVille(ville('Singapour', 5000, '', '', 'SG'))).toBe('Singapour')
  })

  it('nomme l’outre-mer français par son territoire, puis la France', () => {
    expect(decrireVille(ville('Saint-Denis', 155, '', 'Réunion', 'RE'))).toBe('La Réunion, France')
    expect(decrireVille(ville('Fort-de-France', 80, '', 'Martinique', 'MQ'))).toBe(
      'Martinique, France',
    )
  })
})

describe('le vrai fichier des villes', () => {
  const villes = lireVilles(readFileSync('public/villes.tsv', 'utf8'))
  const premiere = (saisie: string) => chercherVilles(villes, saisie)[0]
  const decrire = (v: Ville | undefined) => (v ? `${v.nom} · ${decrireVille(v)}` : '')

  it('contient les villes de plus de 15 000 habitants du monde', () => {
    expect(villes.length).toBeGreaterThan(25000)
    expect(villes.every((v) => v.nom && v.pays.length === 2)).toBe(true)
  })

  it('donne les noms français et leur description', () => {
    expect(decrire(premiere('lyon'))).toBe('Lyon · Auvergne-Rhône-Alpes, France')
    expect(decrire(premiere('st etienne'))).toBe('Saint-Étienne · Auvergne-Rhône-Alpes, France')
    expect(decrire(premiere('londres'))).toBe('Londres · Angleterre, Royaume-Uni')
    expect(decrire(premiere('london'))).toBe('Londres · Angleterre, Royaume-Uni')
    expect(decrire(premiere('geneva'))).toBe('Genève · Canton de Genève, Suisse')
    expect(decrire(premiere('munich'))).toBe('Munich · Bavière, Allemagne')
    expect(decrire(premiere('bruxelles'))).toBe('Bruxelles · Bruxelles-Capitale, Belgique')
    expect(decrire(premiere('quebec'))).toBe('Québec · Québec, Canada')
  })

  it('distingue les deux Saint-Denis', () => {
    const saintDenis = chercherVilles(villes, 'saint-denis').filter((v) => v.nom === 'Saint-Denis')
    expect(saintDenis.map(decrireVille).slice(0, 2)).toEqual([
      'La Réunion, France',
      'Île-de-France, France',
    ])
  })

  it('retrouve la ville d’un lieu donné par ses coordonnées', () => {
    expect(villeLaPlusProche(villes, { latitude: 45.76, longitude: 4.84 })?.nom).toBe('Lyon')
    expect(villeLaPlusProche(villes, { latitude: -20.88, longitude: 55.45 })?.nom).toBe(
      'Saint-Denis',
    )
  })
})

describe('chargerVilles', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('télécharge le fichier une seule fois', async () => {
    const fetch = vi.fn(
      async () => new Response('Lyon\t\tAuvergne-Rhône-Alpes\tFR\t45.75\t4.85\t521\n'),
    )
    vi.stubGlobal('fetch', fetch)
    const { chargerVilles } = await import('./villes')
    const [a, b] = await Promise.all([chargerVilles(), chargerVilles()])
    expect(a).toBe(b)
    expect(a.map((v) => v.nom)).toEqual(['Lyon'])
    await chargerVilles()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('/villes.tsv')
  })

  it('réessaie après un échec', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 404 }))
      .mockResolvedValueOnce(new Response('Lyon\t\t\tFR\t45.75\t4.85\t521\n'))
    vi.stubGlobal('fetch', fetch)
    const { chargerVilles } = await import('./villes')
    await expect(chargerVilles()).rejects.toThrow()
    expect((await chargerVilles()).map((v) => v.nom)).toEqual(['Lyon'])
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
