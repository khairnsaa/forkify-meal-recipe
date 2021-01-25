import axios from "axios";

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await axios(
        `https://forkify-api.herokuapp.com/api/get?rId=${this.id}`
      );
      //   console.log(res);
      this.title = res.data.recipe.title;
      this.publisher = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (error) {
      console.log(error);
      alert("something went wrong :(");
    }
  }

  calcTime() {
    const numIng = this.ingredients.length;
    const period = numIng / 3;
    this.time = period * 15;
  }

  totalServing() {
    this.serving = 4;
  }

  parseIngredients() {
    const unitsLong = [
      "tablespoons",
      "tablespoon",
      "ounces",
      "ounce",
      "teaspoons",
      "teaspoon",
      "cups",
      "pounds",
    ];
    const unitsShort = [
      "tbsp",
      "tbsp",
      "oz",
      "oz",
      "tsp",
      "tsp",
      "cup",
      "pound",
    ];
    const units = [...unitsShort, "kg", "g"];

    const newIngredients = this.ingredients.map((el) => {
      //uniforms unit
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });

      // 2) Remove parentheses
      ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");

      // parse ingredient into count
      const arrIng = ingredient.split(" ");
      const unitIndex = arrIng.findIndex((el2) => units.includes(el2));

      let objIng;
      if (unitIndex > -1) {
        // if theres a unit
        const arrCount = arrIng.slice(0, unitIndex);
        let count;

        if (arrCount.length === 1) {
          count = eval(arrIng[0].replace("-", "+"));
        } else {
          count = eval(arrIng.slice(0, unitIndex).join("+"));
        }

        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(" "),
        };
      } else if (parseInt(arrIng[0], 10)) {
        // if theres no unit but the 1st element is number
        objIng = {
          count: parseInt(arrIng[0], 10),
          unit: "",
          ingredient: arrIng.slice(1).join(" "),
        };
      } else if (unitIndex === -1) {
        // if theres no unit and no first number
        objIng = {
          count: 1,
          unit: "",
          // ingredient : ingredient, // penulisan sama saja seperti di bawah
          ingredient,
        };
      }

      return objIng;
    });

    this.ingredients = newIngredients;
  }

  updateServings(type) {
    // servimgs
    const newServings = type === "dec" ? this.serving - 1 : this.serving + 1;

    //ingredient
    this.ingredients.forEach((ing) => {
      ing.count *= newServings / this.serving;
    });

    this.serving = newServings;
  }
}
