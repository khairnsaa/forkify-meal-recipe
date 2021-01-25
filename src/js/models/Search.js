import axios from "axios";

export default class Search {
  constructor(query) {
    this.query = query;
  }
  async getRecipe() {
    try {
      const res = await axios(
        `https://forkify-api.herokuapp.com/api/search?&q=${this.query}`
      );
      this.results = res.data.recipes;
      console.log(this.results);
    } catch (error) {
      console.log(error);
      alert(`Sorry there are no ${this.query} recipe here`);
    }
  }
}
