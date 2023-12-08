import "../style/recipeList.css";

import { useState } from "react";
import useRecipes from "../hooks/useRecipes";
import { useAuthToken } from "../AuthTokenContext";
import { useNavigate } from "react-router-dom";

export default function Recipes() {
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemCookTime, setNewItemCookTime] = useState("");
  const [newItemVideoUrl, setNewItemVideoUrl] = useState("");
  const [recipesItems, setRecipesItems] = useRecipes();
  const { accessToken } = useAuthToken();
  const navigate = useNavigate();

  // insert a new recipe item, passing the accessToken in the Authorization header
  async function insertRecipe(newItemTitle, newItemCookTime, newItemVideoUrl) {
    console.log(`Title: "${newItemTitle}", Cook Time Minutes: "${newItemCookTime}"`);
    const data = await fetch(`${process.env.REACT_APP_API_URL}/app/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: newItemTitle,
        cook_time_minutes: newItemCookTime,
        video_url: newItemVideoUrl,
      }),
    });
    if (data.ok) {
      const recipe = await data.json();
      return recipe;
    } else {
      const errorMessage = await data.text();
      console.error('Error:', errorMessage);
      return null;
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!newItemTitle || !newItemCookTime) return;
    console.log(`Title: "${newItemTitle}", Cook Time Minutes: "${newItemCookTime}"`);
    const newRecipe = await insertRecipe(
      newItemTitle,
      newItemCookTime,
      newItemVideoUrl
    );
    console.log(newRecipe);
    if (newRecipe) {
      setRecipesItems([...recipesItems, newRecipe]);
      setNewItemTitle("");
      setNewItemCookTime("");
      setNewItemVideoUrl("");
    }
  };

  return (
    <div className="recipe-list">
      <form
        onSubmit={(e) => handleFormSubmit(e)}
        className="recipe-form"
        autoComplete="off"
      >
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          name="title"
          id="title"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="text"
          className="border-2 border-gray-500 rounded-lg"
          required
        />
        <label htmlFor="cook_time_minutes">Cook Time (minutes):</label>
        <input
          type="text"
          name="cook_time_minutes"
          id="cook_time_minutes"
          value={newItemCookTime}
          onChange={(e) => setNewItemCookTime(e.target.value)}
          placeholder="ex: 30"
          className="border-2 border-gray-500 rounded-lg"
          required
        />
        <label htmlFor="video_url">Video URL:</label>
        <input
          type="text"
          name="video_url"
          id="video_url"
          value={newItemVideoUrl}
          onChange={(e) => setNewItemVideoUrl(e.target.value)}
          placeholder="optional"
          className="border-2 border-gray-500 rounded-lg"
        />
        <br />
        <button type="submit">+ Create New Recipe</button>
        <hr />
      </form>

      <h2>My Existing Recipes</h2>
      <ul className="list">
        {recipesItems.map((item) => {
          return (
            <li key={item.id} className="recipe-item list-item">
              <h3
                onClick={() => navigate(`/recipes/${item.id}`)}
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
              >
                {item.title}
              </h3>
              <p>Cook time: {item.cook_time_minutes} minutes</p>
              {item.video_url ? (
                <video 
                  src={item.video_url}
                  alt={item.title}
                  style={{ width: '200px', maxHeight: '100px' }}
                  controls
                  onClick={ (e) => {
                    e.currentTarget.play();
                  }}
                  onMouseOut={ (e) => {
                    e.currentTarget.pause();
                  }}
                  >
                <track src="captions_en.vtt" kind="captions" srcLang="en" label="English"></track>
                </video>
                ) : (
                <div>Unavailable</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
