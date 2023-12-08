import "../style/appLayout.css";
import { useParams, Link } from "react-router-dom";
import React, { useEffect, useState } from "react";

// this component is not implemented yet
export default function RecipeDetail() {
  const [recipe, setRecipe] = useState();
  const params = useParams();

  useEffect(() => {
    async function getRecipeDetails() {
      const data = await fetch(
        `${process.env.REACT_APP_API_URL}/recipes/${params.id}`);
      const recipe = await data.json();
      if (recipe) {
        setRecipe(recipe);
      }
    }

    if (params.id) {
      getRecipeDetails();
    }
  }, [params]);
  
  return (
    <div className="recipe-picker">
      <Link to="/app/recipes"> ⬅️ Back</Link>
      <br />
      <div className="header">
        <p>🍴 {recipe?.title}</p>
      </div>
      <div className="content" 
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}
      >
        <div>
          <p>⏱️ Cook Time: {recipe?.cook_time_minutes} minutes</p>
        </div>
        <div>
          <p>📲 Updated at: {new Date(recipe?.updatedAt).toLocaleString(
            "en-CA", { dateStyle: "full", 
            timeStyle: "short", 
            timeZone: "America/Vancouver"}
          )}</p>
        </div>
        {recipe?.video_url ? (
          <video 
            src={recipe.video_url} 
            alt={recipe.title}
            style={{ width: '400px', maxHeight: '200px' }}
            controls
            onClick={ (e) => {
              e.currentTarget.play();
            }}
            onMouseOut={ (e) => {
              e.currentTarget.pause();
            }}
          />
          ) : (
          <div>🎥 Video: Unavailable</div>
        )}
      </div>
    </div>
  );
}
