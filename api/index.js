import * as dotenv from 'dotenv'
dotenv.config()
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from  'express-oauth2-jwt-bearer'

// this is a middleware that will validate the access token sent by the client
const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: 'RS256'
});

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// this is a public endpoint because it doesn't have the requireAuth middleware
app.get("/ping", (req, res) => {
  res.send("pong");
});

// this endpoint is used by anonymous users to get the top 5 recipes
app.get("/", async (req, res) => {
  const top5Recipes = await prisma.recipeItem.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(top5Recipes);
});

// this endpoint is used by the client to verify the user status and to 
// make sure the user is registered in our database once they signup with Auth0
// if not registered in our database we will create it.
// if the user is already registered we will return the user information
app.post("/verify-user", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
  const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/name`];

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  if (user) {
    res.json(user);
  } else {
    const newUser = await prisma.user.create({
      data: {
        email,
        auth0Id,
        name,
      },
    });

    res.json(newUser);
  }
});

// get Profile information of authenticated user
app.get("/app", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  res.json(user);
});

// update Profile information of authenticated user
app.put("/app", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const { name, vegetarian } = req.body;
  const vegetarian_bool = vegetarian === "true";

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      name,
      vegetarian: vegetarian_bool,
    },
  });

  res.json(updatedUser);
});

// requireAuth middleware will validate the access token sent by the client and will return the user information within req.auth
// get recipes created by the authenticated user
app.get("/app/recipes", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  const createdRecipes = await prisma.recipeItem.findMany({
    where: {
      createdById: user.id,
    },
  });

  res.json(createdRecipes);
});

// creates a recipe item
app.post("/app/recipes", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const { title, cook_time_minutes, video_url } = req.body;
  console.log(`Title: "${title}", Cook Time Minutes: "${cook_time_minutes}"`);
  const cook_time_minutes_int = parseInt(cook_time_minutes);

  if (!title || !cook_time_minutes) {
    res.status(400).send("title and cook time are required");
  } else {
    const newItem = await prisma.recipeItem.create({
      data: {
        title: title,
        cook_time_minutes: cook_time_minutes_int,
        video_url: video_url,
        createdBy: { connect: { auth0Id },
        },
      },
    });

    res.status(201).json(newItem);
  }
});

// deletes a recipe item by id
app.delete("/recipes/:id", requireAuth, async (req, res) => {
  const id = req.params.id;
  const auth0Id = req.auth.payload.sub;

  // delete a UserRecipe that has recipeId = id
  await prisma.userRecipe.delete({
    where: {
      recipeId: id,
      userId: req.auth.payload.sub,
    },
  });

  res.json(deletedItem);
});

// get a RecipeItem by id
app.get("/recipes/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  console.log(id);
  const recipeItem = await prisma.recipeItem.findUnique({
    where: {
      id,
    },
  });

  res.json(recipeItem);
});

// get Profile information of authenticated user
app.get("/app", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  res.json(user);
});

// this endpoint is used by the client to update the user information
app.put("/app", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { name, vegetarian } = req.body;
  
  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  if (user) {
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
        vegetarian,
      },
    });

    res.json(updatedUser);
  } else {
    res.status(404).json({ message: "user not found" });
  }
} );

// this endpoint is used by authenticated users to get all recipes
app.get("/app/all-recipes", requireAuth, async (req, res) => {

  const recipes = await prisma.recipeItem.findMany();
  res.json(recipes);
});

// get recipes favorited by the authenticated user
app.get("/app/favorites", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  const recipe = await prisma.userRecipe.findMany({
    where: {
      userId: user.id,
    },
    include: {
      recipe: true,
    },
  });
  console.log(recipe);
  res.json(recipe);
} );

// this endpoint is used by the client to favorite a recipe
app.post("/app/favorites", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  const { recipeId } = req.body;

  const userRecipe = await prisma.userRecipe.create({
    data: {
      userId: user.id,
      recipeId: recipeId,
    },
  });

  const recipe = await prisma.userRecipe.findUnique({
    where: {
      userId_recipeId: {
        userId: user.id,
        recipeId,
      },
    },
    include: {
      recipe: true,
    },
  });

  res.json(recipe);
} );

// this endpoint is used by the client to unfavorite a recipe
app.delete("/app/favorites", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  const { recipeId } = req.body;

  const userRecipe = await prisma.userRecipe.delete({
    where: {
      userId_recipeId: {
        userId: user.id,
        recipeId,
      },
    },
  });
  console.log("Deleted UserRecipe" + userRecipe.recipeId);

  res.json(userRecipe);
} );

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🎉 🚀`);
});
