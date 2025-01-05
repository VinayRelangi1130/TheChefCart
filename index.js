const express = require("express");
const { open } = require("sqlite");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3");
const { request } = require("http");

const dbPath = path.join(__dirname, "database.db");

const app = express();

app.use(express.json());
app.use(cors());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// GET ALL THE POSTS OF USERS
app.get("/posts/:userid", async (request, response) => {
  const { userid } = request.params;

  const allPostsQuery = `
    SELECT * FROM Post WHERE USER_ID = ${userid};
    `;
  const query = await db.all(allPostsQuery);
  response.send(query);
});

//CREATE A POST FOR USER
app.post("/post/:userid", async (request, response) => {
  const PostDetails = request.body;
  const { userid } = request.params;
  const { title, description, images } = PostDetails;
  const addPostQuery = `
    INSERT INTO Post (Title,Description,Images, User_ID) VALUES ('${title}' , '${description}' , '${images}', ${userid} );
    `;

  const dbResponse = await db.run(addPostQuery);
  if (dbResponse.lastID) {
    const updateQuery = `
        UPDATE User set Post_Count = Post_Count + 1
        WHERE Id = ${userid};
        `;
    await db.run(updateQuery);
    response.send("Update Successfully");
  }
});


//EDIT A POST OF A USER
app.put("/edit/:userId/post/:postId" , async(request,response) => {
    const {postId,userId} = request.params;
    const PostDetails = request.body;
    const {title,description,images} = PostDetails;
    const editPostQuery = `
    UPDATE Post SET Title = '${title}' , Description = '${description}' , Images = '${images}'
    WHERE Id = ${postId} AND User_ID = ${userId};
    `;

    await db.run(editPostQuery)
    response.send("Post Edited Successfully")
})


//DELETE A POST OF A USER
app.delete("/delete/:userid/post/:postId", async (request, response) => {
  const { userid, postId } = request.params;
  const deleteQuery = `
    DELETE FROM Post WHERE User_ID = ${userid} AND Id = ${postId}
    `;
  const dbResponse = await db.run(deleteQuery);

  const updateQuery = `
        UPDATE User set Post_Count =  Post_Count - 1 
        WHERE Id = ${userid};
        `;
  await db.run(updateQuery);
  response.send("Delete Successfully");
});



//GET ALL USERS
app.get("/users", async (request, response) => {
  const getAllUsersQuery = `
    SELECT * FROM User;
    `;
  const UsersQuery = await db.all(getAllUsersQuery);
  response.send(UsersQuery);
});



//GET ALL POSTS
app.get("/posts", async (request, response) => {
  const getAllPostsQuery = `
    SELECT * FROM Post;
    `;
  const PostsArray = await db.all(getAllPostsQuery);
  response.send(PostsArray);
});
