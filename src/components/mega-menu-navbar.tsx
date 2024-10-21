'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, User, ChevronDown, X, Menu, Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

import { searchProductsByName, fetchCategories, Category, Product } from '@/actions'

export function MegaMenuNavbar() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  useEffect(() => {
    const getCategories = async () => {
      const fetchedCategories = await fetchCategories()
      setCategories(fetchedCategories)
    }
    getCategories()
  }, [])

  const handleSearch = useDebouncedCallback(async (term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('query', term)
    } else {
      params.delete('query')
    }
    if (selectedCategory && selectedCategory !== "all") {
      params.set('category', selectedCategory)
    } else {
      params.delete('category')
    }
    replace(`${pathname}?${params.toString()}`)

    const results = await searchProductsByName(term, selectedCategory !== "all" ? selectedCategory : undefined)
    setSearchResults(results)
    setIsSearchOverlayOpen(true) // Update: setIsSearchOverlayOpen(true)
  }, 300)

  const closeSearchOverlay = () => {
    setIsSearchOverlayOpen(false)
  }

  const handleSearchInputBlur = () => {
    setTimeout(() => {
      if (!searchInputRef.current?.contains(document.activeElement)) {
        closeSearchOverlay()
      }
    }, 200)
  }

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen)
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    handleSearch(searchParams.get('query') || '')
  }

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-primary">
            MegaShop
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={`/category/${category.id}`}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{category.name}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Explore {category.name} products
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/sales" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Sales
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/collections" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Collections
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:flex items-center">
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                ref={searchInputRef}
                className="ml-2 w-[200px] lg:w-[300px]"
                placeholder="Search products..."
                onChange={(e) => handleSearch(e.target.value)}
                onBlur={handleSearchInputBlur}
                defaultValue={searchParams.get('query')?.toString()}
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileSearch}>
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="sr-only">Shopping Cart</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <h3 className="font-medium leading-none">Your Cart</h3>
                  <p className="text-sm text-muted-foreground">View and manage your cart items</p>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-4 w-4" />
                  <span className="sr-only">User Account</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <h3 className="font-medium leading-none">Your Account</h3>
                  <p className="text-sm text-muted-foreground">Manage your account settings</p>
                </div>
              </PopoverContent>
            </Popover>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="categories">
                      <AccordionTrigger>Categories</AccordionTrigger>
                      <AccordionContent>
                        <ul className="pl-4 space-y-2">
                          {categories.map((category) => (
                            <li key={category.id}>
                              <Link href={`/category/${category.id}`} className="text-sm text-muted-foreground hover:text-foreground">
                                {category.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="sales">
                      <AccordionTrigger>Sales</AccordionTrigger>
                      <AccordionContent>
                        <ul className="pl-4 space-y-2">
                          <li>
                            <Link href="/sales/new-arrivals" className="text-sm text-muted-foreground hover:text-foreground">
                              New Arrivals
                            </Link>
                          </li>
                          <li>
                            <Link href="/sales/clearance" className="text-sm text-muted-foreground hover:text-foreground">
                              Clearance
                            </Link>
                          </li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="collections">
                      <AccordionTrigger>Collections</AccordionTrigger>
                      <AccordionContent>
                        <ul className="pl-4 space-y-2">
                          <li>
                            <Link href="/collections/summer" className="text-sm text-muted-foreground hover:text-foreground">
                              Summer Collection
                            </Link>
                          </li>
                          <li>
                            <Link href="/collections/winter" className="text-sm text-muted-foreground hover:text-foreground">
                              Winter Collection
                            </Link>
                          </li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden"
          >
            <div className="container mx-auto px-4 py-2">
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-full mb-2">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="w-full"
                placeholder="Search products..."
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('query')?.toString()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOverlayOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute left-0 right-0 bg-background border-t shadow-lg z-50"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <h3 className="text-lg font-semibold mb-4">Search Results</h3>
                  <ul className="space-y-2">
                    {searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <li key={result.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <Link href={`/product/${result.id}`} className="text-foreground hover:text-primary">
                            {result.name}
                          </Link>
                          <span className="text-muted-foreground">${result.price?.toFixed(2)}</span>
                        </li>
                      ))
                    ) : (
                      <li className="py-2 text-muted-foreground">No products found. Please try a different search term.</li>
                    )}
                  </ul>
                </div>
                <Button variant="ghost" size="icon" onClick={closeSearchOverlay}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close search results</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}