import "../style/home.css";

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const signUp = () => loginWithRedirect({ screen_hint: "signup" });
  const [top5Recipes, setTop5Recipes] = useState([]);

  useEffect(() => {
    async function getTop5Recipes() {
      const response = await fetch(`${process.env.REACT_APP_API_URL}`);
      const data = await response.json();
      console.log(data);
      setTop5Recipes(data);
    }
    
    getTop5Recipes();
  }, []);

  return (
    <div className="home">
      <h1>Recipes App</h1>
      <br />
      <div>
        {!isAuthenticated ? (
          <button className="btn-primary" onClick={loginWithRedirect}>
            Login
          </button>
        ) : (
          <button className="btn-primary" onClick={() => navigate("/app")}>
            Enter App
          </button>
        )}
      </div>
      <div>
        <button className="btn-secondary" onClick={signUp}>
          Create Account
        </button>
      </div>
      <div className="home_top5Recipes">
        <h2>Top 5 Recipes</h2>
        <ul className="list">
          {top5Recipes.map((item) => {
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
                  />
                  ) : (
                  <div></div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
