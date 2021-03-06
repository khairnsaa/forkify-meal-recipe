import { elements } from "./base";

export const getInput = () => elements.inputField.value;

export const clearInput = () => {
  elements.inputField.value = "";
};

export const clearList = () => {
  elements.searchResList.innerHTML = "";
  elements.resPages.innerHTML = "";
};

export const highlightBox = (id) => {
  const resArr = Array.from(document.querySelectorAll(".results__link"));
  resArr.forEach((el) => {
    el.classList.remove("results__link--active");
  });

  document
    .querySelector(`.results__link[href="#${id}"]`)
    .classList.toggle("results__link--active");
};

export const listTitle = (title, limit = 17) => {
  const newTitle = [];
  if (title.length > limit) {
    title.split(" ").reduce((acc, cur) => {
      if (acc + cur.length <= limit) {
        newTitle.push(cur);
      }
      return acc + cur.length;
    }, 0);

    // return the result
    return `${newTitle.join(" ")} ...`;
  }
  //return result
  return title;
};

const renderRecipe = (recipe) => {
  const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${listTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>        
    `;

  elements.searchResList.insertAdjacentHTML("beforeend", markup);
};

const controllButton = (page, type) => `
<button class="btn-inline results__btn--${type}" data-goto=${
  type === "prev" ? page - 1 : page + 1
}> 
  <span>Page ${type === "prev" ? page - 1 : page + 1}</span>
  <svg class="search__icon">     
    <use href="img/icons.svg#icon-triangle-${
      type === "prev" ? "left" : "right"
    }"></use> 
  </svg>  
</button> 
`;

const renderButton = (page, numResult, resPerPage) => {
  const pages = Math.ceil(numResult / resPerPage);

  let button;
  if (page === 1 && page < pages) {
    //only next button
    button = controllButton(page, "next");
  } else if (page < pages) {
    //both button
    button = `
      ${(button = controllButton(page, "prev"))}
      ${(button = controllButton(page, "next"))}
    `;
  } else if (page === pages && page > 1) {
    //only prev button
    button = controllButton(page, "prev");
  }
  elements.resPages.insertAdjacentHTML("afterbegin", button);
};

export const renderResult = (recipes, page = 1, resPerPage = 10) => {
  const start = (page - 1) * resPerPage;
  const end = page * resPerPage;

  recipes.slice(start, end).forEach(renderRecipe);

  renderButton(page, recipes.length, resPerPage);
};
