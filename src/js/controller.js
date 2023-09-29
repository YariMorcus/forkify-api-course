import { CLOSE_RECIPE_EDITOR_SEC } from './config.js';
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

const controlRecipes = async function () {
  try {
    // 1) Retrieve recipe hash
    const id = window.location.hash.slice(1);

    if (!id) return;

    // 2) Render loading spinner
    recipeView.renderSpinner();

    // 3) Update results view to mark selected search result
    resultsView.render(model.getSearchResultsPage());

    // 4) Update bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 5) Load recipe data
    await model.loadRecipe(id);

    // 6) Render recipe data
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    // 1) Render loading spinner
    resultsView.renderSpinner();

    // 2) Get search query
    const query = searchView.getQuery();

    if (!query) return;

    // 3) Get search results
    await model.loadSearchResults(query);

    // 4) Render search results
    resultsView.render(model.getSearchResultsPage());

    // 5) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    // Temp error handling
    console.error(`${err} ❌❌❌❌`);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render NEW search results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

// number param.
const controlServings = function (newServings) {
  // 1) Update recipe servings (state)
  model.updateServings(newServings);

  // 2) Update recipe view with NEW data
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/delete bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Rerender bookmark button
  recipeView.update(model.state.recipe);

  // 3) Render error OR bookmarks
  if (!model.state.bookmarks.length) bookmarksView.renderError();
  else bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  // Render bookmarks
  if (Array.isArray(model.state.bookmarks) && model.state.bookmarks.length)
    bookmarksView.render(model.state.bookmarks);
};

export const controlAddRecipe = async function (recipe) {
  try {
    // 1) Show loading spinner
    addRecipeView.renderSpinner();

    // 2) Upload new recipe data
    await model.uploadRecipe(recipe);

    // 3) Render recipe
    recipeView.render(model.state.recipe);

    // 4) Show success message
    addRecipeView.renderMessage();

    // 5) Render bookmark in bookmarks view
    bookmarksView.render(model.state.bookmarks);

    // 6) Change ID in URL
    window.history.pushState(null, '', `${model.state.recipe.id}`);

    // 7) Hide recipe editor
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, CLOSE_RECIPE_EDITOR_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  addRecipeView.addHandlerUpload(controlAddRecipe);
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
};

init();
