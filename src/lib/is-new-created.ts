export const isNewProduct = (createdAt: string): boolean => {
    const productDate = new Date(createdAt)
    const currentDate = new Date()
    const differenceInDays = (currentDate.getTime() - productDate.getTime()) / (1000 * 3600 * 24)
    return differenceInDays <= 3 // Consider products created within the last 7 days as new
  }