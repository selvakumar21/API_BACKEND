const db = require("./Database/index.js");
const BookModel = require("./Database/books");
const express = require("express");
const app = express();
app.use(express.json()); //middleware 


// OPTION 1

var mongoose = require('mongoose');
// Set up default mongoose connection
var mongoDB = 'mongodb+srv://selva_21:greenwood@cluster0.mhtlm.mongodb.net/book-company?retryWrites=true&w=majority';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => console.log("CONNECTION ESTABLISED"));


// OPTION 2

// const { MongoClient } = require('mongodb');
// const uri = "mongodb+srv://selva_21:greenwood@cluster0.mhtlm.mongodb.net/book-company?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const bcollection = client.db("book-company").collection("books").findOne({ISBN: "12345Three" });
//   bcollection.then((data)=> console.log(data)).catch((err)=> console.log(err));
//   console.log(bcollection);
  // perform actions on the collection object
//   client.close();
// });



// http://localhost:3000/
app.get("/", (req, res) => {
    return res.json({"Welcome": `to my book backend software`});
})

// http://localhost:3000/books
app.get("/books", async (req, res) => {
    const getAllBooks = await BookModel.find();
    return res.json(getAllBooks);
})

// http://localhost:3000/book-isbn/:isbn
app.get("/book-isbn/:isbn", (req,res) =>{
    const {isbn} = req.params;
    const getSpecificBook = db.books.filter((book) => book.ISBN ===isbn);
    if(getSpecificBook.length===0) {
        return res.json({"error": `No book found for the ISBN of ${isbn}`});
    }
    return res.json(getSpecificBook[0]);
});

// http://localhost:3000/book-category/:category
app.get("/book-category/:category", (req,res) =>{
    const {category} = req.params;
    const getSpecificBooks = db.books.filter((book) => book.category.includes(category));
    if(getSpecificBooks.length==0) {
        return res.json({"error": `No book found for the Category of ${category}`});
    }
    return res.json(getSpecificBooks[0]);
});

// http://localhost:3000/authors
app.get("/authors", (req, res) => {
    const getAllAuthors = db.authors;
    return res.json(getAllAuthors);
});

// http://localhost:3000/author-id/:id
app.get("/author-id/:id",(req,res) => {
    let {id} = req.params;
    id = Number(id);
    const getSpecificAuthor = db.authors.filter((author) => author.id === id);
    if (getSpecificAuthor.length === 0) {
        return res.json({"error":`No author found for the ID ${id}`});
    }
    return res.json(getSpecificAuthor[0]);  
});

// http://localhost:3000/author-isbn/:isbn
app.get("/author-isbn/:isbn", (req,res) =>{
    const {isbn} = req.params;
    const getSpecificAuthor = db.books.filter((author) => author.ISBN === isbn)
    if (getSpecificAuthor===0){
        return res.json({"error":`no author found for the ISBN ${isbn}`});
    }
    return res.json(getSpecificAuthor[0].authors);
})

// http://localhost:3000/publications
app.get("/publications", (req, res) => {
    const getAllPublications = db.publications;
    return res.json(getAllPublications);
})

// http://localhost:3000/publication-isbn/:isbn
app.get("/publication-isbn/:isbn",(req,res) => {
    const {isbn} = req.params;
    const getSpecificPublication = db.books.filter((publication) => publication.ISBN === isbn);
    if (getSpecificPublication.length === 0) {
        return res.json({"error":`No publication was found for the ISBN ${isbn}`});
    }
    return res.json(getSpecificPublication[0].publication);
})

// http://localhost:3000/book
app.post("/book", (req, res) => {
    db.books.push(req.body);
    console.log(db.books);
    return res.json(db.books);
});

// http://localhost:3000/author
app.post("/author", (req, res) => {
    db.authors.push(req.body);
    console.log(db.authors);
    return res.json(db.authors);
});

// http://localhost:3000/publication
app.post("/publication", (req, res) => {
    db.publications.push(req.body);
    console.log(db.publications);
    return res.json(db.publications);
});

// http://localhost:3000/book-update/12345ONE
app.put("/book-update/:isbn", (req, res) => {
    console.log(req.body);
    console.log(req.params);
    const {isbn} = req.params;
    db.books.forEach((book) => {
        if(book.ISBN === isbn) {
            console.log({...book, ...req.body});
            return {...book, ...req.body};
        }
        return book;
    })
    return res.json(db.books);
});

// http://localhost:3000/author-update/1
app.put("/author-update/:id", (req, res) => {
    let{id} = req.params;
    id = Number(id);
    db.authors.forEach((author) => {
        if(author.id === id){
            return {...author, ...req.body};
        }
        return author;
    })
    return res.json(db.authors);
});

// http://localhost:3000/publication-update/1
app.put("/publication-update/:id", (req, res) => {
    let{id} = req.params;
    id = Number(id);
    db.publications.forEach((publication) =>{
        if(publication.id === id){
            console.log({...publication, ...req.body});
            return{...publication, ...req.body};
        }
        return publication;
    })
    return res.json(db.publications);
});

// http://localhost:3000/book-delete/12345ONE
app.delete("/book-delete/:isbn", (req, res) => {
    const {isbn} = req.params;
    const filteredBooks = db.books.filter((book) => book.ISBN!==isbn);
    console.log(filteredBooks);
    db.books = filteredBooks;
    return res.json(db.books);
});

// http://localhost:3000/book-author-delete/12345ONE/1
app.delete("/book-author-delete/:isbn/:id", (req, res) => {
    let {isbn, id} = req.params;
    id = Number(id);
    db.books.forEach((book) => {
        if(book.ISBN===isbn) {
            if(!book.authors.includes(id)) {
                return;
            }
            book.authors = book.authors.filter((author) => author!==id);
            return book;
        }
        return book;
    })    
    return res.json(db.books);
});

// http://localhost:3000/author-book-delete/1/12345ONE
app.delete("/author-book-delete/:id/:isbn", (req,res) => {
    let{id, isbn} = req.params;
    id= Number(id);
    db.authors.forEach((author) => {
        if(author.id===id){
            if(!author.books.includes(isbn)){
                return;
            }
            author.books = author.books.filter((book) => book!==isbn);
            return author;
        }
        return author;
    })
    return res.json(db.authors);
});




app.listen(3000, () =>{
    console.log("EXPRESS APP IS RUNNIN....");
})
