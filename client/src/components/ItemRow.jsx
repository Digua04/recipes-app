import "../style/recipeList.css"

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ItemRow({ 
  item, favoriteARecipe, unfavoriteARecipe, favoritedRecipes}) {
  const navigate = useNavigate();
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const isFavorited = favoritedRecipes?.find(
      (recipe) => recipe.id === item.id);
    if (isFavorited) {
      setFavorited(true);
    } else {
      setFavorited(false);
    }
  }
  , [favoritedRecipes, item.id]);

  return (
    <li aria-label={`item-${item.id}`}>
      <div className="item-details">
        <div className="item-content">
          <h3
            onClick={() => navigate(`/recipes/${item.id}`)}
            style={{ textDecoration: 'underline', cursor: 'pointer' }}
          >
            {item.title}
          </h3>
          <p className="cook-time">⏱️ Cook Time: {item?.cook_time_minutes} minutes</p>
        </div>
        <div>
          <button
            type="button"
            aria-label={favorited ? `favorite ${item?.id}` : `unfavorite ${item?.id}`}
            className={"favorite-button"}
            onClick={(e) => {
              if (favorited) {
                unfavoriteARecipe(item.id);
                console.log(`unfavorite id ${item.id}`);
              } else {
                favoriteARecipe(item.id);
                console.log(`favorite id ${item.id}`);
              }
            }}
          >
            {favorited ? "❤️" : "🤍"}
          </button>
        </div>
      </div>
    </li>
  );
}