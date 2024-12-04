import { CircleHelp, HistoryIcon, ListRestart, SearchIcon, SettingsIcon } from 'lucide-react'
import Dashboard from '@/components/tabs/dashboard'
import Settings from '@/components/tabs/settings'
import History from '@/components/tabs/history'
import Search from '@/components/tabs/search'
import Misc from '@/components/tabs/misc'

const Tabs = [
  {
    title: 'Dashboard',
    component: Dashboard,
    icon: ListRestart
  },
  {
    title: 'Misc.',
    component: Misc,
    icon: CircleHelp
  },
  {
    title: 'Search',
    component: Search,
    icon: SearchIcon
  },
  {
    title: 'History',
    component: History,
    icon: HistoryIcon
  },
  {
    title: 'Settings',
    component: Settings,
    icon: SettingsIcon
  }
]

const TabMap = Tabs.reduce((acc, item) => {
  acc[item.title] = item.component
  return acc
}, {})

export { TabMap }
export default Tabs
