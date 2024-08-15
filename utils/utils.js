// Fonction pour calculer le montant de la facture
export function calculateMontant(dateDebut, dateFin, prixParNuit) {
  const differenceEnJours = calculateDifferenceInDays(dateDebut, dateFin);
  return differenceEnJours * prixParNuit;
}

// Fonction pour calculer la différence en jours entre deux dates
export function calculateDifferenceInDays(dateDebut, dateFin) {
  const differenceEnMilliseconds = new Date(dateFin).getTime() - new Date(dateDebut).getTime();
  const diff = Math.ceil(differenceEnMilliseconds / (1000 * 60 * 60 * 24));

  return !!diff ? diff : 1;
}


export const paginateResponse = async (QueryModel,page,pageSize, queries={}) => {
  try {
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const result = await QueryModel?.findAndCountAll({
      ...queries,
      offset,
      limit,
    });

    const totalPages = Math.ceil(result.count / pageSize);
    const hasMore = page < totalPages;

    return {
      results: result.rows,
      pagination: {
        totalItems: result.count,
        totalPages,
        currentPage: page,
        pageSize,
        hasMore,
      },
    };
  } catch (error) {
    console.error(error)
  }
};