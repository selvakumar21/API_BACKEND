const db = require("./Database/index.js");
const BookModel = require("./Database/books");
const AuthorModel = require("./Database/authors");
const PublicationModel = require("./Database/publications");
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
app.get("/book-isbn/:isbn", async (req,res) =>{
    const {isbn} = req.params;
    const getSpecificBook = await BookModel.findOne({ISBN: isbn});
    if(getSpecificBook===null) {
        return res.json({"error": `No book found for the ISBN of ${isbn}`});
    }
    return res.json(getSpecificBook);
});

// http://localhost:3000/book-category/:category
app.get("/book-category/:category", async (req,res) =>{
    const {category} = req.params;
    const getSpecificBooks = await BookModel.find({category:category});
    if(getSpecificBooks.length==0) {
        return res.json({"error": `No book found for the Category of ${category}`});
    }
    return res.json(getSpecificBooks[0]);
});

// http://localhost:3000/authors
app.get("/authors", async (req, res) => {
    const getAllAuthors = await AuthorModel.find();
    return res.json(getAllAuthors);
});

// http://localhost:3000/author-id/:id
app.get("/author-id/:id",async (req,res) => {
    let {id} = req.params;
    id = Number(id);
    const getSpecificAuthor = await AuthorModel.findOne({id:id});
    if (getSpecificAuthor === null) {
        return res.json({"error":`No author found for the ID ${id}`});
    }
    return res.json(getSpecificAuthor);  
});

// http://localhost:3000/author-isbn/:isbn
app.get("/author-isbn/:isbn", async (req,res) =>{
    const {isbn} = req.params;
    const getSpecificAuthor = await AuthorModel.find({books:isbn});
    if (getSpecificAuthor.length===0){
        return res.json({"error":`no author found for the ISBN ${isbn}`});
    }
    return res.json(getSpecificAuthor);
})

// http://localhost:3000/publications
app.get("/publications", async (req, res) => {
    const getAllPublications = await PublicationModel.find();
    return res.json(getAllPublications);
})

// http://localhost:3000/publication-isbn/:isbn
app.get("/publication-isbn/:isbn",async (req,res) => {
    const {isbn} = req.params;
    const getSpecificPublication = await PublicationModel.find({books:isbn});
    if (getSpecificPublication.length===0) {
        return res.json({"error":`No publication was found for the ISBN ${isbn}`});
    }
    return res.json(getSpecificPublication);
})

// http://localhost:3000/book
app.post("/book", async (req, res) => {
   const addNewBook = await BookModel.create(req.body);
   return res.json({BookAdded: addNewBook, message: "New book was added!" });
});

// http://localhost:3000/author
app.post("/author", async (req, res) => {
   const addNewAuthor = await AuthorModel.create(req.body);
   return res.json({Authoradded: addNewAuthor, message: "New author was added!" });
});

// http://localhost:3000/publication
app.post("/publication", async (req, res) => {
    const addNewPublication = await PublicationModel.create(req.body);
    return res.json({Publicationadded: addNewPublication, message:"New publication was added!"});
});

// http://localhost:3000/book-update/12345ONE
app.put("/book-update/:isbn", async (req, res) => {
    const {isbn} = req.params;
    const updateBook = await BookModel.findOneAndUpdate({ISBN: isbn},req.body,{new: true});
    return res.json({BookAdded: updateBook, message: "Book was updated!" });
});

// http://localhost:3000/author-update/1
app.put("/author-update/:id", async (req, res) => {
    let{id} = req.params;
    id = Number(id);
    const updateAuthor = await AuthorModel.findOneAndUpdate({id:id},req.body,{new:true});
    return res.json({updated:updateAuthor, message: "Author was updated!"});
});

// http://localhost:3000/publication-update/1
app.put("/publication-update/:id", async (req, res) => {
    let{id} = req.params;
    id = Number(id);
   const updatePublication = await PublicationModel.findOneAndUpdate({id:id},req.body,{new:true});  
    return res.json({updated:updatePublication, message: "Publication was updated!"});
});

// http://localhost:3000/book-delete/12345ONE
app.delete("/book-delete/:isbn", async(req, res) => {
    const {isbn} = req.params;
    const filteredBooks = await BookModel.deleteOne({ISBN: isbn});
    // console.log(filteredBooks);
    return res.json({deletionDone: filteredBooks, message: "Book was deleted"});
});

// http://localhost:3000/book-author-delete/12345ONE/1
app.delete("/book-author-delete/:isbn/:id", async (req, res) => {
    const {isbn, id} = req.params;
    let getSpecificBook = await BookModel.findOne({ISBN:isbn});
    if(getSpecificBook===null){
        return res.json({"error":`no book was found for $the ISBN ${id}`})
    }
    else{getSpecificBook.authors.remove(id);
        const updateBook = await BookModel.findOneAndUpdate({ISBN:isbn}, getSpecificBook, {new:true})
        return res.json({updated:updateBook,message: "author from a book was deleted! "});
    }
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
