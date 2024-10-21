
import { ExpandableSidebar } from '@/components/expandable-sidebar'
import { Home, Store, Package2,Landmark, GitBranchIcon, Shapes, Percent, DollarSign, BookOpen } from 'lucide-react'


export function Sidebar() {
  const sidebarItems = [
    { icon: <Home size={24} />, text: 'Dashboard',link:'/admin/dashboard' },
    { icon: <Store size={24} />, text: 'Stores',link:'/admin/stores' },
    { icon: <Package2 size={24} />, text: 'Products',link:'/admin/products' },
    { icon: <GitBranchIcon size={24} />, text: 'Categories',link:'/admin/categories' },
    { icon: <Shapes size={24} />, text: 'Collections',link:'/admin/collections' },
    { icon: <Percent size={24} />, text: 'Discounts',link:'/admin/discounts' },
    { icon: <DollarSign size={24} />, text: 'Sales',link:'/admin/sales' },
    { icon: <BookOpen size={24} />, text: 'Banners',link:'/admin/banners' },
    {
      icon:<Landmark size={24} />, text:'Brands', link:'/admin/brands'}
  ]

  return (
      <ExpandableSidebar
        items={sidebarItems}
        defaultExpanded={true}
        expandedWidth="240px"
        collapsedWidth="64px"
        backgroundColor="bg-gray-50"
        textColor="text-gray-800"
      />
  )
}