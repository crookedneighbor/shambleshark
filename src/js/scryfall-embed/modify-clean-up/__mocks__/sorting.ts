const sortByNameSorter = jest.fn();

export const sortByName = jest.fn().mockReturnValue(sortByNameSorter);
export const sortByPrimaryCardType = jest.fn();
