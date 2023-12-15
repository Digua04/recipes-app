import "../style/recipeList.css";

import React, { useEffect, useState } from "react";

export default function LatestFeeds() {
  const [recipesItems, setRecipesItems] = useState([]);

  const url = 
    'https://tasty.p.rapidapi.com/feeds/list?size=5&timezone=%2B0700&vegetarian=false&from=0';
  const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': '0376453986msh8a9ba40647ed4c5p1dd452jsnd2f092c8aedb',
        'X-RapidAPI-Host': 'tasty.p.rapidapi.com',
        },
    };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, options);
        const result = await response.json();
        const newRecipes = result.results[4].items;
        setRecipesItems(newRecipes);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
    }, []);

  return (
    <div className="recipe-list">
      <h2>Trending Recipes</h2>
      <ul className="list">
        {recipesItems?.map((item) => {
          return (
            <li key={item.id} className="recipe-item list-item">
              <h3>
                {/* <a
                  href={item.original_video_url} 
                  target="_blank"
                  style={{ textDecoration: 'underline', cursor: 'pointer' }}
                > */}
                {item.name}
                {/* </a> */}
              </h3>
              <p>Cook time: {item.cook_time_minutes ? 
                `${item.cook_time_minutes}  minutes` : 'Unavailable'}</p>
              {item.thumbnail_url ? (
                <img 
                  src={item.thumbnail_url}
                  alt={item.name}
                  style={{ width: '200px', maxHeight: '100px' }}
                  >
                </img>
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
