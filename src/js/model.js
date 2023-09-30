import { API_KEY, API_URL, RES_PER_PAGE } from './config.js';
import { AJAX } from './helper.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    page: 1,
    results: [],
    resultsPerPage: RES_PER_PAGE,
    totalPages: null,
  },
  bookmarks: [],
};

/**
 * Creates a new recipe object based on a response object
 *
 * @param {Object} data Response object
 * @returns {Object} The new recipe object
 */
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

/**
 *
 * Load recipe based on given id
 *
 * @param {string} id Recipe id
 */
export const loadRecipe = async function (id) {
  try {
    // 1) Retrieve data
    const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);

    // 2) Rename props. and save data
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (err) {
    throw err;
  }
};

/**
 * Load search results based on given query
 *
 * @param {string} query
 */
export const loadSearchResults = async function (query) {
  try {
    // 1) Reset page number
    state.search.page = 1;

    // 2) Save query
    state.search.query = query;

    // 3) Retrieve data
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);

    // 4) Save search results
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });

    // 5) Calculate number of pages
    calculateNumberOfPages();
  } catch (err) {
    console.error(`${err} ❌❌❌❌`);
    throw err;
  }
};

const calculateNumberOfPages = function () {
  state.search.totalPages = Math.ceil(
    state.search.results.length / state.search.resultsPerPage
  );
};

/**
 * Get page specific search results
 *
 * @param {number} [page] The page number
 * @returns {Array} Array with page specific results
 */
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

/**
 *
 * @param {number} newServings New servings number
 * @returns {undefined}
 */
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    // new qt = current qt * newServings / oldServings // 1 * 8 / 4 = 2
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

/**
 * Save bookmarks to local storage
 * @returns {undefined}
 */
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

/**
 * @param {Object} recipe The recipe to be bookmarked
 * @returns {undefined}
 */
export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

/**
 *
 * @param {number} id The bookmark (recipe) id
 * @returns {undefined}
 */
export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe as NOT bookmarked
  if (state.recipe.id === id) state.recipe.bookmarked = false;

  persistBookmarks();
};

/**
 * Upload new recipe to API
 * @param {Object} newRecipe The recipe to be uploaded to the API
 */
export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        try {
          const ingredient = ing[1].split(',').map(el => el.trim());

          if (ingredient.length !== 3)
            throw new Error(
              'Wrong ingredient format! Please use the correct format ;)'
            );

          const [quantity, unit, description] = ingredient;

          return { quantity: quantity ? +quantity : null, unit, description };
        } catch (err) {
          throw err;
        }
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

/**
 * Function that initializes the application
 * @returns {undefined}
 */
const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

// ONLY meant for development
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

// clearBookmarks();
