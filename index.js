require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Note = require("./models/note");
const app = express();

app.use(cors());
app.use(express.json());

let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true,
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/notes", (request, response, next) => {
  Note.find({}).then((notes) => response.json(notes));
});

app.get("/api/notes/:id", (request, response) => {
  const id = request.params.id;
  Note.findById(id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

app.delete("/api/notes/:id", (request, response, next) => {
  const id = request.params.id;
  Note.findByIdAndDelete(id)
    .then((result) => response.status(204).end())
    .catch((error) => next(error));

  response.status(204).end();
});

const generateId = () => {
  const maxId =
    notes.length > 0 ? Math.max(...notes.map((n) => Number(n.id))) : 0;

  return String(maxId + 1);
};

app.post("/api/notes", (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(404).json({ error: "Content is missing" });
  }

  const note = new Note({
    id: generateId(),
    content: body.content,
    important: body.important || false,
  });

  note.save().then((savedNote) => response.json(savedNote));
});

app.put("/api/notes/:id", (request, response, next) => {
  const id = request.params.id;
  const body = request.body;

  const note = {
    content: body.content,
    important: body.important,
  };

  Note.findByIdAndUpdate(id, note, { new: true })
    .then((updatedNote) => {
      if (updatedNote) {
        response.json(updatedNote);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT);
console.log(`Server running on port ${PORT}`);
