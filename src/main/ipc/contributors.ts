import axios from 'axios'

async function InitializeContributors(f: Function) {
  const contributor_enpoint = 'https://api.github.com/repos/defsak/admin-gui/contributors'

  let contributors: any[] = []
  try {
    const { data } = await axios.get(contributor_enpoint)
    contributors = data
  } catch (e) {
    console.error(e)
  }

  f('fetch_contributors', () => {
    return contributors
  })
}

export default InitializeContributors
