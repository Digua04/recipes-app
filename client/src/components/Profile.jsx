import { useAuth0 } from "@auth0/auth0-react";
import { useAuthToken } from "../AuthTokenContext";
import { useEffect, useState } from "react";

export default function Profile() {
  const { user } = useAuth0();
  const [ apiUser, setAPIUser] = useState({}); 
  const { accessToken } = useAuthToken();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(false);

  const handleEditUser = async (e) => {
    setIsEditing(true);
  };

  // update the user in database
  const handleSave = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/app`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: name,
        vegetarian: isVegetarian,
      }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to update user in database');
    }
  
    const updatedUser = await response.json();
    setAPIUser(updatedUser);
    setIsEditing(false);
  };

  // get the user from database
  useEffect(() => {
    async function getUser() {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/app`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
    
      if (response.ok) {
        const apiUser = await response.json();
        setAPIUser(apiUser);
      } else {
        throw new Error('Failed to get user from database');
      }
    }
    if (accessToken) {
      getUser();
      setName(apiUser.name);
      setIsVegetarian(apiUser.vegetarian);
    }
  }, [accessToken, apiUser.name, apiUser.vegetarian]);

  return (
    <div>
      {isEditing ? (
        <div>
          <label>
            Name:
            <input type="text" value={name} onChange={e => 
              setName(e.target.value)} 
            />
          </label>
          <label>
            Vegetarian:
            <select value={isVegetarian} onChange={e => 
              setIsVegetarian(e.target.value)}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <button onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div>
          <p>Name: {name}</p>
          <button onClick={handleEditUser}>Edit User</button>
        </div>
      )}
      <div>
        <img src={user.picture} width="70" alt="profile avatar" />
      </div>
      <div>
        <p>📧 Email: {user.email}</p>
      </div>
      <div>
        <p>🥬 Vegetarian: {isVegetarian ? 'Yes' : 'No'}</p>
      </div>
      <div>
        <p>🔑 Auth0Id: {user.sub}</p>
      </div>
      <div>
        <p>✅ Email verified: {user.email_verified?.toString()}</p>
      </div>
    </div>
  );
}
