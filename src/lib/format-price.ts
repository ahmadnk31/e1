export const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-EUR", {
        style: "currency",
        currency: "EUR",
    }).format(price);
    };
    export const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      })