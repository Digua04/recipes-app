import "../style/recipeList.css";

import { useEffect, useState } from "react";
import { useAuthToken } from "../AuthTokenContext";
import ItemRow from "./ItemRow";


export default function Favorites() {
  const { accessToken } = useAuthToken();

  const [favoritedRecipes, setFavoritedRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [searchItems, setSearchItems] = useState(allRecipes);

  // favorites a recipe item, passing the accessToken in the Authorization header
  async function favoriteARecipe(recipeId) {
    const data = await fetch(`${process.env.REACT_APP_API_URL}/app/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        recipeId: recipeId,
      }),
    });
    if (data.ok) {
      const userRecipe = await data.json();
      setUserRecipes([...userRecipes, userRecipe]);
      return userRecipe;
    } else {
      return null;
    }
  }

  // unfavorites a recipe item, passing the accessToken in the Authorization header
  async function unfavoriteARecipe(recipeId) {
    const data = await fetch(`${process.env.REACT_APP_API_URL}/app/favorites`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        recipeId: recipeId,
      }),
    });
    if (data.ok) {
      setUserRecipes(userRecipes.filter(
        (userRecipe) => userRecipe.recipe.id !== recipeId));
    } else {
      return null;
    }
  }

  // gets all favorited recipes
  useEffect(() => {
    async function getFavoritedRecipes() {
      const data = await fetch(
        `${process.env.REACT_APP_API_URL}/app/favorites`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const recipes = await data.json();
      if (recipes) {
        setFavoritedRecipes(
          recipes.map((recipe) => recipe.recipe));
      }
      else {
        setFavoritedRecipes([]);
      }
    }
    if (accessToken) {
      getFavoritedRecipes();
    }
  }, [accessToken, userRecipes]);


  // gets all recipes
  useEffect(() => {
    async function getAllRecipes() {
      const data = await fetch(
        `${process.env.REACT_APP_API_URL}/app/all-recipes`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
      const allRecipes = await data.json();
      if (allRecipes) {
        setAllRecipes(allRecipes);
      }
    }

    if (accessToken) {
      getAllRecipes();
    }
  }, [accessToken]);

  // sets the search state
  function setSearch(search) {
    setSearchItems(
      allRecipes?.filter((recipe) => {
      return recipe.title.toLowerCase().includes(search.toLowerCase()) ||
        recipe.cook_time_minutes.toString() === search;
      })
    );
  }
  
  // sets the search state when allRecipes changes
  useEffect(() => {
    setSearchItems(allRecipes);
  }, [allRecipes]);

  return (
    <div className="recipe-list">
      <div className="favorited-recipes">
        <h2>Favorited Recipes</h2>
        <ul className="list">
            {favoritedRecipes?.map((item, i) => (
              <ItemRow
              key={`${i}-${item.id}`}
              item = {item}
              favoriteARecipe={favoriteARecipe}
              unfavoriteARecipe={unfavoriteARecipe}
              setFavoritedRecipes={setFavoritedRecipes}
              favoritedRecipes={favoritedRecipes}
              />
            ))}
        </ul>
        <br />
      < hr />
      </div>

      <div className="all-recipes">
        <h2>All Recipes</h2>
        <div className="recipe-picker">
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Search by title or cook time"
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />

          <ul className="list">
            {searchItems?.map((item, i) => (
              <ItemRow
              key={`${i}-${item.id}`}
              item = {item}
              favoriteARecipe={favoriteARecipe}
              unfavoriteARecipe={unfavoriteARecipe}
              setFavoritedRecipes={setFavoritedRecipes}
              favoritedRecipes={favoritedRecipes}
              />
            ))}
          </ul>
        </div>
      </div>
      </div>
  );
}
