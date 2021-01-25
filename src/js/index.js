// Global app controller
import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";
import Likes from "./models/Likes";

/** Global state of the app
 * - search object
 * -  current recipe object
 * - shopping list object
 * - like recipe
 */
const state = {};

const controlSearch = async () => {
  const query = searchView.getInput();

  if (query) {
    //new search object and add to state
    state.search = new Search(query);

    // prepare ui for seearch
    searchView.clearInput();
    searchView.clearList();
    renderLoader(elements.searchRes);

    try {
      //search recipe
      await state.search.getRecipe();

      //render ui
      clearLoader();
      searchView.renderResult(state.search.results);
    } catch (err) {
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});

elements.resPages.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearList();
    searchView.renderResult(state.search.results, goToPage);
  }
});

/**
 * RECIPE CONTROLLER
 */

const recipeController = async () => {
  const id = window.location.hash.replace("#", "");

  if (id) {
    // prepare ui for the changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //highlighted background
    if (state.search) searchView.highlightBox(id);

    //create new object from Recipe
    state.recipe = new Recipe(id);

    try {
      //get recipe
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      //recipe calculation
      state.recipe.calcTime();
      state.recipe.totalServing();

      //render to UI
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (error) {
      alert("Error Processing the Recipe");
      console.log(error);
    }
  }
};

["hashchange", "load"].forEach((event) => {
  window.addEventListener(event, recipeController);
});

/**
 * List Controller
 */

const controlList = () => {
  //create new list if there is no list  before
  state.list = new List();

  //add each ingredient to the list
  state.recipe.ingredients.forEach((el) => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderList(item);
  });
};

// handle, delete, update
elements.shoppingList.addEventListener("click", (e) => {
  const id = e.target.closest(".shopping__item").dataset.item;

  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    //delete item from the array
    state.list.deleteItem(id);
    //delete item for the ui
    listView.deleteItem(id);
  } else if (e.target.matches(".shopping__count-value")) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

/**
 * Likes controller
 */

const controlLikes = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  //user has not like the recipe
  if (!state.likes.isLiked(currentID)) {
    //add like to the state
    const newLike = state.likes.addLikes(
      currentID,
      state.recipe.title,
      state.recipe.publisher,
      state.recipe.img
    );

    //toggle like button
    likesView.toggleLikeBtn(true);

    // add like to the ui list
    likesView.renderLikes(newLike);
    console.log(state.likes);

    //user has liked the recipe
  } else {
    //remove like to the state
    state.likes.deleteLike(currentID);

    //toggle like button
    likesView.toggleLikeBtn(false);

    // remove like to the ui list
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

window.addEventListener("load", () => {
  state.likes = new Likes();

  state.likes.readStorage();

  likesView.toggleLikeMenu(state.likes.getNumLikes());

  //render the existing likes
  state.likes.likes.forEach((like) => likesView.renderLikes(like));
});

elements.recipe.addEventListener("click", (e) => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    //decrease button clicked
    if (state.recipe.serving > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIng(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    //increase button clicked
    state.recipe.updateServings("inc");
    recipeView.updateServingsIng(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    controlLikes();
  }
});
