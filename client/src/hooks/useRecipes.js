import { useState, useEffect } from "react";
import { useAuthToken } from "../AuthTokenContext";

// this is a custom hook that fetches the recipes items from the API
// custom hooks are a way to share logic between components
export default function useRecipes() {
  const [recipesItems, setRecipesItems] = useState([]);
  const { accessToken } = useAuthToken();

  useEffect(() => {
    async function getRecipesFromApi() {
      // fetch the recipes from the API, passing the access token in the Authorization header
      const data = await fetch(`${process.env.REACT_APP_API_URL}/app/recipes`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const recipes = await data.json();

      setRecipesItems(recipes);
    }

    if (accessToken) {
      getRecipesFromApi();
    }
  }, [accessToken]);

  return [recipesItems, setRecipesItems];
}
