export const loadData = async (path) => {
    try {
        const response = await fetch(path);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Failed to load data', error);
      }
}