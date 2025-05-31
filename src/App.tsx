import axios from "axios"
import { useEffect, useState } from "react"
import { z } from "zod"

const version = "v1.0.2"

function reduceText(text: string, maxLength: number = 21):string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

function bolderText(text: string) {
  return <div className="font-bold">{text}</div>
}

const countryShema = z.array(
  z.object({
    name: z.object({
      common: z.string(),
      official: z.string(),
    }),
    population: z.number(),
    region: z.string(),
    subregion: z.string().optional(),
    capital: z.array(z.string()).optional(),
    flags: z.object({
      png: z.string(),
    }),
    maps: z.object({
      googleMaps: z.string().optional(),
      openStreetMaps: z.string().optional(),
    }),
    area: z.number(),
    independent: z.boolean().optional(),

  })
)


function App() {

  const [countrys, setCountrys] = useState<z.infer<typeof countryShema>>([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)


  const [search, setSearch] = useState<string | null>(null)
  const [range, setRange] = useState<number>(0) // Nombre d'éléments à afficher
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [sortBy, setSortBy] = useState<"population" | "area" | "official_name" | "common_name">("official_name")

  useEffect(() => {
    axios.get("https://restcountries.com/v3.1/all").then((response) => {
      const data = response.data
      const result = countryShema.safeParse(data)

      if (result.success) {
        setCountrys(data)
        setLoading(false)
        setRange(data.length)
      } else {
        setError("Invalid data format")
      }
    })
  }, [])

  if (error) {
    return <div className="alert alert-error">
      <div className="flex-1">
        <label className="cursor-pointer">
          <span className="label-text">{error}</span>
        </label>
      </div>
    </div>
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  }

  return (
    <div>

      {/* Heander */}
      <div className="flex flex-col items-center">

        {/* Titre */}
        <div className="m-10 flex flex-row items-end gap-2">
          <h1 className="text-6xl font-bold font-poetsen" translate="no">Countries</h1>
          <span className="italic">{version}</span>
        </div>

        {/* Parametres */}
        <div className="flex flex-row gap-4 p-4 rounded-lg shadow-lg">

          {/* bare de recherche */}
          <div title="Search countries">
            <label className="input">
              <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </g>
              </svg>
              <input type="search" className="grow" placeholder="Search countries" onChange={e => setSearch(e.target.value)} />
            </label>
          </div>

          {/* Nombre de elements a afficher */}
          <div className="flex items-center" title="Number of countries to display">
            <input type="range"
              min="1"
              max={countrys.length}
              value={range}
              onChange={e => setRange(Number(e.target.value))}
            />
            <span>{range}</span>
          </div>

          {/* Ordre alphabetique */}
          <div title="Sort order">
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value as "asc" | "desc")} className="select">
              <option value="asc">Ascendant</option>
              <option value="desc">Descendant</option>
            </select>
          </div>

          {/* Ordre */}
          <div title="Sort by">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as "population" | "area" | "official_name" | "common_name")} className="select">
              <option value="population">Population</option>
              <option value="area">Area</option>
              <option value="official_name">Official Name</option>
              <option value="common_name">Common Name</option>
            </select>
          </div>

        </div>
      </div>

      {/* Liste des pays */}
      <div className="overflow-x-auto p-4">
        <table className="table w-full">
          <thead className="">
            <tr>
              <th>n°</th>
              <th>Flag</th>
              <th>Official Name</th>
              <th>Common Name</th>
              <th>Capital</th>
              <th>Population</th>
              <th>Region</th>
              <th>Subregion</th>
              <th>Map</th>
              <th>Area</th>
              <th>independent</th>
            </tr>
          </thead>
          <tbody>
            {countrys
            .filter(country => {
              if (!search) return true
              const searchLower = search.toLowerCase()
              return country.name.common.toLowerCase().includes(searchLower) || country.name.official.toLowerCase().includes(searchLower)
            })
            .sort((a, b) => {
              if (sortBy === "population") {
                return sortOrder === "asc" ? a.population - b.population : b.population - a.population
              } else if (sortBy === "area") {
                return sortOrder === "asc" ? (a.area || 0) - (b.area || 0) : (b.area || 0) - (a.area || 0)
              } else if (sortBy === "official_name") {
                return sortOrder === "asc" ? a.name.official.localeCompare(b.name.official) : b.name.official.localeCompare(a.name.official)
              } else if (sortBy === "common_name") {
                return sortOrder === "asc" ? a.name.common.localeCompare(b.name.common) : b.name.common.localeCompare(a.name.common)
              }
              return 0
            })
            .slice(0, typeof range === "number" ? range : countrys.length)
            .map((country, index) => (
              <tr key={country.name.official} className="hover:bg-base-300">
                <td>{index + 1}</td>
                <td>
                  <img src={country.flags.png} alt={country.name.common} className="w-24 h-12 shadow-sm" />
                </td>
                <td title={country.name.official}>{reduceText(country.name.official)}</td>
                <td title={country.name.common}>{reduceText(country.name.common)}</td>
                <td>{country.capital ? country.capital[0] : bolderText("No capital")}</td>
                <td>{country.population.toLocaleString()}</td>
                <td>{country.region}</td>
                <td>{country.subregion || bolderText("No sub region")}</td>
                <td>
                  <a href={country.maps.googleMaps} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary" title="View on Google Maps">
                    View Map
                  </a>
                </td>
                <td>{country.area.toLocaleString() + " km²"}</td>
                <td>{country.independent ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
